const rateLimit = require('express-rate-limit');
const moment = require('moment');
const redis = require('redis');

const redisClient = redis.createClient();
const WINDOW_SIZE_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 1;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: WINDOW_SIZE_IN_HOURS * 60 * 60 * 1000, // 24 hrs in millseconds
  max: MAX_WINDOW_REQUEST_COUNT,
  message: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`,
  headers: true
});

exports.customRedisRateLimiter = async function (req, res, next) {

    try {
        //check if redis client exists
        if(!redisClient) {
            throw new Error(`Redis client does not exists`);
        }

        //fetch records of current user using IP address, returns null when no record is found
        //In case if you have userids, you can store userids and check the records against the userids
        redisClient.get(req.ip, (err, record) => {
            if(err) throw err;
            const currentRequestTime = moment();

            console.log('record ' + record);

            //If no record is found, create a new record for user and store to redis
            if(record == null) {
                let newRecord = [];
                let requestLog = {
                    reqestTimestamp: currentRequestTime.unix(),
                    requestCount: 1
                };
                newRecord.push(requestLog);
                redisClient.set(req.ip, JSON.stringify(newRecord)); //storing record to redis
                next();
            }

            // If record exists, parse it's value and calculcate number of requests the user has made within the last window
            let data = JSON.parse(record);
            let windowStartTimestamp = moment().subtract(WINDOW_SIZE_IN_HOURS, 'hours').unix();

            let requestsWithinWindow = data.filter(entry => {
                return entry.reqestTimestamp > windowStartTimestamp;
            });

            console.log('requestsWithinWindow ==> ', requestsWithinWindow);

            let totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
                return accumulator + entry.requestCount;
            }, 0);

            // If number of requests made is greater than or equal to the desired maximum, return an error
            if(totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
                res.status(429).json({
                    status: false, 
                    msg: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} limit`, 
                    data: [] 
                });
            } else {
                // If number if requests made is lesser than the allowed maximum, log new entry
                let lastRequestLog = data[data.length - 1];
                let potentialCurrentWindowIntervalStartTimestamp = currentRequestTime.subtract(WINDOW_LOG_INTERVAL_IN_HOURS, 'hours').unix();

                // If interval has not passed since last request log, increment counter
                if(lastRequestLog.reqestTimestamp > potentialCurrentWindowIntervalStartTimestamp) {
                    lastRequestLog.requestCount ++;
                    data[data.length - 1] = lastRequestLog;
                } else {
                    // If interval has passed, log new entry for current user and timestamp
                    data.push({
                        requestTimestamp: currentRequestTime.unix(),
                        requestCount: 1
                    });
                }
                redisClient.set(req.ip, JSON.stringify(data));
                next();
            }
        });
    } catch (error) {
        next(error);
    }
};