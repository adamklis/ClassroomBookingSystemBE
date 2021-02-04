var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class RoomService {

    getRoomsCount(filters){
        return db.collection('room').find(filters).count();
    }

    getRooms(filters, sorts, page) {
        return db.collection('room').find(filters).sort(sorts).skip(page.offset).limit(page.limit).toArray();
    }

    getRoom(uuid) {
        return db.collection('room').findOne({uuid: uuid});
    }

    addRoom(room) {
        return db.collection('room').insertOne(room);
    }

    updateRoom(room) {
        return db.collection('room').findOneAndUpdate(
            { uuid: room.uuid },
            { $set: {name: room.name, numberOfSeats: room.numberOfSeats, appliances: room.appliances, software: room.software} }
        );
    }

    deleteRoom(uuid) {
        return db.collection('room').findOneAndDelete({uuid: uuid});
    }

}
