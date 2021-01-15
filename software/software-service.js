var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class SoftwareService {

    getSoftwareList() {
        return db.collection('software').find({}).toArray();
    }

    getSoftware(uuid) {
        return db.collection('software').findOne({uuid: uuid});
    }

    addSoftware(software) {
        return db.collection('software').insertOne(software);
    }

    updateSoftware(software) {
        return db.collection('software').findOneAndUpdate(
            { uuid: software.uuid },
            { $set: {name: software.name, quantity: software.quantity, validFrom: software.validFrom, validTo: software.validTo} }
        );
    }

    deleteSoftware(uuid) {
        return db.collection('software').findOneAndDelete({uuid: uuid});
    }

}
