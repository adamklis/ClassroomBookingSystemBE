const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const RoomService = require('./room-service');
var roomService = new RoomService();

router.get('/', function (req, res) {
    roomService.getRooms()
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
})

router.get('/:uuid', function (req, res) {
    roomService.getRoom(req.params.uuid)
        .then(result => {
            if (!result) {res.status(404).send('Not found')}
            else {res.send(result)}
        })
        .catch(err => res.status(400).send(err));
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

    roomService.addRoom(newRoom)
        .then(result => res.send(result.ops[0]))
        .catch(err => res.status(400).send(err));
})

router.put('/:uuid', jsonParser, function (req, res) {

    const { error } = validateRoom(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const updatedRoom = {
        uuid: req.body.uuid,
        name: req.body.name,
        quantity: req.body.quantity,
        numberOfSeats: req.body.numberOfSeats,
        appliances: req.body.appliances,
        software: req.body.software
    };

    roomService.updateRoom(updatedRoom)
        .then(result => {
            if (!result.value) {res.status(404).send('Not found')}
            else {res.send(result.value)}
        })
        .catch(err => res.status(400).send(err));
})

router.delete('/:uuid', function (req, res) {
    roomService.deleteRoom(req.params.uuid)
        .then(result => {
            if (!result.value) {res.status(404).send('Not found')}
            else {res.send(result.value)}
        })
        .catch(err => res.status(400).send(err));
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