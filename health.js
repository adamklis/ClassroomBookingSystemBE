const express = require('express')
const router = express.Router()
  
router.get('/', function (req, res) {
    res.send('I\'m alive!');
})

module.exports = router