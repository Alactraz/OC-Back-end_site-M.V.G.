const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesPath = path.join(__dirname, '../images');

if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, imagesPath);
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_').split('.')[0];
        const extension = path.extname(file.originalname);
        const fileName = `${name}_${Date.now()}${extension}`;
        callback(null, fileName);
    }
});

const upload = multer({ storage: storage });

const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier d'image fourni." });
    }

    const inputPath = req.file.path; // Chemin du fichier uploadé
    const outputPath = path.join(path.dirname(inputPath), `optimized-${req.file.filename}`); // Nouveau chemin

    try {
        // Optimisation avec Sharp
        sharp.cache(false);
        await sharp(inputPath)
            .resize({ width: 800 }) // Exemple : Redimensionne à une largeur de 800px
            .toFormat('webp')       // Convertit l'image au format WebP
            .toFile(outputPath);
    

        // Vérifie si le fichier existe avant de tenter sa suppression
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath); // Supprime le fichier original
        }

        // Met à jour le chemin de l'image optimisée dans req.file
        req.file.path = outputPath;
        req.file.filename = `optimized-${req.file.filename}`;

        next();
    } catch (error) {
        console.error("Erreur lors de l'optimisation de l'image avec Sharp :", error.message);
        return res.status(500).json({ error: "Erreur lors de l’optimisation de l’image." });
    }
};


module.exports = { upload, optimizeImage };
