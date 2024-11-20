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

// Fonction pour valider une note
const validateGrade = (grade) => {
    if (isNaN(grade) || grade < 1 || grade > 5) {
        throw new Error("La note doit être un nombre compris entre 1 et 5.");
    }
};

// Créer un nouveau livre avec image
exports.createBook = async (req, res) => {
    try {
        if (!req.file) {
            throw new Error("Aucun fichier d'image n'a été téléchargé.");
        }

        const bookObject = JSON.parse(req.body.book);

        // Suppression des champs interdits
        delete bookObject.ratings;
        delete bookObject.averageRating;

        // Vérification et ajout de la note
        if (bookObject.grade !== undefined) {
            validateGrade(bookObject.grade);
        }

        const book = new Book({
            ...bookObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            userId: req.user.id, // Associe le livre à l'utilisateur authentifié
            ratings: bookObject.grade
                ? [{ userId: req.user.id, grade: bookObject.grade }]
                : [],
            averageRating: bookObject.grade || 0,
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

        // Suppression des champs interdits
        delete bookObject.ratings;
        delete bookObject.averageRating;

        // Vérification de la note
        if (bookObject.grade !== undefined) {
            validateGrade(bookObject.grade);

            // Ajout ou mise à jour de la note existante
            const existingRatingIndex = book.ratings.findIndex(
                (rating) => rating.userId === req.user.id
            );

            if (existingRatingIndex !== -1) {
                // Met à jour la note existante
                book.ratings[existingRatingIndex].grade = bookObject.grade;
            } else {
                // Ajoute une nouvelle note
                book.ratings.push({ userId: req.user.id, grade: bookObject.grade });
            }

            // Recalcul de la moyenne des notes
            const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = totalRatings / book.ratings.length;
        }

        // Supprime l'ancienne image si une nouvelle est envoyée
        if (req.file) {
            const oldImagePath = path.join(__dirname, '../images', book.imageUrl.split('/images/')[1]);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error("Erreur lors de la suppression de l'image :", err);
            });
        }

        // Met à jour les autres champs du livre
        Object.assign(book, bookObject);

        const updatedBook = await book.save();
        res.status(200).json({ message: 'Livre modifié avec succès !', updatedBook });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du livre :", error);
        res.status(500).json({ error: error.message || 'Erreur du serveur.' });
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

exports.rateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé.' });
        }

        const userId = req.auth.userId; // Récupération du userId depuis le token
        const newGrade = req.body.grade;

        if (newGrade < 0 || newGrade > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
        }

        // Cherche si l'utilisateur a déjà noté
        const existingRating = book.ratings.find(rating => rating.userId === userId);

        if (existingRating) {
            // Met à jour la note existante
            existingRating.grade = newGrade;
        } else {
            // Ajoute une nouvelle note
            book.ratings.push({ userId, grade: newGrade });
        }

        // Recalcule la moyenne des notes
        const totalRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = totalRating / book.ratings.length;

        await book.save();
        res.status(200).json({ message: 'Note mise à jour avec succès.', book });
    } catch (error) {
        res.status(500).json({ error });
    }
};


