import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import { Collection, Db, MongoClient, ObjectId, WithoutId } from 'mongodb'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { Issuer, Strategy, generators } from 'openid-client'
import passport from 'passport'
import { Strategy as CustomStrategy } from "passport-custom"
import cors from 'cors'
import { gitlab } from '../secrets'
import {Player} from '../game/model'
import { PlayerProfileInfo, ProfilePicChunk, ProfilePicFile } from './data'
import { upload, dontCache}from './middleware/upload'

const HOST = process.env.HOST || "127.0.0.1"
const GROUP_ID = ""
// const DISABLE_SECURITY = !!process.env.DISABLE_SECURITY
const DISABLE_SECURITY = false

// set up Mongo
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const client = new MongoClient(mongoUrl)
let db: Db
let players: Collection<Player>
let profilePicFiles: Collection<ProfilePicFile>
let profilePicChunks: Collection<ProfilePicChunk>

// set up Express
const app = express()
const port = parseInt(process.env.PORT) || 8102

// set up body parsing for both JSON and URL encoded
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set up Pino logging
const logger = pino({ transport: { target: 'pino-pretty' } })
app.use(expressPinoLogger({ logger }))

// set up CORS
app.use(cors({
  origin: "http://localhost:8100",
  credentials: true,
}))

// set up session
app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017',
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}))
declare module 'express-session' {
  export interface SessionData {
    credits?: number
  }
}

app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user: any, done) => {
  console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user: any, done) => {
  console.log("deserializeUser", user)
  done(null, user)
})

app.get('/api/login', passport.authenticate('oidc', {
  successReturnToOrRedirect: "/"
}))

app.get('/api/login-callback', passport.authenticate('oidc', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/',
}))

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401)
    return
  }

  next()
}


function checkRole(requiredRoles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const roles = req.user?.roles || [];
    const hasRequiredRole = roles.some((role: string) => requiredRoles.includes(role));
    console.log("hasRequiredRole", hasRequiredRole)
    if (hasRequiredRole) {
      next(); // User has one of the required roles, proceed
    } else {
      console.log("hasRequiredRole2", hasRequiredRole)

      res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }
  };
}

// app routes
app.post(
  "/api/logout",
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      res.redirect("/")
    })
  }
)

app.get("/api/user", (req, res) => {
    res.json(req.user || {})
  })


app.post("/api/profileInfo/uploadPicture", upload.single('file'), checkAuthenticated, checkRole(["player"]), async (req, res) => {
    try {
        console.log(req.file);
        
        if (req.file == null) {
            res.status(500).json({ message: "You must select file"})
        }

      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    res.redirect('/profile');
})

app.delete("/api/profileInfo/deletePicture", checkAuthenticated, checkRole(["player"]), async (req, res) => {
    const id = req.user.preferred_username
    try{
        const profilePicFile = await profilePicFiles.findOne({ filename: id+".png"})
        if(profilePicFile){
            const chunkId = profilePicFile._id
            await profilePicFiles.deleteOne({filename: id+".png"})
            await profilePicChunks.deleteOne({files_id: chunkId})
            res.status(200).json({ message: 'successful'})
        }
        else{
            res.status(300).json({ error: 'No image found' });
        }
        // const profilePicFile = await profilePicFiles.findOneAndDelete({ filename: _id+".png"},{projection: {_id:1},includeResultMetadata:false})
        // const chunkId = profilePicFile
        // await profilePicChunks.findOneAndDelete({files_id: chunkId})
        // res.status(200).json({ message: 'successful'})
    } catch (e){
        console.log(e);
        res.status(500).json({ error: 'Server Errored' });
    }
    res.redirect('/profile');
})


app.get("/api/profileInfo/getPicture", checkAuthenticated, dontCache,checkRole(["player"]), async (req, res) => {
    const id = req.user.preferred_username
    console.log('getPicture id '+id)
    const profilePicFile = await profilePicFiles.findOne({ filename: id+".png"})
    if(profilePicFile){
        const chunkId = profilePicFile._id
        const chunk = await profilePicChunks.findOne({files_id: chunkId})
        res.status(200).json({ message: "ok",body: chunk.data })
    }
    else{
        res.status(300).json({message: "no picture in db", body: ''})
    }
})


app.get("/api/profileInfo", checkAuthenticated, checkRole(["player"]),async (req,res) => {
    try{
        const _id = req.user.preferred_username
        const player: Partial<Player> | null = await players.findOne({ _id })
        if (player == null) {
            res.status(404).json({ _id })
            return
        }
        res.status(200).json(player)
    }
    catch(e){
        console.log("error: ", e)
        res.status(500).json({ error: 'Internal server error' });
    }

})

app.post("/api/profileInfo/save", checkAuthenticated, checkRole(["player"]), async (req, res) => {
    const playerInfo: PlayerProfileInfo = req.body
    const result = await players.updateOne(
      {
        _id: req.user.preferred_username,
      },
      {
        $set: {
            ...playerInfo
          }
      },
      {
        upsert: true
      }
    )
    res.status(200).json({ status: "ok" })

  })


client.connect().then(async () => {
    logger.info('connected successfully to MongoDB')
    db = client.db("game")
    players = db.collection("players")
    profilePicChunks = db.collection("profilePics.chunks")
    profilePicFiles = db.collection("profilePics.files")

    
    if (DISABLE_SECURITY) {
      passport.use("oidc", new CustomStrategy((req, done) => done(null, { preferred_username: req.query.user, roles: req.query.role })))
    } else {
      const issuer = await Issuer.discover("https://coursework.cs.duke.edu/")
      const client = new issuer.Client(gitlab)
  
      const params = {
        scope: 'openid profile email',
        nonce: generators.nonce(),
        redirect_uri: `http://${HOST}:8100/api/login-callback`,
        state: generators.state(),
  
        // this forces a fresh login screen every time
        prompt: "login",
      }
  
      async function verify(tokenSet: any, userInfo: any, done: any) {
        logger.info("oidc " + JSON.stringify(userInfo))
        console.log('userInfo', userInfo)
        userInfo.roles = userInfo.groups.includes(GROUP_ID) ? ["admin"] : ["player"]
        return done(null, userInfo)
      }
  
      passport.use('oidc', new Strategy({ client, params }, verify))
    }
  
    app.listen(port, () => {
      console.log(`Poker server listening on port ${port}`)
    })
  })
  