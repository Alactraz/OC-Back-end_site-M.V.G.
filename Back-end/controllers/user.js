const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assurez-vous que le modèle User est défini

// Fonction pour l'inscription
exports.signup = async (req, res) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hash
        });
        await user.save();
        res.status(201).json({ message: 'Utilisateur créé !' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Fonction pour la connexion
exports.login = async (req, res) => {
    try {
        console.log("Requête de connexion reçue :", req.body); // Log de la requête

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            console.log("Utilisateur non trouvé");
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            console.log("Mot de passe incorrect");
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWTSKEY,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            userId: user._id,
            token: token
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error });
    }
};

