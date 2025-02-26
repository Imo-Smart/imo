import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { isAdmin, isAuth } from '../utils.js';

const upload = multer();

const uploadRouter = express.Router();

uploadRouter.post(
  '/',
  isAuth,
  isAdmin,
  upload.array('files', 10), // Permite até 10 arquivos no upload
  async (req, res) => {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const streamUpload = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' }, // Define o tipo de recurso
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      };

      // Processar todas as imagens em paralelo
      const uploadPromises = req.files.map((file) => streamUpload(file));
      const results = await Promise.all(uploadPromises);

      res.send(results);
    } catch (error) {
      res.status(500).send({ error: 'Erro no upload das imagens', details: error.message });
    }
  }
);

export default uploadRouter;
