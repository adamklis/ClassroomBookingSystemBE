var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class UserService {

    getUsers(filters, sorts) {
        if (filters.aggregate){
            console.log(filters.aggregate.addFields)
            console.log(filters.aggregate.match)
            return db.collection('user').aggregate([filters.aggregate.addFields, filters.aggregate.match]).toArray();
        } else {
            return db.collection('user').find(filters).sort(sorts).toArray();
        }
    }

    getUser(uuid) {
        return db.collection('user').findOne({uuid: uuid});
    }

    getUserByEmail(email) {
        return db.collection('user').findOne({email: email});
    }

    addUser(user) {
        return db.collection('user').insertOne(user);
    }

    updateUser(user) {
        if (user.password) {
            return db.collection('user').findOneAndUpdate(
                { uuid: user.uuid },
                { $set: {forename: user.forename, surname: user.surname, contact: user.contact, email: user.email, password: user.password} }
            );
        } else {
            return db.collection('user').findOneAndUpdate(
                { uuid: user.uuid },
                { $set: {forename: user.forename, surname: user.surname, contact: user.contact, email: user.email} }
            );
        }
        
    }

    updateUserPermissions(uuid, permissions) {
        return db.collection('user').findOneAndUpdate(
            { uuid: uuid },
            { $set: {permissions: permissions} }
        );
    }

    deleteUser(uuid) {
        return db.collection('user').findOneAndDelete({uuid: uuid});
    }

}
