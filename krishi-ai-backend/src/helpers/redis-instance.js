const { Redis } = require("ioredis");
const { REDIS_HOST } = require("../config/config");

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
  Uri: REDIS_HOST,
  isClusterMode: !IS_DEV,
  enableTLS: !IS_DEV,
});

async function connectRedis() {
  console.log({ REDIS_HOST });
  return redisClient.connect();
}

module.exports = {
  redisClient,
  connectRedis,
};
