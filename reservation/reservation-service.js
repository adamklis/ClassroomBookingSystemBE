var mongoUtil = require( '../mongo-util' );
var db = mongoUtil.getDb();
module.exports = class ReservationService {

    getReservationsCount(filters){
        return db.collection('reservation').find(filters).count();
    }

    getReservations(filters, sorts, page) {
        return db.collection('reservation').find(filters).sort(sorts).skip(page.offset).limit(page.limit).toArray();
    }

    getReservation(uuid) {
        return db.collection('reservation').findOne({uuid: uuid});
    }

    addReservation(reservation) {
        return db.collection('reservation').insertOne(reservation);
    }

    updateReservation(reservation) {
        return db.collection('reservation').findOneAndUpdate(
            { uuid: reservation.uuid },
            { $set: {user: reservation.user, room: reservation.room, dateFrom: reservation.dateFrom, dateTo: reservation.dateTo, message: reservation.message} }
        );
    }

    deleteReservation(uuid) {
        return db.collection('reservation').findOneAndDelete({uuid: uuid});
    }

}
