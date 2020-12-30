const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const software = require('./software');
const appliance = require('./appliance');
const room = require('./room');
const user = require('./user');
const auth = require('./auth');

// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Server works!');
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
  });

app.use('/api/software', software);
app.use('/api/appliance', appliance);
app.use('/api/room', room);
app.use('/api/user', user);
app.use('/api/auth', auth);

 
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}....`));