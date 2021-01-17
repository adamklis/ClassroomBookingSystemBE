const express = require('express')
const Joi = require('joi');
const crypto = require('crypto');
const base64url = require('base64url');
const router = express.Router();
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const UserService = require('../user/user-service');
var userService = new UserService();

const AuthService = require('./auth-service');
var authService = new AuthService();
  
router.post('/get_token', jsonParser, function (req, res) {
  userService.getUserByEmail(req.body.client_id)
  .then( user => { 
    if (bcrypt.compareSync(req.body.client_secret, user.password)) {
      let token = {
          access_token: base64url(crypto.randomBytes(48)), 
          token_type: 'Bearer'
      };
      authService.addToken({user_uuid: user.uuid, key: token.access_token})
        .then((result) => {
          return res.send(token)
        })
        .catch(err => {
          res.status(400).send(err)
        })
    } else {
      return res.status(400).send('Bad credentials.');  
    }
  })
  .catch(err => {
    console.log(err)
    res.status(400).send('User not found.')
  })
})

router.get('/get_user', function (req, res) {
  authService.getToken(req.query.token).then(token => {
    if (!token) {
      return res.status(404).send('Token not found.');
    } else {
      userService.getUser(token.user_uuid)
        .then(user => {
          delete user.password;
          res.send(user)
        })
        .catch(err => res.status(404).send('User not found.'))
    }
  })
})

router.post('/logout', jsonParser, function (req, res) {
  authService.deleteToken(req.query.token)
    .then(token => res.status(200).send())
    .catch(err => res.status(404).send('Token not found.'))
})

module.exports = router