const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

ROOMS = [
    {
      uuid: '1',
      name: '419N',
      numberOfSeats: 30,
      appliances: [],
      software: []
    },
    {
      uuid: '2',
      name: '420N',
      numberOfSeats: 60,
      appliances: [],
      software: []
    },
    {
      uuid: '3',
      name: 'A1',
      numberOfSeats: 120,
      appliances: [],
      software: []
    },
  ];
  
router.get('/', function (req, res) {
    res.send(ROOMS);
})

router.get('/:uuid', function (req, res) {
    const result = ROOMS.find(room => room.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('Room not found.');    
    } 
    
    res.send(result);
})

router.post('/', jsonParser, function (req, res) {
    const { error } = validateRoom(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    const newRoom = {
        uuid: uuidv4(),
        name: req.body.name,
        numberOfSeats: req.body.numberOfSeats,
        appliances: req.body.appliances,
        software: req.body.software
    }

    ROOMS.push(newRoom);
    res.send(newRoom);
})

router.put('/:uuid', jsonParser, function (req, res) {
    
    let roomFound = ROOMS.find(room => room.uuid === req.params.uuid);
    if (!roomFound) {
        res.status(404).send('Room not found.');
    }

    const { error } = validateRoom(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    roomFound.name = req.body.name;
    roomFound.quantity = req.body.quantity;
    roomFound.numberOfSeats = req.body.numberOfSeats,
    roomFound.appliances = req.body.appliances,
    roomFound.software = req.body.software

    res.send(roomFound);
})

router.delete('/:uuid', function (req, res) {
    const result = ROOMS.find(room => room.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('Room not found.');
    }

    ROOMS = ROOMS.filter(room => room.uuid !== req.params.uuid)
    res.send(result);
})


function validateRoom(room) {
    const schema = Joi.object({
        uuid: Joi.string().allow(null),
        name: Joi.string().required(),
        numberOfSeats: Joi.number().min(0).required(),
        appliances: Joi.array(),
        software: Joi.array()
    });

    return schema.validate(room);
}

module.exports = router