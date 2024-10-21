const mongoURI = process.env.mongoURI;

const CLIENT_ID = "aswkjhebv";

const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:5000";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";

const LIMITER_REDIS_HOST = process.env.LIMITER_REDIS_HOST || "127.0.0.1";

const ASSISTANT_TYPE = process.env.assistantType;

const namespace = process.env.NAMESPACE || "/krishi-bot";

const CACHE_AUTH_TOKEN = process.env.CACHE_AUTH_TOKEN || "token";

const AWS_REGION = process.env.AWS_REGION;

const UPLOAD_BUCKET_URL = process.env.UPLOAD_BUCKET_URL;

const UPLOAD_BUCKET_NAME = process.env.UPLOAD_BUCKET_NAME;

const CONTACT_BUCKET_URL = process.env.CONTACT_BUCKET_URL;

const CONTACT_BUCKET_NAME = process.env.CONTACT_BUCKET_NAME;

const MEDIA_LIBRARY_ACCESS_KEY = process.env.MEDIA_LIBRARY_ACCESS_KEY;

const MEDIA_LIBRARY_SECRET = process.env.MEDIA_LIBRARY_SECRET;

const FCM_AUTH_KEY = process.env.FCM_AUTH_KEY;
const FCM_PROJECT_ID = process.env.FCM_PROJECT_ID;

const WEBHOOK_SERVER_URL = process.env.WEBHOOK_SERVER_URL;

const socketURL = process.env.SOCKET_URL || "http://localhost:5005/webhook";

const socketPath = process.env.mode === "staging" ? "/stg/socket/" : "/socket/";

const API_KEY = process.env.API_KEY;

const TRIAL_API_KEY = process.env.TRIAL_API_KEY;

const TRIAL_WABA_NUMBER_ID = process.env.TRIAL_WABA_NUMBER_ID;
const TRIAL_WHATSAPP_NUMBER = process.env.TRIAL_WHATSAPP_NUMBER;

const AISENSY_PRIVATE_APPS_SECRET = process.env.AISENSY_PRIVATE_APPS_SECRET;

const AISENSY_PRIVATE_APPS_KEY = process.env.AISENSY_PRIVATE_APPS_KEY;

const AISENSY_PLATFORM_SECRET_KEY = process.env.AISENSY_PLATFORM_SECRET_KEY;

const SSO_SECRET_KEY = process.env.SSO_SECRET_KEY;

const AISENSY_BULLMQ_KEY = process.env.AISENSY_BULLMQ_KEY;

const MAX_PARTNER_WEBHOOK_RETRY = process.env.MAX_PARTNER_WEBHOOK_RETRY || 4;

const CAMPAIGN_URL = "http://localhost:5002/campaign/t1";

const INTEGRATION_URL = "http://localhost:5006/apps";

const GOOGLE_SECRET_KEY = process.env.GOOGLE_SECRET_KEY;

const TTL_DATA_API_APP_ID = process.env.TTL_DATA_API_APP_ID;

const TTL_CLUSTER_NAME = process.env.TTL_CLUSTER_NAME;

const TTL_DATABASE_NAME = process.env.TTL_DATABASE_NAME;

const TTL_DATA_API_APIKEY = process.env.TTL_DATA_API_APIKEY;

const TTL_DATA_API_VERSION = process.env.TTL_DATA_API_VERSION;

const SYSTEM_USER_ACCESS_TOKEN = process.env.SYSTEM_USER_ACCESS_TOKEN;
const WABA_APP_ID = process.env.WABA_APP_ID;

const WABA_NUMBER_ID = process.env.WABA_NUMBER_ID;

const BUSINESS_ID = process.env.BUSINESS_ID;

const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID;

const CREDIT_LINE_ID = process.env.CREDIT_LINE_ID;

const SEND_IN_BLUE_API_KEY = process.env.SEND_IN_BLUE_API_KEY;

const META_BASE_URL = process.env.META_BASE_URL;

const AISENSY_AD_ACCOUNT_ID = process.env.AISENSY_AD_ACCOUNT_ID;

const AISENSY_BM_ID = process.env.AISENSY_BM_ID;
const AISENSY_APP_ID = process.env.AISENSY_APP_ID;
const AISENSY_APP_SECRET = process.env.AISENSY_APP_SECRET;
const AISENSY_ADMIN_SU_ACCESS_TOKEN = process.env.AISENSY_ADMIN_SU_ACCESS_TOKEN;
const AISENSY_ADMIN_TOKEN_KEY = process.env.AISENSY_ADMIN_TOKEN_KEY;

const SUPERADMIN_URL = "https://localhost:3000";

const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;
const ENCRYPTION_ALGORITHM = process.env.ENCRYPTION_ALGORITHM;
const SLACK_DEGREGISTER_NOTIFICATIONS_WEBHOOK_URL =
  process.env.SLACK_DEGREGISTER_NOTIFICATIONS_WEBHOOK_URL;

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;
const SUPPORT_PASSWORD = process.env.SUPPORT_PASSWORD;
const SHORT_LINK_URL = process.env.SHORT_LINK_URL;

const SHORT_LINK_ADMIN_KEY = process.env.SHORT_LINK_ADMIN_KEY;
const PARTNER_ASSETS_BUCKET = process.env.PARTNER_ASSETS_BUCKET;

const RAZORPAY_KEY_ID =
  process.env.mode === "production" ? process.env.RAZORPAY_KEY_ID : "s";

const RAZORPAY_SECRET =
  process.env.mode === "production" ? process.env.RAZORPAY_SECRET : "s";

const WEBHOOK_DELIVERY_API = process.env.WEBHOOK_DELIVERY_API;

const VIRTUAL_NUMBER_BUCKET = process.env.VIRTUAL_NUMBER_BUCKET;

const VIRTUAL_NUMBER_BUCKET_URL = process.env.VIRTUAL_NUMBER_BUCKET_URL;

const CAMPAIGN_API_KEY = process.env.CAMPAIGN_API_KEY;
const AISENSY_PARTNER_ID = process.env.AISENSY_PARTNER_ID;

// KRISHI.AI

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

const AISENSY_API_KEY = process.env.AISENSY_API_KEY;

const AISENSY_PROJECT_ID = process.env.AISENSY_PROJECT_ID;

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;

const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS;

const QDRANT_HOST_URL = process.env.QDRANT_HOST_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const TUNE_AI_ORG_KEY = process.env.TUNE_AI_ORG_KEY;

const TUNE_AI_API_KEY = process.env.TUNE_AI_API_KEY;

export {
  TUNE_AI_ORG_KEY,
  TUNE_AI_API_KEY,
  GROQ_API_KEY,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  OPENAI_API_KEY,
  DEEPGRAM_API_KEY,
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  AISENSY_API_KEY,
  AISENSY_PROJECT_ID,
  mongoURI,
  CLIENT_ID,
  WEBHOOK_URL,
  ASSISTANT_TYPE,
  namespace,
  CACHE_AUTH_TOKEN,
  FCM_AUTH_KEY,
  FCM_PROJECT_ID,
  AWS_REGION,
  UPLOAD_BUCKET_URL,
  UPLOAD_BUCKET_NAME,
  MEDIA_LIBRARY_ACCESS_KEY,
  MEDIA_LIBRARY_SECRET,
  CONTACT_BUCKET_NAME,
  CONTACT_BUCKET_URL,
  WEBHOOK_SERVER_URL,
  socketURL,
  socketPath,
  API_KEY,
  TRIAL_API_KEY,
  TRIAL_WHATSAPP_NUMBER,
  AISENSY_PRIVATE_APPS_SECRET,
  AISENSY_PRIVATE_APPS_KEY,
  AISENSY_PLATFORM_SECRET_KEY,
  CAMPAIGN_URL,
  INTEGRATION_URL,
  AISENSY_BULLMQ_KEY,
  MAX_PARTNER_WEBHOOK_RETRY,
  TTL_DATA_API_APP_ID,
  TTL_CLUSTER_NAME,
  TTL_DATABASE_NAME,
  TTL_DATA_API_APIKEY,
  TTL_DATA_API_VERSION,
  SSO_SECRET_KEY,
  SYSTEM_USER_ACCESS_TOKEN,
  BUSINESS_ID,
  SYSTEM_USER_ID,
  CREDIT_LINE_ID,
  SEND_IN_BLUE_API_KEY,
  WABA_APP_ID,
  META_BASE_URL,
  AISENSY_BM_ID,
  AISENSY_APP_ID,
  AISENSY_ADMIN_SU_ACCESS_TOKEN,
  AISENSY_APP_SECRET,
  AISENSY_ADMIN_TOKEN_KEY,
  TRIAL_WABA_NUMBER_ID,
  WABA_NUMBER_ID,
  AISENSY_AD_ACCOUNT_ID,
  GOOGLE_SECRET_KEY,
  SUPERADMIN_URL,
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_IV,
  ENCRYPTION_SECRET_KEY,
  SHORT_LINK_URL,
  SHORT_LINK_ADMIN_KEY,
  SLACK_DEGREGISTER_NOTIFICATIONS_WEBHOOK_URL,
  SUPPORT_EMAIL,
  SUPPORT_PASSWORD,
  PARTNER_ASSETS_BUCKET,
  RAZORPAY_KEY_ID,
  RAZORPAY_SECRET,
  WEBHOOK_DELIVERY_API,
  REDIS_HOST,
  LIMITER_REDIS_HOST,
  VIRTUAL_NUMBER_BUCKET,
  VIRTUAL_NUMBER_BUCKET_URL,
  CAMPAIGN_API_KEY,
  AISENSY_PARTNER_ID,
  QDRANT_HOST_URL,
  QDRANT_API_KEY,
};
