const express = require('express')
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const UserService = require('./user-service');
var userService = new UserService();

router.get('/', function (req, res) {
    userService.getUsers()
        .then(result => res.send(
            result.map((user) => {
                delete user.password;
                return user;
            })
        ))
        .catch(err => res.status(400).send(err));
})

router.get('/:uuid', function (req, res) {
    userService.getUser(req.params.uuid)
        .then(result => {
            if (!result) {res.status(404).send('Not found')}
            else {
                delete result.password;
                res.send(result)
            }
        })
        .catch(err => res.status(400).send(err));
})

router.post('/', jsonParser, function (req, res) {

    userService.getUsers()
    .then(users => {
        if ( users.find(user => user.email === req.body.email)) {
            return res.status(400).send("SHARED.ERROR.USER_EXIST");
        } else {
            const { error } = validateUser(req.body)
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
            
            const newUser = {
                uuid: uuidv4(),
                forename: req.body.forename,
                surname: req.body.surname,
                contact: req.body.contact,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                permissions: []
            }
        
            userService.addUser(newUser)
                .then(result => {
                    addedUser = result.ops[0];
                    delete addedUser.password
                    res.send(addedUser)
                })
                .catch(err => res.status(400).send(err));
        }
    })
    .catch(err => res.status(400).send(err))
       
})

router.put('/:uuid', jsonParser, function (req, res) {
    const { error } = validateUser(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const updatedUser = {
        uuid: req.body.uuid,
        forename: req.body.forename,
        surname: req.body.surname,
        contact: req.body.contact,
        email: req.body.email
    }
    if (req.body.password) {
        updatedUser.password =  bcrypt.hashSync(req.body.password, 10)
    }
    userService.updateUser(updatedUser)
        .then(result => {
            resultUser = result.value;
            delete resultUser.password
            res.send(resultUser)
        })
        .catch(err => res.status(400).send(err));
})

router.put('/:uuid/permissions', jsonParser, function (req, res) {
    const { error } = validatePermissions(req.body);
    if (error) {
        return res.status(400).send(error.message);
    }

    userService.updateUserPermissions(req.params.uuid, req.body)
        .then(result => {
            res.send(result.value.permissions)
        })
        .catch(err => res.status(400).send(err));
})

router.delete('/:uuid', function (req, res) {
    userService.deleteUser(req.params.uuid)
        .then(result => {
            if (!result.value) {res.status(404).send('Not found')}
            else {
                resultUser = result.value;
                delete resultUser.password
                res.send(resultUser)
            }
        })
        .catch(err => res.status(400).send(err));
})


function validateUser(user) {
    const schema = Joi.object({
        uuid: Joi.string().allow(null),
        forename: Joi.string().required(),
        surname: Joi.string().required(),
        contact: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().allow(null).allow(''),
    });

    return schema.validate(user);
}

function validatePermissions(permissions) {
    if (!permissions) {
        return {error: {type: "Wrong permission", message: "Request body must be an array of permissions."}};
    }

    const validPermissions = [
        "APPLIANCE_EDIT","APPLIANCE_VIEW","RESERVATION_EDIT","RESERVATION_EDIT_USER","RESERVATION_VIEW","RESERVATION_VIEW_USER",
        "ROOM_EDIT","ROOM_VIEW","SOFTWARE_EDIT","SOFTWARE_VIEW","USER_EDIT","USER_VIEW","PERMISSION_VIEW","PERMISSION_EDIT","PROTECTED_USER"]

    let permissionNotFound = false;
    permissions.forEach(permission => {
        if (validPermissions.findIndex(validPermission => validPermission === permission) === -1 ) {
            permissionNotFound = true;
            return;
        }
    })

    if (permissionNotFound) {
       return {error: {type: "Wrong permission", message: "Unexpected permission."}};
    }
    return {error: null};
}

module.exports = router