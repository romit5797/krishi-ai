import Chat from "../models/Chat.js";

const findChats = async (queryObject, projection = {}) => {
  try {
    const chats = await Chat.find(queryObject, projection).lean();
    return [null, chats];
  } catch (error) {
    return [error, null];
  }
};

const findCampaignChats = async (queryObj, options) => {
  try {
    const { limit } = options;
    const chats = await Chat.find(queryObj).sort({ _id: 1 }).limit(limit);
    return [null, chats];
  } catch (error) {
    return [error, null];
  }
};

const getCampaignData = async (queryObject) => {
  const data = await Chat.aggregate([
    { $match: queryObject },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  return data;
};

const getMessageTypeData = async (queryObject) => {
  const data = await Chat.aggregate([
    { $match: queryObject },
    {
      $group: {
        _id: "$isHSM",
        count: { $sum: 1 },
      },
    },
  ]);
  return data;
};

const getCount = async (queryObject) => {
  const count = await Chat.find(queryObject).countDocuments();
  return count;
};

const getUniqueUserCount = async (queryObject) => {
  const data = await Chat.aggregate([
    { $match: queryObject },
    {
      $group: {
        _id: "$userNumber",
        count: { $sum: 1 },
      },
    },
  ]);
  return (data || []).length;
};

const getMessageUnitCount = async (queryObject) => {
  const result = await Chat.aggregate([
    { $match: queryObject },
    {
      $group: {
        _id: "$sender",
        messageCountDeducted: { $sum: "$messageCountDeducted" },
        total: { $sum: 1 },
      },
    },
  ]);
  const total = result.reduce((sum, item) => {
    const { messageCountDeducted, total } = item;
    if (item._id === "SYSTEM") {
      return sum;
    } else {
      count = messageCountDeducted > total ? messageCountDeducted : total;
      return sum + count;
    }
  }, 0);
  // console.log(result);
  return total;
};

const saveChat = async (messageObj) => {
  const chat = new Chat(messageObj);
  await chat.save();
  return chat;
};

const updateChats = async (filter, update) => {
  try {
    const response = await Chat.updateMany(filter, update);
    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

export default {
  findChats,
  getCampaignData,
  getMessageTypeData,
  getCount,
  getMessageUnitCount,
  saveChat,
  findCampaignChats,
  getUniqueUserCount,
  updateChats,
};
