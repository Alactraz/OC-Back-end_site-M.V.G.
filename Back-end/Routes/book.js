const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const upload = require('../middleware/multer-config'); // Import de Multer

// Routes pour les livres
router.get('/', bookCtrl.getAllBooks); // Afficher tous les livres
router.get('/:id', bookCtrl.getBookById); // Afficher un livre par ID
router.post('/', upload.single('image'), bookCtrl.createBook); // Créer un livre avec image
router.put('/:id', upload.single('image'), bookCtrl.updateBook); // Modifier un livre avec image

module.exports = router;