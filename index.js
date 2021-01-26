const express = require('express');
const app = express();

const mongoUtil = require('./mongo-util')

mongoUtil.connectToServer( err => {
  if (err) {
    console.log(err)
  } else {
    const reservation = require('./reservation/reservation');
    const software = require('./software/software');
    const appliance = require('./appliance/appliance');
    const room = require('./room/room');
    const user = require('./user/user');
    const auth = require('./auth/auth');
    const health = require('./health');

    app.use('/api/reservation', reservation);
    app.use('/api/software', software);
    app.use('/api/appliance', appliance);
    app.use('/api/room', room);
    app.use('/api/user', user);
    app.use('/api/auth', auth);
    app.use('/api/health', health);
  }
}
);

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



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}....`));