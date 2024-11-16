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
    if (req.file) {
        const filePath = path.join(imagesPath, req.file.filename);
        const optimizedPath = path.join(imagesPath, `optimized_${req.file.filename}`);

        try {
            await sharp(filePath)
                .resize({ width: 800 })
                .toFormat('webp')
                .toFile(optimizedPath);

            fs.unlinkSync(filePath);
            req.file.filename = `optimized_${req.file.filename}`;
        } catch (err) {
            console.error('Erreur lors de l’optimisation de l’image avec Sharp :', err);
            return res.status(500).json({ error: 'Erreur lors de l’optimisation de l’image.' });
        }
    }
    next();
};

module.exports = { upload, optimizeImage };
