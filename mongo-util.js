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
                        })
                    }

                    if (!collections.find(collection => collection.name === 'token')) {
                        _db.createCollection("token", function (err, res) {
                            if (err) throw err;
                            console.log("Token collection created!");
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