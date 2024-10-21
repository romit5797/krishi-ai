import {
  ASSISTANT_TYPE,
  AISENSY_PLATFORM_SECRET_KEY,
} from "../config/config.js";
import jwt from "jsonwebtoken";
import {
  getAssistantFromCache,
  setAssistantInCache,
} from "../helpers/cache.service.js";
import Assistant from "../models/Assistant.js";
import * as agentDb from "../services/agentDb.js";

const updateAssistantInCache = async (assistantId) => {
  const assistant = await Assistant.findOne(
    { _id: assistantId },
    {
      _id: 1,
      assistantName: 1,
      sessionKey: 1,
      clientId: 1,
      whatsappNumber: 1,
      activePlan: 1,
      remainingSessionMessages: 1,
      remainingEnterpriseSessions: 1,
      templateCredit: 1,
      partnerWhatsappCredit: 1,
      remainingCredit: 1,
      metaAdsCredit: 1,
      excessUsage: 1,
      appName: 1,
      gupshupApiKey: 1,
      testNumber: 1,
      attributes: 1,
      type: 1,
      status: 1,
      dialogflowType: 1,
      currency: 1,
      country: 1,
      templateTier: 1,
      planActivatedOn: 1,
      isWhatsappVerified: 1,
      dfProjectId: 1,
      maxAgents: 1,
      createdAt: 1,
      API_CODE: 1,
      WEB_KEY: 1,
      MO_KEY: 1,
      deliveryCallbackURL: 1,
      inboundMessageURL: 1,
      CleverTapkey: 1,
      dailyTemplateLimit: 1,
      autoResolve: 1,
      apiKey360: 1,
      providerType: 1,
      gupshupAppId: 1,
      gupshupAppToken: 1,
      macUsage: 1,
      unbilledMac: 1,
      cardAdded: 1,
      macQuota: 1,
      subscriptionStatus: 1,
      appliedForWaba: 1,
      ongoingBillingProcess: 1,
      timezone: 1,
      isEcom: 1,
      leadSquaredWebhookUrl: 1,
      webEngageWebhookUrl: 1,
      WebengageEventId: 1,
      WebengageEventKey: 1,
      moEngageWebhookUrl: 1,
      webEngageKey: 1,
      partnerId: 1,
      wabaAppId: 1,
      wabaNumberId: 1,
      optSetting: 1,
      directApikey: 1,
      directApiWebookUrl: 1,
      freeTierCoversationCount: 1,
      wabaActivatedOn: 1,
      apiFormDetails: 1,
      autoWccRecharge: 1,
      chatSearchEnabled: 1,
      selectedMetaBusinessAccessToken: 1,
      selectedMetaBusinessId: 1,
      subscriptionId: 1,
      zohoOrganizationId: 1,
      minAllowedBalance: 1,
      aggCreditRecharged: 1,
      flowConfiguration: 1,
      addons: 1,
      apiLimit: 1,
      referralId: 1,
      orderCheckoutDetails: 1,
      cleverTapOptField: 1,
      moEngageOptField: 1,
      webEngageOptField: 1,
      isCatalogueVisibleOnBusiness: 1,
      webhooks: 1,
    }
  ).lean();

  if (!assistant) {
    return null;
  }

  const cachedAssistant = await setAssistantInCache(assistant);
  console.log("successfully updated assistant cache");
  return cachedAssistant;
};

const findAssistants = async (
  queryObject,
  projection = {},
  sortObj = { createdAt: -1 },
  limit
) => {
  try {
    const assistants = await Assistant.find(queryObject, projection)
      .sort(sortObj)
      .limit(limit)
      .lean();
    return [null, assistants];
  } catch (error) {
    return [error, null];
  }
};

const findOneAssistant = async (queryObject, projection = {}) => {
  try {
    const assistant = await Assistant.findOne(queryObject, projection);
    return [null, assistant];
  } catch (error) {
    return [error, null];
  }
};

const findOneAssistantWithCache = async (queryObject) => {
  try {
    let assistant = await getAssistantFromCache(queryObject._id);

    if (!assistant) {
      assistant = await updateAssistantInCache(queryObject._id);
    }
    return [null, assistant];
  } catch (error) {
    return [error, null];
  }
};

const findAssistantsWithOrders = async (queryObject) => {
  try {
    const assistants = await Assistant.aggregate([
      { $match: queryObject },
      {
        $lookup: {
          from: "orders",
          localField: "orders",
          foreignField: "_id",
          as: "orders",
        },
      },
    ]);
    return [null, assistants];
  } catch (error) {
    return [error, null];
  }
};

const createAssistant = async (assistantObj) => {
  try {
    const { assistantName, clientId, type } = assistantObj;
    assistantObj.freeTierCoversationCount = 0;
    const existingAssistant = await Assistant.findOne({ assistantName });
    if (existingAssistant) {
      throw { errorMessage: "Project name already exists!" };
    }

    // Check if Free assistant has been consumed
    const freeAssistant = await Assistant.findOne({ clientId });
    assistantObj.type = type || ASSISTANT_TYPE || "v3";
    if (freeAssistant) {
      assistantObj.activePlan = "NONE";
      if (assistantObj.type === "v4") {
        assistantObj.providerType = "v3";
        assistantObj.maxAgents = 15;
        assistantObj.tagLimit = 10;
        assistantObj.attributeLimit = 5;
        assistantObj.campaignAnalyticsEnabled = false;
        assistantObj.campaignSchedulingEnabled = false;
        assistantObj.clickTrackingEnabled = false;
      } else if (assistantObj.type === "v3") {
        assistantObj.providerType = "v2";
        assistantObj.macUsage = 0;
        assistantObj.unbilledMac = 0;
        assistantObj.maxAgents = 15;
      } else if (assistantObj.type === "v2") {
        assistantObj.remainingSessionMessages = 0;
        assistantObj.templateCredit = 0;
        assistantObj.excessUsage = 0;
      } else {
        assistantObj.remainingCredit = 0;
      }
    } else {
      if (assistantObj.type === "v4") {
        assistantObj.providerType = "v3";
        assistantObj.maxAgents = 15;
        assistantObj.tagLimit = 10;
        assistantObj.attributeLimit = 5;
        assistantObj.campaignAnalyticsEnabled = false;
        assistantObj.campaignSchedulingEnabled = false;
        assistantObj.clickTrackingEnabled = false;
        assistantObj.activePlan = assistantObj.activePlan || "NONE";
      } else if (assistantObj.type === "v3") {
        assistantObj.providerType = "v2";
        assistantObj.maxAgents = 15;
        assistantObj.activePlan = assistantObj.activePlan || "NONE";
      } else if (assistantObj.type === "v2") {
        assistantObj.activePlan = "FREE";
        assistantObj.remainingSessionMessages = 1000;
        assistantObj.templateCredit = 0;
        assistantObj.excessUsage = 0;
      } else {
        assistantObj.activePlan = "FREE";
        assistantObj.remainingCredit = 50 * 100000;
      }
      assistantObj.planActivatedOn = new Date();
    }
    const assistant = new Assistant(assistantObj);

    //  Generate API KEY
    const payload = {
      id: assistant._id,
      name: assistant.assistantName,
      appName: assistant.appName,
      clientId: assistant.clientId,
      activePlan: assistant.activePlan,
    };

    const apiKey = await new Promise((resolve, reject) => {
      jwt.sign(payload, AISENSY_PLATFORM_SECRET_KEY, async (err, token) => {
        if (err) {
          resolve("");
        } else {
          resolve(token);
        }
      });
    });

    if (apiKey) {
      assistant.API_CODE = apiKey;
    }
    await assistant.save();
    return [null, assistant];
  } catch (error) {
    return [error, null];
  }
};

const updateOneAssistant = async (matchObj, updateObj, options) => {
  try {
    const successObj = await Assistant.updateOne(matchObj, updateObj, options);

    return [null, successObj];
  } catch (error) {
    return [error, null];
  }
};

const findAndUpdateOneAssistant = async (matchObj, updateObj, options) => {
  try {
    const successObj = await Assistant.findOneAndUpdate(
      matchObj,
      updateObj,
      options
    );

    return [null, successObj];
  } catch (error) {
    return [error, null];
  }
};

const updateAssistant = async (matchObj, setObj) => {
  try {
    const successObj = await Assistant.findOneAndUpdate(matchObj, {
      $set: setObj,
    });

    return [null, successObj];
  } catch (error) {
    return [error, null];
  }
};

const updateAssistantReturnNew = async (matchObj, setObj, options) => {
  try {
    const successObj = await Assistant.findOneAndUpdate(
      matchObj,
      { $set: setObj },
      { new: true, ...options }
    ).lean();

    if (successObj) {
      delete successObj.selectedMetaBusinessAccessToken;
      delete successObj.fbUserToken;
      delete successObj.gupshupApiKey;
      delete successObj.apiKey360;
      delete successObj.sessionKey;
      delete successObj.API_CODE;
      delete successObj.wabaAccessToken;
      delete successObj.fbGrantedScopes;
    }

    return [null, successObj];
  } catch (error) {
    return [error, null];
  }
};

const deleteAssistant = async (assistantQuery) => {
  try {
    const response = await Assistant.updateOne(assistantQuery, {
      $set: { disabled: true },
    });
    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const fullyDeleteAssistant = async (clientId) => {
  try {
    const response = await Assistant.deleteMany({ clientId });

    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const updateAssistants = async (matchObj, updateObj) => {
  try {
    const response = await Assistant.updateMany(matchObj, updateObj);

    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const findAssistantCount = async (queryObj, filter = {}, addFields = null) => {
  try {
    const { agentName, OwnerFilter, companySize } = filter;

    // Create Agent Query If Agent Name Exists
    let agentfilter = {};
    if (companySize) {
      agentfilter.companySize = companySize;
    }
    if (agentName) {
      agentfilter = {
        $or: [
          { name: { $regex: agentName, $options: "i" } },
          { displayName: { $regex: agentName, $options: "i" } },
        ],
      };
    }

    // Add Owner Query If Exists
    let ownerFilter = {};
    if (OwnerFilter && OwnerFilter !== "Everyone") {
      ownerFilter = {
        "crmDetails.salesOwner":
          OwnerFilter !== "UNASSIGNED" ? OwnerFilter : { $exists: false },
      };
    }

    // Query Agents
    if (agentName || OwnerFilter || companySize) {
      const queryAgents = { ...agentfilter, ...ownerFilter, power: 2 };
      const [agentsError, agents] = await agentDb.findAgents(queryAgents, {
        clientId: 1,
      });
      if (agentsError) throw agentsError;
      queryObj.clientId = { $in: agents.map((e) => e.clientId) };
    }

    // Create Pipeline
    const pipeline = [];

    if (addFields) pipeline.push({ $addFields: addFields });

    pipeline.push({ $match: queryObj });
    pipeline.push({ $count: "count" });

    const result = await Assistant.aggregate(pipeline);
    const count = result[0]?.count || 0;

    return [null, count];
  } catch (error) {
    return [error, false];
  }
};

const findOwnerReportCount = async (queryObj) => {
  try {
    const SALES_TEAM = [
      "Mitul Malavia",
      "Manvendra Thanua",
      "Ridhi Grover",
      "Shobhit Singh",
      "Surendra Srivastava",
      "Vaibhav Gianchandani",
      "Yatin Kapoor",
      "Harsha Singh",
      "Mohammad Ali",
      "Pritam Debnath",
      "Sundari Tomar",
      "Sunidhi Singh",
      "Tanisha Gupta",
    ];

    const [error, agents] = await agentDb.findAgents(
      { "crmDetails.salesOwner": { $in: SALES_TEAM }, power: 2 },
      { _id: 0, clientId: 1, crmDetails: 1 }
    );
    if (error) throw error;
    queryObj.clientId = { $in: agents.map((agent) => agent.clientId) };
    const clientToTeamMap = agents.reduce((map, agent) => {
      const { clientId, crmDetails } = agent;
      map[clientId] = crmDetails.salesOwner;
      return map;
    }, {});

    const assistants = await Assistant.find(queryObj, {
      _id: 0,
      clientId: 1,
      tierLimit: 1,
      wabaProgressStep: 1,
      fbManagerVerified: 1,
      dailyTemplateLimit: 1,
      isWhatsappVerified: 1,
      displayNameVerified: 1,
      aggConversationCount: 1,
    }).lean();

    const data = {};
    const obj = {
      "Project Created": 0,
      "API Procurement": 0,
      "FB Verification": 0,
      "Display Verification": 0,
      "Tier 1": 0,
      Broadcast: 0,
      "Tier 2": 0,
      "Drop Off": 0,
    };

    // Preprocess sales stages data for quick lookup
    const salesStagesMap = {};
    for (const agent of agents) {
      const { clientId, crmDetails } = agent;
      const { salesStages } = crmDetails;

      if (salesStages) {
        salesStagesMap[clientId] = salesStages.some(
          (stage) => stage.name === "Drop Off" && stage.completed
        );
      }
    }

    for (const assistant of assistants) {
      const {
        clientId,
        wabaProgressStep,
        fbManagerVerified,
        dailyTemplateLimit,
        isWhatsappVerified,
        displayNameVerified,
        aggConversationCount = {},
      } = assistant;
      const {
        utility = 0,
        marketing = 0,
        authentication = 0,
        business_initiated = 0,
      } = aggConversationCount;
      const totalBIC =
        utility + marketing + authentication + business_initiated;

      const salesPerson = clientToTeamMap[clientId];
      if (!data[salesPerson]) {
        data[salesPerson] = { ...obj };
      }

      if (!isWhatsappVerified) {
        data[salesPerson]["Project Created"] += 1;
      }

      if (
        isWhatsappVerified &&
        wabaProgressStep === 9 &&
        !["verified", "VERIFIED"].includes(fbManagerVerified)
      ) {
        data[salesPerson]["API Procurement"] += 1;
      }

      if (
        ["verified", "VERIFIED"].includes(fbManagerVerified) &&
        !["verified", "ready", "APPROVED"].includes(displayNameVerified)
      ) {
        data[salesPerson]["FB Verification"] += 1;
      }

      if (
        dailyTemplateLimit < 1000 &&
        ["verified", "ready", "APPROVED"].includes(displayNameVerified)
      ) {
        data[salesPerson]["Display Verification"] += 1;
      }

      if (dailyTemplateLimit === 1000) {
        data[salesPerson]["Tier 1"] += 1;
      }

      if (totalBIC >= 200) {
        data[salesPerson]["Broadcast"] += 1;
      }

      if (dailyTemplateLimit > 1000) {
        data[salesPerson]["Tier 2"] += 1;
      }

      if (salesStagesMap[clientId]) {
        data[salesPerson]["Drop Off"] += 1;
      }
    }
    return [null, data];
  } catch (error) {
    return [error, false];
  }
};

const findAssistantsSuperAdmin = async (queryObj, project, options) => {
  try {
    const { limit, skip } = options;
    const assistants = await Assistant.aggregate([
      { $match: queryObj },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    return [null, assistants];
  } catch (error) {
    return [error, false];
  }
};

const findAssistantScrollSuperAdmin = async (
  queryObj,
  filter,
  options,
  addFields = null
) => {
  try {
    const { limit, skip } = options;
    const { OwnerFilter, sortField, agentName, companySize } = filter;

    // Create Agent Query If Agent Name Exists
    let agentfilter = {};
    if (companySize) {
      agentfilter.companySize = companySize;
    }
    if (agentName) {
      agentfilter = {
        $or: [
          { name: { $regex: agentName, $options: "i" } },
          { displayName: { $regex: agentName, $options: "i" } },
        ],
      };
    }

    // Add Owner Query If Exists
    let ownerFilter = {};
    if (OwnerFilter) {
      ownerFilter = {
        "crmDetails.salesOwner":
          OwnerFilter !== "UNASSIGNED" ? OwnerFilter : { $exists: false },
      };
    }

    // Query Agents
    if (agentName || OwnerFilter || companySize) {
      const queryAgents = { ...agentfilter, ...ownerFilter, power: 2 };
      const [agentsError, agents] = await agentDb.findAgents(queryAgents, {
        clientId: 1,
        crmDetails: 1,
      });
      if (agentsError) throw agentsError;
      queryObj.clientId = { $in: agents.map((agent) => agent.clientId) };
    }

    // Create Pipeline
    const pipeline = [];

    if (addFields) pipeline.push({ $addFields: addFields });

    pipeline.push({ $match: queryObj });

    const lookupPipeline = [
      { $match: { $expr: { $eq: ["$clientId", "$$clientId"] } } },
      { $project: { crmDetails: 1 } },
    ];
    const lookup = {
      from: "agents",
      let: { clientId: "$clientId" },
      pipeline: lookupPipeline,
      as: "crmInfo",
    };

    pipeline.push({ $lookup: lookup });
    pipeline.push({ $sort: { [sortField]: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const assistants = await Assistant.aggregate(pipeline);

    return [null, assistants];
  } catch (error) {
    return [error, false];
  }
};

const findClientsTestNumber = async (clients) => {
  try {
    const assistants = await Assistant.find({ clientId: { $in: clients } });
    return [null, assistants];
  } catch (error) {
    return [error, false];
  }
};

// Warning: Only for superadmin usages
const setAssistantfields = async (queryObj, updateQuery) => {
  try {
    const templateMessage = await Assistant.findOneAndUpdate(
      { ...queryObj },
      { ...updateQuery }
    );
    return [null, templateMessage];
  } catch (error) {
    return [error, null];
  }
};

const findAssistantById = async (assistantId) => {
  const assistant = await Assistant.findById(assistantId, {
    orders: 0,
    sessionKey: 0,
  }).lean();
  return assistant;
};

const findOneLeanAssistant = async (queryObj, projection) => {
  try {
    const assistant = await Assistant.findOne(queryObj, projection).lean();
    return [null, assistant];
  } catch (error) {
    return [error, null];
  }
};

const updateSubscriptionAssistant = async (queryObj, updateObj) => {
  try {
    const assistant = await Assistant.updateOne(queryObj, updateObj);
    return [null, assistant];
  } catch (error) {
    return [error, null];
  }
};

const findReqAssistant = async (queryObj) => {
  try {
    const assistant = await Assistant.findOne(queryObj);
    return [null, assistant];
  } catch (error) {
    return [error, null];
  }
};

const findAndSortAssistants = async (queryObject, projection = {}, sortObj) => {
  try {
    const assistants = await Assistant.find(queryObject, projection)
      .sort(sortObj)
      .lean();
    return [null, assistants];
  } catch (error) {
    return [error, null];
  }
};

const findProjectsCount = async (queryObj) => {
  try {
    const count = await Assistant.find({
      ...queryObj,
      partnerArchived: { $ne: true },
    }).countDocuments();
    return [null, count];
  } catch (error) {
    return [error, null];
  }
};

export {
  updateAssistantInCache,
  findAssistants,
  findAssistantsWithOrders,
  findOneAssistant,
  findOneAssistantWithCache,
  createAssistant,
  updateAssistant,
  updateAssistants,
  deleteAssistant,
  fullyDeleteAssistant,
  findAssistantsSuperAdmin,
  findAssistantCount,
  setAssistantfields,
  findClientsTestNumber,
  findAssistantById,
  updateAssistantReturnNew,
  updateOneAssistant,
  findOneLeanAssistant,
  updateSubscriptionAssistant,
  findAssistantScrollSuperAdmin,
  findAndUpdateOneAssistant,
  findOwnerReportCount,
  findReqAssistant,
  findAndSortAssistants,
  findProjectsCount,
};
