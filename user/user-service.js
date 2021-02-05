var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class UserService {

    getUsersCount(filters) {
        if (filters?.aggregate){
            return db.collection('user').aggregate([filters.aggregate.addFields, filters.aggregate.match, {$count: 'count'}]).next();
        } else {
            return db.collection('user').find(filters).count();
        }
    }

    getUsers(filters, sorts, page) {
        if (filters?.aggregate){
            return db.collection('user').aggregate([filters.aggregate.addFields, filters.aggregate.match]).skip(page.offset).limit(page.limit).toArray();
        } else {
            return db.collection('user').find(filters).sort(sorts).skip(page.offset).limit(page.limit).toArray();
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
