const express = require('express')
const router = express.Router()
const http = require('http')
  
router.get('/', function (req, res) {
    res.send({message: "I\'m alive!"});
    setTimeout(() => {
        http.get(req.headers.origin, (response) => {
            console.log(`frontend status: ${response.statusCode}`);
        })
    }, 60000);
})

module.exports = router