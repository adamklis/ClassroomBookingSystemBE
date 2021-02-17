const MongoClient = require('mongodb').MongoClient;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "27017";
const DB_OPTIONS = process.env.DB_OPTIONS || null;
const DB_USER = process.env.DB_USER || null;
const DB_PASS = process.env.DB_PASS || null;

let url = "mongodb://";
if (DB_USER && DB_PASS) {
    url = url + DB_USER + ":" + DB_PASS + "@";
}
url = url + DB_HOST;
if (DB_PORT) {
    url = url + ":" + DB_PORT;
}
if (DB_OPTIONS) {
    url = url + "/" + DB_OPTIONS;
}
var _db;

module.exports = {
    connectToServer: function (callback) {
        MongoClient.connect(
            url,
            { useNewUrlParser: true, useUnifiedTopology: true },
            function (err, db) {
                if (err) throw err;
                _db = db.db("classroom-booking-system-db");
                console.log("DB Connected!");

                _db.listCollections().toArray().then(collections => {
                    if (!collections.find(collection => collection.name === 'reservation')) {
                        _db.createCollection("reservation", function (err, res) {
                            if (err) throw err;
                            console.log("Reservation collection created!");
                        })
                    }

                    if (!collections.find(collection => collection.name === 'software')) {
                        _db.createCollection("software", function (err, res) {
                            if (err) throw err;
                            console.log("Software collection created!");
                        })
                    }

                    if (!collections.find(collection => collection.name === 'appliance')) {
                        _db.createCollection("appliance", function (err, res) {
                            if (err) throw err;
                            console.log("Appliance collection created!");
                        })
                    }

                    if (!collections.find(collection => collection.name === 'room')) {
                        _db.createCollection("room", function (err, res) {
                            if (err) throw err;
                            console.log("Room collection created!");
                        })
                    }

                    if (!collections.find(collection => collection.name === 'user')) {
                        _db.createCollection("user", function (err, res) {
                            if (err) throw err;
                            console.log("User collection created!");
                            exampleUsers = [
                                {
                                    uuid: 'ed5ffd54-d075-4b59-96bd-ff856cd1043d',
                                    forename: 'Example',
                                    surname: 'Admin',
                                    contact: '691202553',
                                    email: 'admin@classroombookingsystem.com',
                                    password: '$2b$10$sZdZU4WFb/.1f76rt6GvLOj8pJEIfpgcfKPAIvPd5hSuhv.7BlYaO',
                                    permissions: [
                                        'APPLIANCE_EDIT',
                                        'APPLIANCE_VIEW',
                                        'RESERVATION_EDIT',
                                        'RESERVATION_EDIT_USER',
                                        'RESERVATION_VIEW',
                                        'RESERVATION_VIEW_USER',
                                        'ROOM_EDIT',
                                        'ROOM_VIEW',
                                        'SOFTWARE_EDIT',
                                        'SOFTWARE_VIEW',
                                        'USER_EDIT',
                                        'USER_VIEW',
                                        'PERMISSION_VIEW',
                                        'PERMISSION_EDIT',
                                        'PROTECTED_USER'
                                    ]
                                },
                                {
                                    uuid: 'ed5ffd54-d075-4b59-96bd-ff856cd1043e',
                                    forename: 'Example',
                                    surname: 'Technician',
                                    contact: '691202553',
                                    email: 'technician@classroombookingsystem.com',
                                    password: '$2b$10$sZdZU4WFb/.1f76rt6GvLOj8pJEIfpgcfKPAIvPd5hSuhv.7BlYaO',
                                    permissions: [
                                        'APPLIANCE_EDIT',
                                        'APPLIANCE_VIEW',
                                        'RESERVATION_EDIT',
                                        'RESERVATION_EDIT_USER',
                                        'RESERVATION_VIEW',
                                        'RESERVATION_VIEW_USER',
                                        'ROOM_EDIT',
                                        'ROOM_VIEW',
                                        'SOFTWARE_EDIT',
                                        'SOFTWARE_VIEW',
                                        'USER_VIEW',
                                        'PROTECTED_USER'
                                    ]
                                },
                                {
                                    uuid: 'ed5ffd54-d075-4b59-96bd-ff856cd1043f',
                                    forename: 'Example',
                                    surname: 'User',
                                    contact: '691202553',
                                    email: 'user@classroombookingsystem.com',
                                    password: '$2b$10$sZdZU4WFb/.1f76rt6GvLOj8pJEIfpgcfKPAIvPd5hSuhv.7BlYaO',
                                    permissions: [
                                        'APPLIANCE_VIEW',
                                        'RESERVATION_EDIT_USER',
                                        'RESERVATION_VIEW',
                                        'RESERVATION_VIEW_USER',
                                        'ROOM_VIEW',
                                        'SOFTWARE_VIEW',
                                        'PROTECTED_USER'
                                    ]
                                }
                            ]
                            _db.collection('user').insertMany(exampleUsers);
                        })
                    }

                    if (!collections.find(collection => collection.name === 'token')) {
                        _db.createCollection("token", function (err, res) {
                            if (err) throw err;
                            console.log("Token collection created!");
                        })
                    }

                    if (!collections.find(collection => collection.name === 'dictionary')) {
                        _db.createCollection("dictionary", function (err, res) {
                            _db.collection('dictionary').insertMany([
                                { "key": "REPORTED", "items": [] },
                                { "key": "CHANGELOG", "items": [] }
                            ]);
                            if (err) throw err;
                            console.log("Dictionary collection created!");
                        })
                    }

                    return callback(err);
                });
            }
        );
    },

    getDb: function () {
        return _db;
    }
};