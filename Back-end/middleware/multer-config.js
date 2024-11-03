const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chemin vers le dossier images
const imagesPath = path.join(__dirname, '../images');

// Vérifie si le dossier images existe, sinon le crée
if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
}

// Configuration de Multer pour gérer le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, imagesPath); // Définit le dossier de stockage
    },
    filename: (req, file, callback) => {
        // Crée un nom de fichier unique
        const name = file.originalname.split(' ').join('_').split('.')[0]; // Retire l'extension
        const extension = path.extname(file.originalname); // Récupère l'extension
        const fileName = `${name}_${Date.now()}${extension}`; // Combine le nom unique avec un timestamp
        callback(null, fileName);
    }
});

// Crée une instance de Multer avec la configuration de stockage
const upload = multer({ storage: storage });

module.exports = upload;
