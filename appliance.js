const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router()

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

APPLIANCES = [
    {
      uuid: 'fb2762f9-ba39-4dfb-b9af-7c7431944fd4',
      name: 'Notebook Lenovo L560',
      quantity: 100
    },
    {
      uuid: '5132b27c-16d0-4b8d-b456-0db207c8f30a',
      name: 'Projektor Dell',
      quantity: 10
    },
    {
      uuid: '7b574acf-a6e2-456d-8186-ebbe5e64bb38',
      name: 'Monitor Samsung 28"',
      quantity: 50
    },
    {
      uuid: 'c388a2cc-509b-409d-9df7-6bc550616b6e',
      name: 'Tablica interaktywna',
      quantity: 5
    }
  ];

router.get('/', function (req, res) {
    res.send(APPLIANCES);
})

router.get('/use', function (req, res) {
    let uuidFilter = req.query.filter_uuid;
    let nameFilter = req.query.filter_name;

    res.send(APPLIANCES
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
    }));
})

router.get('/:uuid', function (req, res) {
    const result = APPLIANCES.find(appliance => appliance.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('Appliance not found.');    
    } 

    res.send(result);
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

    APPLIANCES.push(newAppliance);
    res.send(newAppliance);
})

router.put('/:uuid', jsonParser, function (req, res) {
    
    let applianceFound = APPLIANCES.find(appliance => appliance.uuid === req.params.uuid);
    if (!applianceFound) {
        res.status(404).send('Appliance not found.');
    }

    const { error } = validateAppliance(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    applianceFound.name = req.body.name;
    applianceFound.quantity = req.body.quantity;

    res.send(applianceFound);
})

router.delete('/:uuid', function (req, res) {
    const result = APPLIANCES.find(appliance => appliance.uuid === req.params.uuid);
    if (!result) {
        res.status(404).send('Appliance not found.');
    }

    APPLIANCES = APPLIANCES.filter(appliance => appliance.uuid !== req.params.uuid)
    res.send(result);
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