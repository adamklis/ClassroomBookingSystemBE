const AuthService = require('./auth-service');
var authService = new AuthService();

module.exports = class PermissionService {
    static checkPermissions(token, permission){
        const key = token.substr(7);
        return authService.getUserByToken(key).toArray()
            .then(
                result => {
                    console.log(result)
                    const user = result[0].user[0];
                    if (!user) { return false; }
                    
                    return user.permissions.findIndex(userPermission => userPermission === permission ) !== -1
                })
            .catch(err => { return false; })
    }
}
