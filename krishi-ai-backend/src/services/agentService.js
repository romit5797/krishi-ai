import Agent from "../models/Agent.js";

const findAgents = async (queryObject, projection) => {
  try {
    const agents = await Agent.find(queryObject, projection)
      .sort({ _id: -1 })
      .lean();
    return [null, agents];
  } catch (error) {
    return [error, null];
  }
};

const findOneAgent = async (queryObject, projection = {}) => {
  try {
    const agent = await Agent.findOne(queryObject, projection);
    return [null, agent];
  } catch (error) {
    return [error, null];
  }
};

const findOneLeanAgent = async (queryObject, projection = {}) => {
  try {
    const agent = await Agent.findOne(queryObject, projection).lean();
    return [null, agent];
  } catch (error) {
    return [error, null];
  }
};

const createAgent = async (agentObject) => {
  try {
    const agent = new Agent(agentObject);
    await agent.save();
    return [null, agent];
  } catch (error) {
    return [error, null];
  }
};

const createAgentObject = async (agentObject) => {
  try {
    const agent = new Agent(agentObject);
    return [null, agent];
  } catch (error) {
    return [error, null];
  }
};

const deleteAgent = async (agentQuery) => {
  try {
    const response = await Agent.updateOne(agentQuery, {
      $set: { disabled: true },
    });
    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const updateAgent = async (agentQuery, updateObj) => {
  try {
    const value = await Agent.updateOne(agentQuery, updateObj);
    return [null, value];
  } catch (error) {
    return [error, null];
  }
};

const addAssistantToClient = async (clientId, assistantId, options = {}) => {
  try {
    const response = await Agent.findOneAndUpdate(
      { _id: clientId },
      {
        $push: { assistantIds: assistantId },
      },
      options
    );
    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const findAgentCount = async (queryObj) => {
  try {
    const count = await Agent.find(queryObj).countDocuments();
    return [null, count];
  } catch (error) {
    return [error, null];
  }
};

const fullyDeleteClient = async (clientId) => {
  try {
    const response = await Agent.deleteOne({ _id: clientId });
    const response2 = await Agent.deleteMany({ clientId });

    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

// Superadmin only
const findClientsCount = async (queryObj) => {
  try {
    const count = await Agent.find(queryObj).countDocuments();
    return [null, count];
  } catch (error) {
    return [error, false];
  }
};

const findClientsSuperAdmin = async (queryObj, project, options) => {
  try {
    const { limit, skip } = options;
    const clients = await Agent.aggregate([
      { $match: queryObj },
      { $sort: { createdOn: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    return [null, clients];
  } catch (error) {
    return [error, false];
  }
};

export {
  findAgents,
  findOneAgent,
  createAgent,
  deleteAgent,
  updateAgent,
  findAgentCount,
  addAssistantToClient,
  fullyDeleteClient,
  findClientsCount,
  findClientsSuperAdmin,
  findOneLeanAgent,
  createAgentObject,
};
