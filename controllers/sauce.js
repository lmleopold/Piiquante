/* eslint-disable space-in-parens */
const Sauce = require('../models/Sauce');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json( { error }) })
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
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
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
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Sauce supprimée !' })})
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
            sauce.usersLiked.push(req.auth.userId);
            sauce.likes += 1;
            sauce.save()
              .then(res.status(200).json({ message: 'Objet liké !' }))
              .catch(error => res.status(400).json({ error }));
            break;
          }
          case -1:{
            sauce.usersDisliked.push(req.auth.userId);
            sauce.dislikes += 1;
            sauce.save()
              .then(res.status(200).json({ message: 'Objet disliké !' }))
              .catch(error => res.status(400).json({ error }));
            break;
          }
          case 0:{
            const indexUserLiked = sauce.usersLiked.findIndex((e) => (e = req.auth.userId));
            const indexUserDisliked = sauce.usersDisliked.findIndex((e) => (e = req.auth.userId));
            if (indexUserLiked !== -1) {
              sauce.usersLiked.splice(indexUserLiked, 1);
              sauce.likes--;
              sauce.save()
                .then(res.status(200).json({ message: 'like supprimé !' }))
                .catch(error => res.status(400).json({ error }));
            } else if (indexUserDisliked !== -1) {
              sauce.usersDisliked.splice(indexUserDisliked, 1);
              sauce.dislikes--;
              sauce.save()
                .then(res.status(200).json({ message: 'dislike supprimé !' }))
                .catch(error => res.status(400).json({ error }));
            } else {
              return (res.status(400).json({ error: "Vous tentez de supprimer un like/dislike qui n'existe pas pour cette sauce !" }))
            };
          }
        }
      })
    .catch(error => { res.status(400).json({ error })
    });
};