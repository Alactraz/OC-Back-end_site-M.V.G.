const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer-config'); 
const bookController = require('../controllers/book');
const auth = require('../middleware/auth'); //middleware pour s'authentifier

// Route pour afficher tous les livres
router.get('/', bookController.getAllBooks);

// Route pour afficher un livre par ID
router.get('/:id', bookController.getBookById);

// Route pour créer un nouveau livre avec image
router.post('/', auth, upload.single('image'), bookController.createBook);

// Route pour modifier un livre existant avec image
router.put('/:id', auth, upload.single('image'), bookController.updateBook);

// Route pour supprimer un livre par ID
router.delete('/:id', auth, bookController.deleteBook); // Nouvelle route

// Route pour ajouter une note à un livre
router.post('/:id/rating', auth, bookController.rateBook);

// Export du routeur
module.exports = router;
