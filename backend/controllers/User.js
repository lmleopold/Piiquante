const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Login/signup request body expects:
 * @typedef {object} showReqAuthBody
 * @property {string} email
 * @property {string} password
 */

/**
 * Création d'un utilisateur
 * Le mot de passe doit répondre à un pattern
 * Si pattern valide, alors mdp est crypté (salé 10 fois) et sauvé en BDD avec son email
 * @param {express.Request<showReqAuthBody>} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {undefined || Object <error>}
 */
exports.signup = (req, res) => {
  // le mot de passe doit présenter : - au moins 8 caractères - au moins 1 majuscule, 1 minuscule, et 1 chiffre - peut contenir un caractère spécial"
  const exigencesMotDePasse = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (exigencesMotDePasse.test(req.body.password)) {
    // Hash le mot de passe et l'enregistre dans la base de données
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    // Le mot de passe ne respecte pas les exigences
    return (res.status(400).json({ error: "le mot de passe doit présenter : \n- au moins 8 caractères \n- au moins 1 majuscule, 1 minuscule, et 1 chiffre \n- peut contenir un caractère spécial" }));
  }
};

/**
 * Login d'un utilisateur:
 * Vérifie l'existence de son email en BDD
 * Si le password est valide (suite au controle bcrypt), renvoit un token chiffré avec la clé privée (à modifier pour la prod) + l'userId au frontend
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: "Couple Utilisateur / mot de passe incorrect !" }); // Utilisateur non trouvé
      }
      bcrypt.compare(req.body.password, user.password) // comparaison par bcrypt du hash obtenu par chiffrement du req.body.password avec le hash associé à l'email en BDD
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: "Couple Utilisateur / mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id }, // le token contiendra le userId
              process.env.SECRET_KEY, // clé de chiffrement du token
              { expiresIn: "24h" } // le token sera valide 24h
            )
          });
        })
        .catch(error => res.status(500).json({ error })); // la comparaison bcrypt n'a pas été exécutée
    })
    .catch(error => res.status(500).json({ error })); // le serveur n'a pa pu exécuter sa recherche
};
