var env = process.env.NODE_ENV || 'development';
let secretKey = '3018d142-0c21-11e8-ba89-0ed5f89f718b'; //change to environment variable for dev/prod
module.exports = { key: secretKey };
if (env === 'development' || env === 'test') {
    const config = require('./config.json');
    var envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key]
    });
}
