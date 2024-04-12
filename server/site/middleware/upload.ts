import multer from 'multer'
import util from 'util'
import {GridFsStorage} from 'multer-gridfs-storage'

const storage = new GridFsStorage({
    url: "mongodb://127.0.0.1:27017/game",
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      const match = ["image/png", "image/jpeg"];
  
      if (match.indexOf(file.mimetype) === -1) {
        const filename = `${Date.now()}-profile-${file.originalname}`;
        return filename;
      }
  
      return {
        bucketName: "profilePics",
        filename: `${Date.now()}-profile-${file.originalname}`
      };
    }
  });
  
  export const upload = multer({ storage: storage })
// export const upload = util.promisify(multer({ storage: storage }).single("file"))

