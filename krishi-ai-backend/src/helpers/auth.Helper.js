import jwt from "jsonwebtoken";
const {
  AISENSY_PLATFORM_SECRET_KEY,
  SUPERADMIN_URL,
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_SECRET_KEY,
  ENCRYPTION_IV,
} = require("../config/config");
const crypto = require("crypto");

const generateAgentToken = (agent) => {
  const payload = {
    id: agent._id,
    name: agent.name,
    power: agent.power,
    plan: agent.plan,
    displayName: agent.displayName,
    email: agent.email,
    contact: agent.contact,
    company: agent.company,
    clientId: agent.clientId,
    assistantId: agent.assistantIds.length > 0 && agent.assistantIds[0],
    imageUrl: agent.imageUrl,
    currency: agent.currency,
    timezone: agent.timezone,
    companySize: agent.companySize,
    industry: agent.industry,
    firstProjectId: agent.firstProjectId,
    partnerId: agent.partnerId,
  };
  const token = jwt.sign(payload, AISENSY_PLATFORM_SECRET_KEY, {
    expiresIn: 7 * 24 * 3600,
  });
  return token;
};

const generatePartnerToken = (partner) => {
  const payload = {
    id: partner._id,
    userName: partner.loginUsername,
    name: partner.name,
    brandName: partner.brandName,
    faviconUrl: partner.faviconUrl,
    brandLogoUrl: partner.brandLogoUrl,
    loadingGifUrl: partner.loadingGifUrl,
    webhookUrl: partner.webhookUrl,
    currency: partner.currency,
    whiteLabelUrl: partner.whiteLabelUrl,
    defaultPlanFamily: partner.defaultPlanFamily,
    defaultPlanName: partner.defaultPlanName,
    defaultWccPlan: partner.defaultWccPlan,
    agentSize: partner.agentSize,
    onboardingMethod: partner.onboardingMethod,
  };
  const token = jwt.sign(payload, AISENSY_PLATFORM_SECRET_KEY, {
    expiresIn: 24 * 3600,
  });
  return token;
};

const generateEmbeddedSignupUrl = (assistantId, businessId) => {
  const urlData = { assistantId, businessId };
  const stringifiedData = JSON.stringify(urlData);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    ENCRYPTION_SECRET_KEY,
    ENCRYPTION_IV
  );
  let ciphertext = cipher.update(stringifiedData, "utf-8", "hex");
  ciphertext += cipher.final("hex");

  const link = SUPERADMIN_URL + "/register-waba/" + ciphertext;
  return link;
};

export default {
  generateAgentToken,
  generatePartnerToken,
  generateEmbeddedSignupUrl,
};
