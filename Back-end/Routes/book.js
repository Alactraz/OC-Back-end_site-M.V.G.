const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer-config'); // Vérifiez le chemin
const bookController = require('../controllers/book');

// Route pour afficher tous les livres
router.get('/', bookController.getAllBooks);

// Route pour afficher un livre par ID
router.get('/:id', bookController.getBookById);

// Route pour créer un nouveau livre avec image
router.post('/', upload.single('image'), bookController.createBook);

// Route pour modifier un livre existant avec image
router.put('/:id', upload.single('image'), bookController.updateBook);

// Route pour supprimer un livre par ID
router.delete('/:id', bookController.deleteBook); // Nouvelle route

// Export du routeur
module.exports = router;
