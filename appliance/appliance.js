const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const ApplianceService = require('./appliance-service');
var applianceService = new ApplianceService();

router.get('/', function (req, res) {
    applianceService.getAppliances()
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
})

router.get('/use', function (req, res) {
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

router.get('/:uuid', function (req, res) {
    applianceService.getAppliance(req.params.uuid)
        .then(result => {
            if (!result) {res.status(404).send('Not found')}
            else {res.send(result)}
        })
        .catch(err => res.status(400).send(err));
})

router.post('/', jsonParser, function (req, res) {
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

router.put('/:uuid', jsonParser, function (req, res) {
    
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

router.delete('/:uuid', function (req, res) {
    applianceService.deleteAppliance(req.params.uuid)
        .then(result => {
            if (!result.value) {res.status(404).send('Not found')}
            else {res.send(result.value)}
        })
        .catch(err => res.status(400).send(err));
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