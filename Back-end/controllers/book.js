const Book = require('../models/book');
const fs = require('fs');
const path = require('path');

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
        if (!req.file) {
            throw new Error("Aucun fichier d'image n'a été téléchargé.");
        }

        const bookObject = JSON.parse(req.body.book);
        const book = new Book({
            ...bookObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            userId: req.user.id // Associe le livre à l'utilisateur authentifié
        });

        await book.save();
        res.status(201).json({ message: 'Livre créé avec succès !', book });
    } catch (error) {
        console.error("Erreur lors de la création du livre :", error);
        res.status(500).json({ error: error.message || 'Erreur du serveur.' });
    }
};




// Modifier un livre existant avec image
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        if (book.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };

        // Supprime l'ancienne image si une nouvelle est envoyée
        if (req.file) {
            const oldImagePath = path.join(__dirname, '../images', book.imageUrl.split('/images/')[1]);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error("Erreur lors de la suppression de l'image :", err);
            });
        }

        const updatedBook = await Book.findByIdAndUpdate(req.params.id, bookObject, { new: true });
        res.status(200).json({ message: 'Livre modifié avec succès !', updatedBook });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Supprimer un livre par ID
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        if (book.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Action non autorisée' });
        }

        // Supprime l'image associée au livre
        const imagePath = path.join(__dirname, '../images', book.imageUrl.split('/images/')[1]);
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Erreur lors de la suppression de l'image :", err);
        });

        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: `Le livre "${book.title}" a été supprimé avec succès !` });
    } catch (error) {
        res.status(500).json({ error });
    }
};

