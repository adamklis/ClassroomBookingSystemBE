const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const RoomService = require('./room-service');
var roomService = new RoomService();

const PermissionService = require('../auth/permission-service');
const PermissionEnum = require('../auth/permission.enum');

router.get('/', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.ROOM_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        roomService.getRooms()
            .then(result => res.send(result))
            .catch(err => res.status(400).send(err))
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.get('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.ROOM_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        roomService.getRoom(req.params.uuid)
            .then(result => {
                if (!result) {res.status(404).send('Not found')}
                else {res.send(result)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.post('/', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.ROOM_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
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
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.put('/:uuid', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.ROOM_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }

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
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.delete('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.ROOM_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        roomService.deleteRoom(req.params.uuid)
            .then(result => {
                if (!result.value) {res.status(404).send('Not found')}
                else {res.send(result.value)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
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