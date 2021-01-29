const AuthService = require('./auth-service');
var authService = new AuthService();

module.exports = class PermissionService {
    static checkPermissions(token, permission){
        if (!token) {
            token = "bearer 0000000000000000000000000000000000";
        } 
        const key = token.substr(7);
        return authService.getUserByToken(key).toArray()
            .then(
                result => {
                    const user = result[0].user[0];
                    if (!user) { return null; }
                    if (Array.isArray(permission)){                        
                        return user.permissions.filter(userPermission => permission.findIndex(perm => perm === userPermission) !== -1);
                    } else {
                        return user.permissions.find(userPermission => userPermission === permission );
                    }
                })
            .catch(err => { return null; })
    }
}
