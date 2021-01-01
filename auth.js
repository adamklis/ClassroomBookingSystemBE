const express = require('express')
const Joi = require('joi');
const crypto = require('crypto');
const base64url = require('base64url');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

  USERS = [
      {
        uuid: '1',
        forename: 'Adam',
        surname: 'Kliś',
        contact: '691202553',
        email: 'klis.adam.0807@gmail.com',
        password: 'aklis',
        permissions:[
          'APPLIANCE_EDIT',
          'APPLIANCE_VIEW',
          'RESERVATION_EDIT',
          'RESERVATION_EDIT_USER',
          'RESERVATION_VIEW',
          'RESERVATION_VIEW_USER',
          'ROOM_EDIT',
          'ROOM_VIEW',
          'SOFTWARE_EDIT',
          'SOFTWARE_VIEW',
          'USER_EDIT',
          'USER_VIEW'
        ]
      },
      {
        uuid: '2',
        forename: 'Jan',
        surname: 'Kowalski',
        contact: '123456789',
        email: 'klisiu94@onet.eu',
        password: 'jkowa',
        permissions:[
          'APPLIANCE_EDIT',
          'APPLIANCE_VIEW',
          'RESERVATION_EDIT',
          'RESERVATION_EDIT_USER',
          'RESERVATION_VIEW',
          'RESERVATION_VIEW_USER',
          'ROOM_EDIT',
          'ROOM_VIEW',
          'SOFTWARE_EDIT',
          'SOFTWARE_VIEW'
        ]
      },
      {
        uuid: '3',
        forename: 'Mateusz',
        surname: 'Nowak',
        contact: '987654321',
        email: 'nowakmateusz@interia.pl',
        password: 'mnowa',
        permissions:[]
      }
    ];

TOKENS = [];
  
router.post('/get_token', jsonParser, function (req, res) {
    let user = USERS.find(user => user.email === req.body.client_id && user.password === req.body.client_secret);

    let token = {
        access_token: base64url(crypto.randomBytes(48)), 
        token_type: 'Bearer'
    };

    if (user) {
        TOKENS.push({client_id: req.body.client_id, token: token.access_token});
        res.send(token);
    } else {
        res.status(404).send('Bad credentials.');  
    }
})

router.get('/get_user', function (req, res) {
    let token = TOKENS.find(token => token.token === req.query.token);
    if (!token) {
        return res.status(404).send('Token not found.');
    }
    
    let user = USERS.find(user => user.email === token.client_id);

    res.send(user);
})

router.post('/logout', jsonParser, function (req, res) {
  let tokenFound = TOKENS.find(token => token.token === req.query.token);
    if (!tokenFound) {
        return res.status(404).send('Token not found.');
    }

    TOKENS = TOKENS.filter(token => token.access_token !== tokenFound);

    res.send(tokenFound);
})

module.exports = router