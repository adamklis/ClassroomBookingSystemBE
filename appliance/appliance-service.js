var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class ApplianceService {

    getAppliances(filters, sorts) {
        return db.collection('appliance').find(filters).sort(sorts).toArray();
    }

    getAppliance(uuid) {
        return db.collection('appliance').findOne({uuid: uuid});
    }

    addAppliance(appliance) {
        return db.collection('appliance').insertOne(appliance);
    }

    updateAppliance(appliance) {
        return db.collection('appliance').findOneAndUpdate(
            { uuid: appliance.uuid },
            { $set: {name: appliance.name, quantity: appliance.quantity} }
        );
    }

    deleteAppliance(uuid) {
        return db.collection('appliance').findOneAndDelete({uuid: uuid});
    }

}
