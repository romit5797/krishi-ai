const Decode = require("jwt-decode");
const {
  RateLimiterRedis,
  RateLimiterMemory,
} = require("rate-limiter-flexible");
const { LIMITER_REDIS_HOST, AISENSY_PARTNER_ID } = require("../config/config");
const { Redis } = require("ioredis");

/**
 * @description Mode of the application i.e. production, staging, prestaging or development
 */
const MODE = process.env.mode || "development";

/**
 * @description Flag to check if the application is in development mode
 */
const IS_DEV = MODE === "development";

/**
 *
 * @param {{Uri: string, isClusterMode: boolean, enableTLS: boolean}}
 */
function createRedis({ Uri, isClusterMode, enableTLS }) {
  if (!isClusterMode)
    return new Redis({
      host: Uri,
      port: 6379,
      lazyConnect: true,
      ...(enableTLS && {
        tls: {
          rejectUnauthorized: false,
        },
      }),
    });
  return new Redis.Cluster(
    [
      {
        host: Uri,
        port: 6379,
      },
    ],
    {
      scaleReads: "slave",
      lazyConnect: true,
      ...(enableTLS && {
        redisOptions: {
          tls: {
            rejectUnauthorized: false,
          },
        },
      }),
    }
  );
}

const redisClient = createRedis({
  Uri: LIMITER_REDIS_HOST,
  isClusterMode: false,
  enableTLS: !IS_DEV,
});

const validLimits = [
  1500, 750, 500, 375, 300, 250, 214, 187, 150, 125, 100, 75, 60, 50, 40, 30,
  20, 15, 10, 8, 6, 5, 4, 3, 2, 1,
];
const defaultRate = 150;
const defaultConsume = 10;

const rateLimiterMemory = new RateLimiterMemory({
  points: defaultRate * defaultConsume,
  duration: 60,
});

const rateLimiterPerMinute = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rest-api",
  points: defaultRate * defaultConsume, // Number of points
  duration: 60, // Per 60 seconds,
  inMemoryBlockOnConsumed: defaultRate * defaultConsume * 3, // If user hit twice the alloted limit per minute
  inMemoryBlockDuration: 2 * 60, //Block for 2 mins, so no requests go to Redis
  insuranceLimiter: rateLimiterMemory, // In case redis is down
});

const rateLimiterPerSecond = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rest-api-message",
  points: defaultRate * defaultConsume, // Number of points
  duration: 1, // Per seconds,
  inMemoryBlockOnConsumed: defaultRate * defaultConsume * 3, // If user hit twice the alloted limit per minute
  inMemoryBlockDuration: 2 * 60, //Block for 2 mins, so no requests go to Redis
  insuranceLimiter: rateLimiterMemory, // In case redis is down
});

const rateLimiter = (timeInterval, limit) => (req, res, next) => {
  // if (!redisClient)
  //   return res.status(500).send("Limiter Redis client not available");

  const { authorization } = req.headers || {};
  const { apiKey } = req.body || {};
  const { _id: assistantId, apiLimit: assistantLimit } = req.assistant || {};
  const { _id: partnerId, apiLimit: partnerLimit } = req.partner || {};

  const partnerJwtKey = req.headers["x-aisensy-partner-api-jwt-key"];
  const partnerKey = req.headers["x-aisensy-partner-api-key"];
  const projectApiKey = req.headers["x-aisensy-project-api-pwd"];

  let apiLimit = limit || defaultRate;
  let suffix = "";
  let points = defaultConsume;

  const token = authorization || partnerJwtKey || apiKey;

  if (assistantId) {
    suffix = assistantId;
    apiLimit = assistantLimit || apiLimit;
  } else if (partnerId && partnerId !== AISENSY_PARTNER_ID) {
    suffix = partnerId;
    apiLimit = partnerLimit || apiLimit;
  } else if (token) {
    const decodedData = Decode(token);
    suffix = decodedData?.id;
    apiLimit = decodedData?.apiLimit || apiLimit;
  } else if (partnerKey || projectApiKey) {
    const id = req.url?.split("/")[1];
    suffix = id;
  }

  if (apiLimit && !validLimits.includes(apiLimit)) {
    console.log(JSON.stringify(req.body), " ", 2);
    return res.status(400).send({ message: "Invalid Rate Limiting" });
  }

  if (!suffix) {
    suffix = req.ip;
    points = apiLimit < 5 ? defaultConsume * apiLimit : defaultConsume * 5; //For Unauthrozied requests, rate decresed by 5 times
  }

  if (!suffix) {
    console.log(JSON.stringify(req.body), " ", 2);
    return res.status(400).send({ message: "Invalid Request" });
  }

  const key = `${req.originalUrl}:${suffix}`;
  const pointsToConsume = Math.floor((defaultRate * points) / apiLimit);

  if (timeInterval === "sec") {
    rateLimiterPerSecond
      .consume(key, pointsToConsume)
      .then((res) => {
        next();
      })
      .catch((err) => {
        res
          .status(429)
          .send({ message: "Too Many Requests, retry in sometime" });
      });
  } else {
    rateLimiterPerMinute
      .consume(key, pointsToConsume)
      .then((res) => {
        next();
      })
      .catch((err) => {
        res
          .status(429)
          .send({ message: "Too Many Requests, retry in sometime" });
      });
  }
};

/**
 * @RateLimit connect to FB Button
 */
const MAX_CONNECT_TO_FB_LIMIT = process.env.MAX_CONNECT_TO_FB_LIMIT || 30;
const rateLimiterConnectToFbBtn = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "connectToFb",
  points: MAX_CONNECT_TO_FB_LIMIT, // Number of points
  duration: 60 * 60, // Per hour,
  inMemoryBlockOnConsumed: 40, // If user hit twice the alloted limit per minute
  inMemoryBlockDuration: 30 * 60, //Block for 30mins, so no requests go to Redis
  insuranceLimiter: rateLimiterMemory, // In case redis is down
});
const rateLimitConnectToFB = async (assistantId) => {
  try {
    const data = await rateLimiterConnectToFbBtn.consume(assistantId, 1);
    return data.remainingPoints;
  } catch (error) {
    if (error?.remainingPoints <= 0) {
      return error.remainingPoints;
    }
    throw error;
  }
};

module.exports = {
  rateLimiter,
  rateLimitConnectToFB,
};
