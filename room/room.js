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

        let filters = {$and: []};
        let sorts = {};
        for (let property in req.query) {
            if (property.indexOf('filter') !== -1) {
                let key = property.substring(7);
                
                if (key === "keyword_int"){
                    key = "numberOfSeats";
                    if (Array.isArray(req.query[property])) {
                        req.query[property].forEach(val => filters.$and.push({[key]: { $gte: Number(val)}}));
                    } else {
                        filters.$and.push({[key]: { $gte: Number(req.query[property])}});
                    }
                } else {
                    if (key === "keyword") {
                        key = "name";
                    } else if (key === "appliance") {
                        key = "appliances.name";
                    } else if (key === "software") {
                        key = "software.name";
                    }
    
                    if (Array.isArray(req.query[property])) {
                        req.query[property].forEach(val => filters.$and.push({[key]: new RegExp(`.*${val}.*`,"i")}));
                    }
                    else {
                        filters.$and.push({[key]: new RegExp(`.*${req.query[property]}.*`,"i")});
                    }
                }
                       
            }
            if (property.indexOf('sort') !== -1) {
                let key = property.substring(5);
                sorts[key] = {};
                sorts[key] = req.query[property] === 'desc'? -1 : 1;
            }
        }
        if (filters.$and.length === 0) {
            delete filters.$and;
        }

        let page = {
            limit: Number(req.query.limit) ? Number(req.query.limit) : 0,
            offset: Number(req.query.offset) ? Number(req.query.offset) : 0
        }

        Promise.all([
            roomService.getRoomsCount(filters),
            roomService.getRooms(filters, sorts, page)
        ]).then(result => {
            res.send({
                page: {limit: page.limit, size: result[0], start: page.offset},
                results: result[1].map((room) => {
                return {
                    uuid: room.uuid,
                    name: room.name,
                    numberOfSeats: room.numberOfSeats,
                    appliances: room.appliances,
                    software: room.software
                }
            })})
        }).catch(err => res.status(400).send(err))
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
                else {res.send({
                    uuid: result.uuid,
                    name: result.name,
                    numberOfSeats: result.numberOfSeats,
                    appliances: result.appliances,
                    software: result.software
                })}
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
            .then(result => {
                let room = result.ops[0];
                res.send({
                    uuid: room.uuid,
                    name: room.name,
                    numberOfSeats: room.numberOfSeats,
                    appliances: room.appliances,
                    software: room.software
                })
            })
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
                else {
                    let room = result.value;
                    res.send({
                        uuid: room.uuid,
                        name: room.name,
                        numberOfSeats: room.numberOfSeats,
                        appliances: room.appliances,
                        software: room.software
                    })
                }
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
                else {
                    let room = result.value;
                    res.send({
                        uuid: room.uuid,
                        name: room.name,
                        numberOfSeats: room.numberOfSeats,
                        appliances: room.appliances,
                        software: room.software
                    })
                }
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