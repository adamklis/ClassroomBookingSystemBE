const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const bcrypt = require('bcrypt');

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
  
router.get('/', function (req, res) {
    res.send(JSON.parse(JSON.stringify(USERS)).map((user) => {
        delete user.password;
        return user;
    }));
})

router.get('/:uuid', function (req, res) {
    let result = USERS.find(user => user.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('User not found.');    
    }
    result = JSON.parse(JSON.stringify(result));
    delete result.password;
    res.send(result);
})

router.post('/', jsonParser, function (req, res) {

    if ( USERS.find(user => user.email === req.body?.email)) {
        return res.status(400).send("SHARED.ERROR.USER_EXIST");
    }

    const { error } = validateUser(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    let newUser = {
        uuid: uuidv4(),
        forename: req.body.forename,
        surname: req.body.surname,
        contact: req.body.contact,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        permissions: []
    }

    USERS.push(newUser);
    newUser = JSON.parse(JSON.stringify(newUser));
    delete newUser.password;
    res.send(newUser);
})

router.put('/:uuid', jsonParser, function (req, res) {
    
    let userFound = USERS.find(user => user.uuid === req.params.uuid);
    if (!userFound) {
        res.status(404).send('User not found.');
    }

    const { error } = validateUser(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    userFound.forename = req.body.forename;
    userFound.surname = req.body.surname;
    userFound.contact = req.body.contact;
    userFound.email = req.body.email;
    if (req.body.password) {
        userFound.password = bcrypt.hashSync(req.body.password, 10);
    }

    userFound = JSON.parse(JSON.stringify(userFound));
    delete userFound.password;
    res.send(userFound);
})

router.delete('/:uuid', function (req, res) {
    const result = USERS.find(user => user.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('User not found.');
    }

    USERS = USERS.filter(user => user.uuid !== req.params.uuid)
    
    delete result.password;
    res.send(result);
})


function validateUser(user) {
    const schema = Joi.object({
        uuid: Joi.string().allow(null),
        forename: Joi.string().required(),
        surname: Joi.string().required(),
        contact: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().allow(null).allow(''),
    });

    return schema.validate(user);
}

module.exports = router