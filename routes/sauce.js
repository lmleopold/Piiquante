const express = require('express');

const router = express.Router();

const User = require ("../models/user");

router.post('/', (req, res, next) => {//api/auth/signup
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(201).json({ message: 'Utilisateur enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});

router.post('/', (req, res, next) => {//api/auth/login
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  console.log(user);
  res.status(201).json({
    message: "utilisateur loggé !"
    });
});

// router.put('/:id', (req, res, next) => {
//   User.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Objet modifié !'}))
//     .catch(error => res.status(400).json({ error }));
// });

// router.delete('/:id', (req, res, next) => {
//   User.deleteOne({ _id: req.params.id })
//     .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
//     .catch(error => res.status(400).json({ error }));
// });

// router.get('/:id', (req, res, next) => {
//   User.findOne({_id: req.params.id})
//   .then(user => res.status(200).json(user))
//   .catch(error => res.status(404).json({error}));
// });

// router.get('/', (req, res, next) => {
//   User.find()
//   .then(users => res.status(200).json(things))
//   .catch(error => res.status(400).json({error}));
// });


module.exports = router;