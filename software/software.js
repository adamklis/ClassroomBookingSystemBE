const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const SoftwareService = require('./software-service');

var softwareService = new SoftwareService();


router.get('/', function (req, res) {
    softwareService.getSoftwareList()
        .then(result => res.send(result))
        .catch(err => res.status(400).send(err))
})

router.get('/use', function (req, res) {
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

router.get('/:uuid', function (req, res) {
    softwareService.getSoftware(req.params.uuid)
        .then(result => {
            if (!result) {res.status(404).send('Not found')}
            else {res.send(result)}
        })
        .catch(err => res.status(400).send(err));
})

router.post('/', jsonParser, function (req, res) {
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

router.put('/:uuid', jsonParser, function (req, res) {
    
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
            console.log(result)
            if (!result.value) {res.status(404).send('Not found')}
            else {res.send(result.value)}
        })
        .catch(err => res.status(400).send(err));
})

router.delete('/:uuid', function (req, res) {
    softwareService.deleteSoftware(req.params.uuid)
        .then(result => {
            if (!result.value) {res.status(404).send('Not found')}
            else {res.send(result.value)}
        })
        .catch(err => res.status(400).send(err));
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