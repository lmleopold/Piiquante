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
  console.log(req.file);
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
 * Modifie une sauce ciblée par son _id
 * @param {express.Request<showObjectSauce>} req - Express request object
 * @param {express.Response} res - Express response object
 */
exports.modifySauce = (req, res) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce), // converti la sauce du format string au format objet
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}` // défini l'URL de l'image
      }
    : { ...req.body };
  delete sauceObject._userId; // suppr _userId du frontend pour se baser sur le _userId du token (req.auth.userId)
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/**
 * Supprime une sauce ciblée par son _id
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: "Not authorized" }); // seul le créateur peut supprimer sa sauce
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => { // fs permet de supprimer physiquement l'image de la sauce
          Sauce.deleteOne({ _id: req.params.id }) // méthode propre au modèle mongoose qui suppr l'elt de la BDD
            .then(() => { res.status(200).json({ message: "Sauce supprimée !" }); })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch( error => {
      res.status(500).json({ error });
    });
};

/**
 * Crée un like ou dislike à une sauce ciblée (si req.body.like=1 ou -1) --> son créateur (_userId) est ajouté à [usersLiked] ou [usersDisliked]
 * Ou bien supprime le like/dislike existant (si req.body.like=0)et de même pour le _userId des tab [usersLiked] ou [usersDisliked]
 * Renvoit un msg d'erreur pour une requete incorrecte (si req.body.like>1 ou req.body.like<-1)
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
exports.like = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(
      sauce => {
        switch ( req.body.like ) {
          case 1:{
            if (sauce.usersLiked.findIndex((e) => (e = req.auth.userId)) === -1) {
              sauce.usersLiked.push(req.auth.userId);
              sauce.likes += 1;
              saveSauce( sauce, "Objet liké !", res );
              break;
            } else {
              return (res.status(400).json({ error: "Vous avez déjà liké cette sauce !" }));
            }
          }
          case -1:{
            if (sauce.usersDisliked.findIndex((e) => (e = req.auth.userId)) === -1) {
              sauce.usersDisliked.push(req.auth.userId);
              sauce.dislikes += 1;
              saveSauce( sauce, "Objet disliké !", res );
              break;
            } else {
              return (res.status(400).json({ error: "Vous avez déjà disliké cette sauce !" }));
            }
          }
          case 0:{
            const indexUserLiked = sauce.usersLiked.findIndex((e) => (e = req.auth.userId));
            const indexUserDisliked = sauce.usersDisliked.findIndex((e) => (e = req.auth.userId));
            if (indexUserLiked !== -1) { // si _userId est présent dans le tb des usersLiked...
              sauce.usersLiked.splice(indexUserLiked, 1); // on le supprime
              sauce.likes--; // on décrémente le nb de like
              saveSauce( sauce, "like supprimé !", res );
            } else if (indexUserDisliked !== -1) {
              sauce.usersDisliked.splice(indexUserDisliked, 1);
              sauce.dislikes--;
              saveSauce( sauce, "dislike supprimé !", res );
            } else {
              return (res.status(400).json({ error: "Vous tentez de supprimer un like/dislike qui n'existe pas pour cette sauce !" })); // l'utilisateur n'a pas liké/disliké la sauce
            };
            break;
          }
          default:{
            return (res.status(400).json({ error: "la requete est incorrecte" })); // requête incorrecte
          }
        }
      })
    .catch(error => {
      res.status(400).json({ error }); // la sauce ciblée est introuvable
    });
};
