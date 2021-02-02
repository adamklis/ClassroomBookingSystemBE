const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const SoftwareService = require('./software-service');
var softwareService = new SoftwareService();

const PermissionService = require('../auth/permission-service');
const PermissionEnum = require('../auth/permission.enum');

router.get('/', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.SOFTWARE_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }

        let filters = {$and: []};
        let sorts = {};
        for (let property in req.query) {
            let key = property.substring(7);
            if (property.indexOf('filter') !== -1) { 
                let key = property.substring(7);
                
                if (key === "quantity"){
                    if (Array.isArray(req.query[property])) {
                        req.query[property].forEach(val => filters.$and.push({[key]: { $gte: Number(val)}}));
                    } else {
                        filters.$and.push({[key]: { $gte: Number(req.query[property])}});
                    }
                } else {   
                    if (Array.isArray(req.query[property])) {
                        req.query[property].forEach(val => filters.$and.push({[key]: new RegExp(`.*${val}.*`,"i")}));
                    }
                    else {
                        filters.$and.push({[key]: new RegExp(`.*${req.query[property]}.*`,"i")});
                    }
                }
            }
            if (property.indexOf('sort') !== -1) { 
                sorts[property.substring(5)] = {};
                sorts[property.substring(5)] = req.query[property] === 'desc'? -1 : 1;
            }
        }

        if (!filters.$and || filters.$and.length === 0){
            delete filters.$and;
        }

        softwareService.getSoftwareList(filters, sorts)
            .then(result => res.send(result))
            .catch(err => res.status(400).send(err))
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.get('/use', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.SOFTWARE_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        let uuidFilter = req.query.filter_uuid;
        let nameFilter = req.query.filter_name;
        softwareService.getSoftwareList()
            .then(result => res.send(
                result
                    .filter(item => 
                        (!uuidFilter || item.uuid === uuidFilter) &&
                        (!nameFilter || item.name.toLowerCase().indexOf(nameFilter.toLowerCase()) >= 0 )
                    )
                    .map(item => {
                    return {
                        uuid: item.uuid,
                        name: item.name,
                        quantity: 0,
                        maxQuantity: item.quantity,
                        software: { uuid: item.uuid, name: item.name }
                    }
                    })
            ));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.get('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.SOFTWARE_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        softwareService.getSoftware(req.params.uuid)
            .then(result => {
                if (!result) {res.status(404).send('Not found')}
                else {res.send(result)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.post('/', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.SOFTWARE_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        const { error } = validateSoftware(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        
        const newSoftware = {
            uuid: uuidv4(),
            name: req.body.name,
            quantity: req.body.quantity,
            validFrom: req.body.validFrom,
            validTo: req.body.validTo,
        }

        softwareService.addSoftware(newSoftware)
            .then(result => res.send(result.ops))
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.put('/:uuid', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.SOFTWARE_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        
        const { error } = validateSoftware(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const updatedSoftware = {
            uuid: req.body.uuid,
            name: req.body.name,
            quantity: req.body.quantity,
            validFrom: req.body.validFrom,
            validTo: req.body.validTo,
        };

        softwareService.updateSoftware(updatedSoftware)
            .then(result => {
                if (!result.value) {res.status(404).send('Not found')}
                else {res.send(result.value)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.delete('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.SOFTWARE_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        softwareService.deleteSoftware(req.params.uuid)
            .then(result => {
                if (!result.value) {res.status(404).send('Not found')}
                else {res.send(result.value)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

function validateSoftware(software) {
    const schema = Joi.object({
        uuid: Joi.string().allow(null),
        name: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        validFrom: Joi.alternatives([
            Joi.date(),
            Joi.string().valid(null)
        ]),
        validTo: Joi.alternatives([
            Joi.date(),
            Joi.string().valid(null)
        ]),
    });

    return schema.validate(software);
}

module.exports = router