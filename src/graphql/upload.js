import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

// upload.js

const s3client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const fileFilter = (req, file, next) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    next(null, true);
  } else {
    next(null, false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3client,
    bucket: 'buuckete',
    acl: 'public-read',
    key: function (req, file, cb) {
      const { username } = req.query;
      if (!username) {
        return cb(new Error('Username not provided'));
      }
      // Include username in the file key
      const fileName = `${username}`;
      cb(null, 'uploads/' + fileName);
    },
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

export { s3client, upload };
