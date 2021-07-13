const dotenv = require('dotenv');
dotenv.config();

const loadEnvVariable = envName => {
    const env = process.env[envName];
    if(env == null) {
        throw new Error(`Environment Variable ${envName} is undefined`);
    }
    return env;
};

const config = {
    app: {
        port: loadEnvVariable('port') || 8080
    }
};

module.exports = config;