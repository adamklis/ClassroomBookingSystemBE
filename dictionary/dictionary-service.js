var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class ApplianceService {

    getDictionary(key) {
        return db.collection('dictionary').findOne({key: key});
    }

}
