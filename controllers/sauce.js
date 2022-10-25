/* eslint-disable space-in-parens */
const Sauce = require("../models/Sauce");
const fs = require("fs");


/**
 * Sauvegarde la sauce sur la BDD
 * @param {object} sauce
 * @param {String} textMessage
 * @param {object} res
 * @returns
 */
function saveSauce (sauce, textMessage, res) {
  return sauce.save()
    .then(() => { res.status(201).json({ message: textMessage }); })
    .catch(error => { res.status(400).json({ error }); });
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
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
  saveSauce( sauce, "Objet enregistré !", res );
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
      }
    : { ...req.body };
  delete sauceObject._userId;
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

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: "Sauce supprimée !" });})
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch( error => {
      res.status(500).json({ error });
    });
};

exports.like = (req, res, next) => {
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
            if (sauce.usersLiked.findIndex((e) => (e = req.auth.userId)) === -1) {
              console.log("coucou");
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
            if (indexUserLiked !== -1) {
              sauce.usersLiked.splice(indexUserLiked, 1);
              sauce.likes--;
              saveSauce( sauce, "like supprimé !", res );
            } else if (indexUserDisliked !== -1) {
              sauce.usersDisliked.splice(indexUserDisliked, 1);
              sauce.dislikes--;
              saveSauce( sauce, "dislike supprimé !", res );
            } else {
              return (res.status(400).json({ error: "Vous tentez de supprimer un like/dislike qui n'existe pas pour cette sauce !" }));
            };
            break;
          }
          default:{
            return (res.status(400).json({ error: "la requete est incorrecte" }));
          }
        }
      })
    .catch(error => { res.status(400).json({ error });
    });
};