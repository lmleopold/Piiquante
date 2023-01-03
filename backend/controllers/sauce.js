/* eslint-disable space-in-parens */
const Sauce = require("../models/Sauce");
const fs = require("fs");

/**
 * @typedef {object} showObjectSauce
 * @property {string} sauce.userId
 * @property {string} sauce.name
 * @property {string} sauce.manufacturer
 * @property {string} sauce.description
 * @property {string} sauce.mainPepper
 * @property {string} sauce.imageUrl
 * @property {number} sauce.heat
 * @property {number} [sauce.likes] optional
 * @property {number} [sauce.dislikes] optional
 * @property {['String<userId>']} [sauce.usersLiked] optional
 * @property {['String<userId>']} [sauce.usersDisliked] optional
 */

/**
 * Sauvegarde la sauce sur la base MongoDB
 * @param {showObjectSauce} sauce
 * @param {String} textMessage - message de confirmation de la sauvegarde
 * @param {express.Response} res - Express response object
 * @return {undefined}
 */
function saveSauce (sauce, textMessage, res) {
  return sauce.save()
    .then(() => { res.status(201).json({ message: textMessage }); })
    .catch(error => { res.status(400).json({ error }); });
};

/**
 * Création d'une nouvelle sauce
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {function} saveSauce
 */
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce); // conversion format string vers objet
  delete sauceObject._id; // _id du frontend est remplacée par _id de la BD MongoDB
  delete sauceObject._userId; // _userId du front-end est supprimé par sécurité

  // Création de l'objet sauce avec les données de la requête et les valeurs par défaut
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId, // _récup du _userId via le token d'auth
    //
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });

  // Sauvegarde de la sauce et renvoi d'une réponse
  return saveSauce( sauce, "Objet enregistré !", res );
};

/**
 * Retourne l'ensemble des sauces présentes en BDD
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

/**
 * Retourne une sauce ciblée par son _id
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};

/**
 * Modifie une sauce ciblée par son _id si l'utilisateur courant est le créateur de la sauce.
 * Si un fichier image est fourni, met à jour l'URL de l'image de la sauce.
 * @param {express.Request<showObjectSauce>} req - L'objet request d'Express
 * @param {express.Response} res - L'objet response d'Express
 */
exports.modifySauce = (req, res) => {
  // Crée un objet sauce avec les champs fournis dans la requête
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce), // converti la sauce du format string au format objet
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}` // défini l'URL de l'image
      }
    : { ...req.body };

  // Supprime le champ _userId du frontend pour se baser sur le _userId du token (req.auth.userId)
  delete sauceObject._userId;

  // Empêche la modification des likes/dislikes autrement que par la route .../like ou /dislike
  if ("usersLiked" in sauceObject) delete sauceObject.usersLiked;
  if ("usersDisliked" in sauceObject) delete sauceObject.usersDisliked;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(403).json({ message: "Non autorisé" });
      } else {
        // Met à jour la sauce dans la base de données avec les champs fournis dans la requête
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch(error => res.status(401).json({ error: `Erreur lors de la modification de la sauce: ${error}` }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/**
 * Supprime une sauce ciblée par son _id si l'utilisateur courant est le créateur de la sauce.
 * Supprime également l'image associée à la sauce.
 * @param {express.Request} req - L'objet request d'Express
 * @param {express.Response} res - L'objet response d'Express
 */
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" }); // seul le créateur peut supprimer sa sauce
      } else {
        // Extrait le nom du fichier de l'image de la sauce à partir de l'URL de l'image
        const filename = sauce.imageUrl.split("/images/")[1];

        // Supprime physiquement l'image de la sauce du système de fichiers
        fs.unlink(`images/${filename}`, () => {
          // Supprime la sauce de la base de données (méthode mongoose)
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: "Sauce supprimée !" }); })
            .catch(error => res.status(401).json({ error: `Erreur lors de la suppression de la sauce: ${error}` }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

/**
 * Modifie les likes/dislikes et les listes d'utilisateurs qui ont liké/disliké une sauce en fonction de la valeur de req.body.like.
 * Si req.body.like vaut 1, ajoute l'utilisateur courant (req.auth.userId) à la liste d'utilisateurs qui ont liké la sauce et incrémente le nombre de likes.
 * Si req.body.like vaut -1, ajoute l'utilisateur courant à la liste d'utilisateurs qui ont disliké la sauce et incrémente le nombre de dislikes.
 * Si req.body.like vaut 0, supprime l'utilisateur courant des listes d'utilisateurs qui ont liké ou disliké la sauce et décrémente le nombre de likes ou dislikes en conséquence.
 * Renvoie un message d'erreur si req.body.like a une valeur autre que 1, -1 ou 0.
 * @param {express.Request} req - L'objet request d'Express
 * @param {express.Response} res - L'objet response d'Express
 */
exports.like = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // Vérifie si l'utilisateur courant a déjà liké ou disliké la sauce
      const hasLiked = sauce.usersLiked.includes(req.auth.userId);
      const hasDisliked = sauce.usersDisliked.includes(req.auth.userId);

      switch (req.body.like) {
        case 1:
          // Si l'utilisateur n'a pas encore liké ou disliké la sauce, ajoute son userId à la liste des utilisateurs qui ont liké la sauce
          // et incrémente le nombre de likes
          if (!hasLiked && !hasDisliked) {
            sauce.usersLiked.push(req.auth.userId);
            sauce.likes += 1;
            saveSauce(sauce, "Objet liké !", res);
            break;
          } else {
            return res.status(400).json({ error: "vous avez déjà liké ou disliké cette sauce" });
          }
        case -1:
          // Si l'utilisateur n'a pas encore liké ou disliké la sauce, ajoute son userId à la liste des utilisateurs qui ont disliké la sauce
          // et incrémente le nombre de dislikes
          if (!hasLiked && !hasDisliked) {
            sauce.usersDisliked.push(req.auth.userId);
            sauce.dislikes += 1;
            saveSauce(sauce, "Objet disliké !", res);
            break;
          } else {
            return res.status(400).json({ error: "vous avez déjà liké ou disliké cette sauce" });
          }
        case 0:
          // Si l'utilisateur a déjà liké la sauce, supprime son userId de la liste des utilisateurs qui ont liké la sauce et décrémente le nombre de likes
          // Sinon, s'il a déjà disliké la sauce, supprime son userId de la liste des utilisateurs qui ont disliké la sauce et décrémente le nombre de dislikes
          // Si l'utilisateur n'a pas encore liké ou disliké la sauce, renvoie un message d'erreur
          if (hasLiked) {
            sauce.usersLiked = sauce.usersLiked.filter(userId => userId !== req.auth.userId);
            sauce.likes -= 1;
            saveSauce(sauce, "Like supprimé !", res);
          } else if (hasDisliked) {
            sauce.usersDisliked = sauce.usersDisliked.filter(userId => userId !== req.auth.userId);
            sauce.dislikes -= 1;
            saveSauce(sauce, "Dislike supprimé !", res);
          } else {
            return res.status(400).json({ error: "Vous n'avez pas encore liké ou disliké cette sauce" });
          }
          break;
        default:
          return res.status(400).json({ error: "Requête incorrecte" });
      }
    })
    .catch(() => {
      res.status(400).json({ error: "La sauce ciblée est introuvable" });
    });
};
