const Book = require('../models/book');
const fs = require('fs');

// Afficher tous les livres
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Afficher un livre par ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Créer un nouveau livre avec image
exports.createBook = async (req, res) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        const book = new Book({
            ...bookObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        await book.save();
        res.status(201).json({ message: 'Livre créé avec succès !', book });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Modifier un livre existant avec image
exports.updateBook = async (req, res) => {
    try {
        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

        const book = await Book.findByIdAndUpdate(req.params.id, bookObject, { new: true });
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Supprimer l'ancienne image si une nouvelle est ajoutée
        if (req.file) {
            const oldBook = await Book.findById(req.params.id);
            const oldImagePath = oldBook.imageUrl.split('/images/')[1];
            fs.unlink(`images/${oldImagePath}`, (err) => {
                if (err) console.error("Erreur lors de la suppression de l'image :", err);
            });
        }

        res.status(200).json({ message: 'Livre modifié avec succès !', book });
    } catch (error) {
        res.status(500).json({ error });
    }
};
