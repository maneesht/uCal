// Router to deal with all /api routes
let jwt = require('jsonwebtoken');
let secretKey = require('./config/config').key;

//checks if person is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}
function verifyToken(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token && token.split(' ')[0] === 'Bearer') {
        // verifies secret and checks exp
        token = token.split(' ')[1];

        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                console.log('err: ', err);
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
}
module.exports = { verifyToken, isLoggedIn };
