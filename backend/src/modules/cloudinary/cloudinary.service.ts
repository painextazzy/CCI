import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import 'multer';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new Error('Buffer du fichier manquant'));
      }

   const uploadStream = cloudinary.uploader.upload_stream(
  {
    folder: folder, // Ex: 'cci_kbis_documents'
    upload_preset: 'cci_preset', // <--- Mettre le nom exact de votre preset ici
    resource_type: 'auto', // Permet de gérer automatiquement les PDF et les images (JPG, PNG)
  },
  (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
    if (error) return reject(error);
    if (!result) return reject(new Error('Aucune réponse reçue de Cloudinary'));
    resolve(result);
  },
);

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }
}