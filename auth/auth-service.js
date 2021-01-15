var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class AuthService {

    getTokens() {
        return db.collection('token').find({}).toArray();
    }

    getToken(key){
        return db.collection('token').findOne({key: key});
    }

    getUserByToken(key) {
        this.getToken(key).then(token => { 
            return db.collection('user').findOne({uuid: token.client_id})
        });
    }

    addToken(token) {
        return db.collection('token').insertOne(token);
    }

    deleteToken(key) {
        return db.collection('token').findOneAndDelete({key: key});
    }

}
