const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

SOFTWARE = [
    {
        uuid: '3127f3f9-8446-442f-8118-d99eaebcebe1',
        name: 'Microsoft Visual Studio 2010',
        quantity: 200,
        validFrom: new Date('2019-01-01'),
        validTo: new Date('2020-12-31')
    },
    {
        uuid: '0a587b89-dcd3-48b0-82e6-a8226ae9cd08',
        name: 'Microsoft SQL Server 2012',
        quantity: 50,
        validFrom: new Date('2019-01-01'),
        validTo: new Date('2020-12-31')
    },
    {
        uuid: 'c55a7518-72f3-4a4c-8b34-c938c7a6ff0c',
        name: 'Microsoft Office 2010',
        quantity: 50,
        validFrom: new Date('2019-01-01'),
        validTo: new Date('2020-12-31')
    },
    {
        uuid: 'd09da7ff-2349-498f-89e1-08a72c201622',
        name: 'Adobe Photoshop CS6',
        quantity: 20,
        validFrom: null,
        validTo: new Date('2020-12-31')
    },
    {
        uuid: '526eecae5-98ae-4123-a685-649d97d86d4b',
        name: 'Audacity2',
        quantity: 100,
        validFrom: new Date('2019-01-01'),
        validTo: null
    },
    {
        uuid: '63827335-33f4-4c50-bcab-4d4431269a926',
        name: 'Oracle VM VirtualBox',
        quantity: 300,
        validFrom: null,
        validTo: null
    },
];

router.get('/', function (req, res) {
    res.send(SOFTWARE);
})

router.get('/use', function (req, res) {
    let uuidFilter = req.query.filter_uuid;
    let nameFilter = req.query.filter_name;

    res.send(SOFTWARE
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
    }));
})

router.get('/:uuid', function (req, res) {
    const result = SOFTWARE.find(software => software.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('Software not found.');    
    } 

    res.send(result);
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

    SOFTWARE.push(newSoftware);
    res.send(newSoftware);
})

router.put('/:uuid', jsonParser, function (req, res) {
    
    let softwareFound = SOFTWARE.find(software => software.uuid === req.params.uuid);
    if (!softwareFound) {
        res.status(404).send('Software not found.');
    }

    const { error } = validateSoftware(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    softwareFound.name = req.body.name;
    softwareFound.quantity = req.body.quantity;
    softwareFound.validFrom = req.body.validFrom;
    softwareFound.validTo = req.body.validTo;

    res.send(softwareFound);
})

router.delete('/:uuid', function (req, res) {
    const result = SOFTWARE.find(software => software.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('Software not found.');
    }

    SOFTWARE = SOFTWARE.filter(software => software.uuid !== req.params.uuid)
    res.send(result);
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