const cloudinary = require('cloudinary').v2;

const credentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (Object.values(credentials).some((value) => !value)) {
  console.error(
    'Configurez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.',
  );
  process.exit(1);
}

cloudinary.config(credentials);

// Test 1: Vérification des identifiants (Admin API)
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Échec de la connexion (403/Authentification) :', error);
  } else {
    console.log('✅ Connexion Cloudinary réussie :', result);

    // Test 2: Upload d'une image de test en base64
    const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    cloudinary.uploader.upload(sampleImage, { folder: 'test_folder' }, (uploadErr, uploadRes) => {
      if (uploadErr) {
        console.error('❌ Échec de l\'upload d\'image :', uploadErr);
      } else {
        console.log('✅ Upload réussi ! URL :', uploadRes.secure_url);
      }
    });
  }
});