const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ReservationService = require('./reservation-service');
var reservationService = new ReservationService();

const PermissionService = require('../auth/permission-service');
const PermissionEnum = require('../auth/permission.enum');

const AuthService = require('../auth/auth-service');
const e = require('express');
var authService = new AuthService();

router.get('/', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, [PermissionEnum.RESERVATION_VIEW, PermissionEnum.RESERVATION_VIEW_USER])
        .then(permitted => {
        if (!permitted || permitted.length === 0) {
            return res.status(403).send("Not permited");
        }

        let filters = {$and: []};
        let sorts = {};
        if (req.query['filter_dateFrom'] && req.query['filter_dateTo']){
            filters.$and.push(
                { $or: [
                {dateFrom: {"$gt": new Date(req.query['filter_dateFrom']), "$lt": new Date(req.query['filter_dateTo'])}},
                {dateTo: {"$gt": new Date(req.query['filter_dateFrom']), "$lt": new Date(req.query['filter_dateTo'])}},
                {$and: [{dateFrom: {"$lte": new Date(req.query['filter_dateFrom'])}}, {dateTo: {"$gte": new Date(req.query['filter_dateTo'])}}]},
                {$and: [{dateFrom: {"$gte": new Date(req.query['filter_dateFrom'])}}, {dateTo: {"$lte": new Date(req.query['filter_dateTo'])}}]}
            ]});
        }
        for (let property in req.query) {
            if (property.indexOf('filter') !== -1) { 
                let key = property.substring(7);
                if (key === 'dateFrom' && !req.query['filter_dateTo']){
                    filters.$and.push({dateFrom: {"$gt": new Date(req.query['filter_dateFrom'])}});
                } else if (key === 'dateTo' && !req.query['filter_dateFrom']){
                    filters.$and.push({dateTo: {"$lt": new Date(req.query['filter_dateTo'])}});
                } else if (key === 'keyword') {
                    let field = {}
                    field['message'] = new RegExp(`.*${req.query[property]}.*`,"i");
                    filters.$and.push(field);
                } else if (key !== 'dateFrom' && key !== 'dateTo') {
                    let field = {}
                    field[key] = req.query[property];
                    filters.$and.push(field);
                }
            }
            if (property.indexOf('sort') !== -1) { 
                let key = property.substring(5);
                sorts[key] = {};
                sorts[key] = req.query[property] === 'desc'? -1 : 1;
            }
        }

        reservationService.getReservations(filters, sorts)
            .then(result => {
                if (permitted.findIndex(permission => permission === PermissionEnum.RESERVATION_VIEW) === -1) {
                    authService.getUserByToken(req.headers.authorization.substr(7)).toArray().then(users =>{
                        result = result.filter(reservation => reservation.user.uuid === users[0].user[0].uuid);
                        return res.send(result);
                    })
                } else {
                    res.send(result);
                }
            })
            .catch(err => res.status(400).send(err))
    })
    .catch(err => {console.log(err); return res.status(403).send("Not permited"); })
})

router.get('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, [PermissionEnum.RESERVATION_VIEW, PermissionEnum.RESERVATION_VIEW_USER])
    .then(permitted => {
        if (!permitted || permitted.length === 0) { 
            return res.status(403).send("Not permited");
        }
        reservationService.getReservation(req.params.uuid)
            .then(result => {
                if (!result) {res.status(404).send('Not found')}
                else {
                    if (permitted.findIndex(permission => permission === PermissionEnum.RESERVATION_VIEW) === -1) {
                        authService.getUserByToken(req.headers.authorization.substr(7)).toArray().then(users =>{
                            if (result.user.uuid === users[0].user[0].uuid){
                                return res.send(result);
                            } else {
                                return res.status(403).send("Not permited");
                            }
                        }).catch((err) => {console.log(err); return res.status(403).send("Not permited");});
                    } else {
                        return res.send(result);
                    }
                    
                }
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.post('/', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, [PermissionEnum.RESERVATION_EDIT, PermissionEnum.RESERVATION_EDIT_USER])
    .then(permitted => {
        if (!permitted || permitted.length === 0) { 
            return res.status(403).send("Not permited");
        }
        const { error } = validateReservation(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        
        if (permitted.findIndex(permission => permission === PermissionEnum.RESERVATION_EDIT) === -1) {
            authService.getUserByToken(req.headers.authorization.substr(7)).toArray().then(users =>{
                if (req.body.user.uuid !== users[0].user[0].uuid){
                    return res.status(403).send("Not permited");
                }
            }).catch(err => {return res.status(403).send("Not permited");});
        }

        const newReservation = {
            uuid: uuidv4(),
            user: req.body.user,
            room: req.body.room,
            message: req.body.message,
            dateFrom: new Date(req.body.dateFrom),
            dateTo: new Date(req.body.dateTo)
        }

        reservationService.addReservation(newReservation)
            .then(result => {
                let reservation = result.ops[0];
                res.send({
                    uuid: reservation.uuid,
                    user: reservation.user,
                    room: reservation.room,
                    message: reservation.message,
                    dateFrom: reservation.dateFrom,
                    dateTo: reservation.dateTo
                });
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.put('/:uuid', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, [PermissionEnum.RESERVATION_EDIT, PermissionEnum.RESERVATION_EDIT_USER])
    .then(permitted => {
        if (!permitted || permitted.length === 0) { 
            return res.status(403).send("Not permited");
        }
        
        const { error } = validateReservation(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const updatedReservation = {
            uuid: req.body.uuid,
            user: req.body.user,
            room: req.body.room,
            message: req.body.message,
            dateFrom: new Date(req.body.dateFrom),
            dateTo: new Date(req.body.dateTo)
        };

        reservationService.getReservation(req.params.uuid)
        .then(reservation => {
            if (permitted.findIndex(permission => permission === PermissionEnum.RESERVATION_EDIT) === -1) {
                authService.getUserByToken(req.headers.authorization.substr(7)).toArray().then(users =>{
                    if (reservation.user.uuid !== users[0].user[0].uuid){
                        return res.status(403).send("Not permited");
                    } else {
                        reservationService.updateReservation(updatedReservation)
                        .then(result => {
                            if (!result.value) {res.status(404).send('Not found')}
                            else {
                                let reservation = result.value;
                                res.send({
                                    uuid: reservation.uuid,
                                    user: reservation.user,
                                    room: reservation.room,
                                    message: reservation.message,
                                    dateFrom: reservation.dateFrom,
                                    dateTo: reservation.dateTo
                                });
                            }
                        })
                        .catch(err => res.status(400).send(err));
                    }
                }).catch(err => {return res.status(403).send("Not permited");});
            } else {
                reservationService.updateReservation(updatedReservation)
                .then(result => {
                    if (!result.value) {res.status(404).send('Not found')}
                    else {
                        let reservation = result.value;
                        res.send({
                            uuid: reservation.uuid,
                            user: reservation.user,
                            room: reservation.room,
                            message: reservation.message,
                            dateFrom: reservation.dateFrom,
                            dateTo: reservation.dateTo
                        });
                    }
                })
                .catch(err => res.status(400).send(err));
            }
        })
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.delete('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, [PermissionEnum.RESERVATION_EDIT, PermissionEnum.RESERVATION_EDIT_USER])
    .then(permitted => {
        if (!permitted || permitted.length === 0) { 
            return res.status(403).send("Not permited");
        }

        reservationService.getReservation(req.params.uuid)
        .then(reservation => {
            if (permitted.findIndex(permission => permission === PermissionEnum.RESERVATION_EDIT) === -1) {
                authService.getUserByToken(req.headers.authorization.substr(7)).toArray().then(users =>{
                    if (reservation.user.uuid !== users[0].user[0].uuid){
                        return res.status(403).send("Not permited");
                    } else {
                        reservationService.deleteReservation(req.params.uuid)
                        .then(result => {
                            if (!result.value) {res.status(404).send('Not found')}
                            else {
                                let reservation = result.value;
                                res.send({
                                    uuid: reservation.uuid,
                                    user: reservation.user,
                                    room: reservation.room,
                                    message: reservation.message,
                                    dateFrom: reservation.dateFrom,
                                    dateTo: reservation.dateTo
                                });
                            }
                        })
                        .catch(err => res.status(400).send(err));
                    }
                }).catch(err => {return res.status(403).send("Not permited");});
            } else {
                reservationService.deleteReservation(req.params.uuid)
                .then(result => {
                    if (!result.value) {res.status(404).send('Not found')}
                    else {
                        let reservation = result.value;
                        res.send({
                            uuid: reservation.uuid,
                            user: reservation.user,
                            room: reservation.room,
                            message: reservation.message,
                            dateFrom: reservation.dateFrom,
                            dateTo: reservation.dateTo
                        });
                    }
                })
                .catch(err => res.status(400).send(err));
            }
        })
        .catch(err => {return res.status(404).send('Not found')});
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

function validateReservation(reservation) {
    const schema = Joi.object({
        uuid: Joi.string().allow(null),
        user: Joi.object().keys({
            uuid: Joi.string().required(),
            forename: Joi.string().required(),
            surname: Joi.string().required(),
            contact: Joi.string().required(),
            email: Joi.string().required(),
            permissions: Joi.array()
        }),
        room: Joi.object().keys({
            uuid: Joi.string(),
            name: Joi.string().required(),
            numberOfSeats: Joi.number().min(0).required(),
            appliances: Joi.array(),
            software: Joi.array()
        }),
        message: Joi.string().allow(null),
        dateFrom: Joi.alternatives([
            Joi.date(),
            Joi.string().valid(null)
        ]),
        dateTo: Joi.alternatives([
            Joi.date(),
            Joi.string().valid(null)
        ]),
    });

    return schema.validate(reservation);
}

module.exports = router