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
        console.log("Requête reçue :", req.body);
        console.log("Fichier reçu :", req.file);

        const bookObject = JSON.parse(req.body.book);
        console.log("Objet du livre :", bookObject);

        const book = new Book({
            ...bookObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        await book.save();
        console.log("Livre créé avec succès !");
        res.status(201).json({ message: 'Livre créé avec succès !', book });
    } catch (error) {
        console.error("Erreur lors de la création du livre :", error);
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

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Si une nouvelle image est envoyée, supprimez l'ancienne image
        if (req.file) {
            const oldImagePath = path.join(__dirname, '../images', book.imageUrl.split('/images/')[1]);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error("Erreur lors de la suppression de l'image :", err);
            });
        }

        // Mettre à jour le livre
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, bookObject, { new: true });
        res.status(200).json({ message: 'Livre modifié avec succès !', updatedBook });
    } catch (error) {
        res.status(500).json({ error });
    }
};
