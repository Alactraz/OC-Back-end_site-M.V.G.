const multer = require('multer');
const path = require('path');

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images'); // Dossier de destination des images
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = path.extname(file.originalname);
        callback(null, name + Date.now() + extension);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
        callback(null, true);
    } else {
        callback(new Error('Seules les images sont autorisées !'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
