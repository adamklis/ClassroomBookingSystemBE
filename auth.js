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
      role: 'admin',
      email: 'klis.adam.0807@gmail.com',
      password: 'aklis'
    },
    {
      uuid: '2',
      forename: 'Jan',
      surname: 'Kowalski',
      contact: '123456789',
      role: 'student',
      email: 'klisiu94@onet.eu',
      password: 'jkowa'
    },
    {
      uuid: '3',
      forename: 'Mateusz',
      surname: 'Nowak',
      contact: '987654321',
      role: 'tech',
      email: 'nowakmateusz@interia.pl',
      password: 'mnowa'
    }
  ];

TOKENS = [];
  
router.post('/get_token', jsonParser, function (req, res) {
    console.log(req.body);
    // const requestBody = req.body.split('&').map(parameter => {
    //     const pair = parameter.split('=');
    //     const obj = {}
    //     obj[pair[0]]= pair[1];
    //     return obj;
    // }
    // );
    // console.log(requestBody);

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

    res.send({user});
})

module.exports = router