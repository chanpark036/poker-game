import multer from 'multer'
import {GridFsStorage} from 'multer-gridfs-storage'
// const GridFsStorage = require('multer-gridfs-storage')
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'

const storage = new GridFsStorage({
    url: process.env.MONGO_URL+'/game',
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req: any, file: any) => {
      const match = ["image/png", "image/jpeg"];
  
      if (match.indexOf(file.mimetype) === -1) {
        const filename = `${file.originalname}`;
        return filename;
      }
  
      return {
        bucketName: "profilePics",
        filename: `${file.originalname}`
      };
    }
  });
  
export const upload = multer({ storage: storage, limits: {fileSize: 3000000}})
// export const upload = util.promisify(multer({ storage: storage }).single("file"))


export const dontCache = (req: any, res: any, next: any) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Expires', '0');
  next();
};


