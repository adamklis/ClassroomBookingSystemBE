const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ApplianceService = require('./appliance-service');
var applianceService = new ApplianceService();

const PermissionService = require('../auth/permission-service');
const PermissionEnum = require('../auth/permission.enum');

router.get('/', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.APPLIANCE_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        applianceService.getAppliances()
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.get('/use', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.APPLIANCE_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        let uuidFilter = req.query.filter_uuid;
        let nameFilter = req.query.filter_name;
        applianceService.getAppliances()
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
                        appliance: { uuid: item.uuid, name: item.name }
                    }
                    })
            ));
        })
        .catch(err => { return res.status(403).send("Not permited"); })
})

router.get('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.APPLIANCE_VIEW)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        applianceService.getAppliance(req.params.uuid)
            .then(result => {
                if (!result) {res.status(404).send('Not found')}
                else {res.send(result)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.post('/', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.APPLIANCE_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        const { error } = validateAppliance(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        
        const newAppliance = {
            uuid: uuidv4(),
            name: req.body.name,
            quantity: req.body.quantity
        }

        applianceService.addAppliance(newAppliance)
            .then(result => res.send(result.ops))
            .catch(err => res.status(400).send(err));
        })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.put('/:uuid', jsonParser, function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.APPLIANCE_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
    
        const { error } = validateAppliance(req.body)
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const updatedAppliance = {
            uuid: req.body.uuid,
            name: req.body.name,
            quantity: req.body.quantity
        };

        applianceService.updateAppliance(updatedAppliance)
            .then(result => {
                if (!result.value) {res.status(404).send('Not found')}
                else {res.send(result.value)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

router.delete('/:uuid', function (req, res) {
    PermissionService.checkPermissions(req.headers.authorization, PermissionEnum.APPLIANCE_EDIT)
    .then(permitted => {
        if (!permitted) { 
            return res.status(403).send("Not permited");
        }
        applianceService.deleteAppliance(req.params.uuid)
            .then(result => {
                if (!result.value) {res.status(404).send('Not found')}
                else {res.send(result.value)}
            })
            .catch(err => res.status(400).send(err));
    })
    .catch(err => { return res.status(403).send("Not permited"); })
})

function validateAppliance(appliance) {
    const schema = Joi.object({
        uuid: Joi.string().allow(null),
        name: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
    });

    return schema.validate(appliance);
}

module.exports = router