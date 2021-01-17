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
        return db.collection('token').aggregate([
            { 
                $lookup:
                {
                    from: 'user',
                    localField: 'user_uuid',
                    foreignField: 'uuid',
                    as: 'user'
                }
            },
            {
                $match:
                {
                    key: key
                }
            }
        ])
    }

    addToken(token) {
        return db.collection('token').insertOne(token);
    }

    deleteToken(key) {
        return db.collection('token').findOneAndDelete({key: key});
    }

}
