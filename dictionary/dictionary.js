const express = require('express')
const router = express.Router()


const DictionaryService = require('./dictionary-service');
var dictionaryService = new DictionaryService();

router.get('/:key', function (req, res) {
    dictionaryService.getDictionary(req.params.key)
        .then(result => {
            if (!result) {res.status(404).send('Not found')}
            else {res.send(result)}
        })
        .catch(err => res.status(400).send(err));
})

module.exports = router