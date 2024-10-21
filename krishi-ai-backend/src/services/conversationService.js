const Conversation = require("../models/Conversations");
const Chat = require("../models/Chat");
const cacheService = require("../helpers/cache.service");
const { parsePhoneNumber } = require("libphonenumber-js");
const { setUserInCache } = require("../helpers/cache.service");
const { getUserId } = require("./userDb");
const { emitNewUser } = require("../helpers/socket.service");
const { saveChat } = require("./chatService");

const primary = [
  "#6002ee",
  "#01c0d9",
  "#00c800",
  "#a7c800",
  "#c88500",
  "#ef4b10",
  "#fe2134",
  "#f30075",
  "#00f3cc",
  "#ff2a13",
];
const secondary = [
  "#90ee02",
  "#d91a01",
  "#c800c8",
  "#2100c8",
  "#0043c8",
  "#10b3ef",
  "#21feec",
  "#00f37d",
  "#f30024",
  "#13e7ff",
];

const getConvoFromDatabase = async (userNumber, assistantId) => {
  const conversation = await Conversation.findOne(
    { userNumber, assistantId },
    {
      _id: 1,
      clientId: 1,
      assistantId: 1,
      userId: 1,
      userName: 1,
      userNumber: 1,
      lastActive: 1,
      lastChat: 1,
      params: 1,
      firstMessage: 1,
      intervenedBy: 1,
      isIntervened: 1,
      isRequesting: 1,
      sessionStartedOn: 1,
      waSessionStartedOn: 1,
      countryCode: 1,
      sessionPeriod: 1,
      sessionCreatedOn: 1,
      sessionCreatedBy: 1,
      macSessionStatus: 1,
      macSessionChatId: 1,
      macSessionCreatorGsId: 1,
      onWhatsapp: 1,
      whatsappConversationId: 1,
      whatsappConversationType: 1,
      whatsappConvoExpTime: 1,
      optedIn: 1,
      blocked: 1,
      activeFlowId: 1,
      currentFlowMessageId: 1,
      noOfFlowAttempt: 1,
      address: 1,
    }
  ).lean();
  return conversation;
};

const getUser = async (userNumber, assistantId) => {
  let user = await cacheService.getUserFromCache(userNumber, assistantId);
  if (!user) {
    // get user from database
    const conversation = await getConvoFromDatabase(userNumber, assistantId);
    if (conversation) {
      const newUser = {
        ...conversation,
        conversationId: conversation._id,
        number: conversation.userNumber,
        userNumber: undefined,
        _id: undefined,
        prevLastActive: conversation.lastActive,
      };
      user = newUser;
    } else {
      return null;
    }
  }
  return user;
};

const findConvosWithChats = async (queryObj, options, agentQueryObj) => {
  try {
    const { limit, skip, sort } = options;
    const convos = await Conversation.aggregate([
      ...(agentQueryObj ? [{ $match: agentQueryObj }] : []),
      { $match: queryObj },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "chats",
          as: "chats",
          let: { conversationId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$conversationId", "$conversationId"] },
              },
            },
            { $sort: { sentAt: -1 } },
            { $limit: 30 },
          ],
        },
      },
    ]);

    return [null, convos];
  } catch (error) {
    return [error, false];
  }
};

const findChatsWithConvos = async (assistantId, searchText, options) => {
  try {
    const { limit, skip, sort, month = 1 } = options;
    const timeStampDate = month * 30 * 24 * 60 * 60 * 1000;

    const convos = await Chat.aggregate([
      {
        $match: {
          assistantId: assistantId,
          $text: { $search: searchText },
          isSearchable: true,
        },
      },
      { $sort: { sentAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          convoId: { $toObjectId: "$conversationId" },
        },
      },
      {
        $lookup: {
          from: "conversations",
          localField: "convoId",
          foreignField: "_id",
          as: "conversation",
        },
      },
      { $match: { "conversation.0": { $exists: true } } },
    ]);

    return [null, convos];
  } catch (error) {
    return [error, false];
  }
};

const findConvosAnalytics = async (queryObj) => {
  try {
    const convos = await Conversation.aggregate([
      { $match: queryObj },
      {
        $project: {
          lastActive: 1,
          createdOn: 1,
          _id: 1,
        },
      },
    ]);
    return [null, convos];
  } catch (error) {
    return [error, false];
  }
};
const findConvoWithChatByUserNumber = async (
  assistantId,
  userNumber,
  isFetchAll
) => {
  try {
    const convos = await Conversation.aggregate([
      { $match: { assistantId: assistantId, userNumber: userNumber } },
      {
        $lookup: {
          from: "chats",
          as: "chats",
          pipeline: [
            {
              $match: {
                assistantId,
                userNumber,
              },
            },
            { $sort: { sentAt: -1 } },
            ...(isFetchAll ? [] : [{ $limit: 30 }]),
          ],
        },
      },
    ]);
    const convo = convos[0];
    return [null, convo];
  } catch (error) {
    return [error, false];
  }
};

const findConvoWithChatById = async (convoId, isFetchAll) => {
  try {
    const convos = await Conversation.aggregate([
      { $match: { _id: convoId } },
      {
        $lookup: {
          from: "chats",
          as: "chats",
          let: { conversationId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$$conversationId", "$conversationId"] },
              },
            },
            { $sort: { sentAt: -1 } },
            ...(isFetchAll ? [] : [{ $limit: 30 }]),
          ],
        },
      },
    ]);
    const convo = convos[0];
    return [null, convo];
  } catch (error) {
    return [error, false];
  }
};

const findConvo = async (queryObj, projection = null) => {
  try {
    const convo = await Conversation.findOne(queryObj, projection);
    return [null, convo];
  } catch (error) {
    return [error, false];
  }
};

const findConvos = async (queryObj, options = null, projection = null) => {
  try {
    const convos = await Conversation.find(queryObj, projection, options);
    return [null, convos];
  } catch (error) {
    return [error, false];
  }
};

const findConvosCount = async (queryObj) => {
  try {
    const count = await Conversation.countDocuments(queryObj);
    return [null, count];
  } catch (error) {
    return [error, false];
  }
};
const findConvosOptCount = async (queryObj) => {
  try {
    const count = await Conversation.find(queryObj).countDocuments();
    return [null, count];
  } catch (error) {
    return [error, false];
  }
};

const deleteNote = async (convoId, createdAt) => {
  try {
    const response = await Conversation.updateOne(
      { _id: convoId },
      { $pull: { notes: { createdAt: createdAt } } }
    );
    return [null, true];
  } catch (error) {
    return [error, false];
  }
};

const saveNote = async (convoId, newNote) => {
  try {
    const response = await Conversation.updateOne(
      { _id: convoId },
      { $push: { notes: newNote } }
    );
    return [null, true];
  } catch (error) {
    return [error, false];
  }
};

const saveParamsToConvo = async (convoId, params) => {
  try {
    const response = await Conversation.updateOne(
      { _id: convoId },
      {
        $set: {
          params: params,
          paramsUpdatedAt: new Date(),
        },
      }
    );
    return [null, true];
  } catch (error) {
    return [error, false];
  }
};

const getAudienceWithAllDetails = async (filters) => {
  try {
    const convos = await Conversation.find(filters, {
      _id: 1,
      clientId: 1,
      assistantId: 1,
      userId: 1,
      userName: 1,
      userNumber: 1,
      lastActive: 1,
      lastChat: 1,
      params: 1,
      firstMessage: 1,
      intervenedBy: 1,
      isIntervened: 1,
      isRequesting: 1,
      sessionStartedOn: 1,
      waSessionStartedOn: 1,
      countryCode: 1,
      sessionPeriod: 1,
      sessionCreatedOn: 1,
      sessionCreatedBy: 1,
      macSessionStatus: 1,
      macSessionChatId: 1,
      macSessionCreatorGsId: 1,
      onWhatsapp: 1,
      whatsappConvoExpTime: 1,
      optedIn: 1,
      blocked: 1,
      offmessageSetTime: 1,
      welcomeMessageSetTime: 1,
      activeFlowId: 1,
      currentFlowMessageId: 1,
      noOfFlowAttempt: 1,
      address: 1,
    }).lean();
    return [null, convos];
  } catch (error) {
    return [error, false];
  }
};

const getAudience = async (filters) => {
  try {
    const convos = await Conversation.find(filters, {
      _id: 1,
      userNumber: 1,
      userName: 1,
    });

    return [null, convos];
  } catch (error) {
    return [error, false];
  }
};

const updateOneConvo = async (query, options) => {
  try {
    const response = await Conversation.updateOne(query, options);
    return [null, response];
  } catch (error) {
    return [error, false];
  }
};

const updateAllConvos = async (query, options) => {
  try {
    const response = await Conversation.updateMany(query, options);
    return [null, response];
  } catch (error) {
    return [error, false];
  }
};

const findConvoAndUpdate = async (query, options) => {
  const convo = await Conversation.findOneAndUpdate(query, options);
  return convo;
};

const fullyDeleteConvos = async (clientId) => {
  try {
    const response = await Conversation.deleteMany({ clientId });
    const response2 = await Chat.deleteMany({ clientId });
    return [null, response];
  } catch (error) {
    return [error, null];
  }
};

const getTotalConsumedTemplateQuota = async (assistantId) => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const count = await Conversation.find({
    assistantId,
    lastTemplateMessage: { $gt: yesterday },
  }).countDocuments();
  return count;
};

const setConvo = async (query, updateQuery) => {
  try {
    const convo = await Conversation.findOneAndUpdate(query, updateQuery, {
      upsert: true,
      new: true,
    }).lean();
    return [null, convo];
  } catch (error) {
    return [error, null];
  }
};

const createConvo = async (convoObj) => {
  const { userName, userNumber } = convoObj;
  const userId = await getUserId(userNumber, userName);

  const random = Math.floor(Math.random() * 10);
  const displayColor = primary[random];
  const displayFontColor = secondary[random];
  let [setConvoError, newConvo] = await setConvo(
    {
      assistantId: convoObj.assistantId,
      userNumber: convoObj.userNumber,
    },
    {
      ...convoObj,
      userId,
      displayColor,
      displayFontColor,
      journey: [{ type: "USER_CREATED", payload: { createdAt: new Date() } }],
      createdOn: new Date(),
    }
  );
  if (setConvoError) {
    if (
      !(
        setConvoError.code === 11000 ||
        setConvoError.codeName === "DuplicateKey"
      )
    ) {
      throw setConvoError;
    }
  }
  return newConvo;
};

const createUser = async (convoObj, assistant, toEMmit = true) => {
  const phoneNumber = parsePhoneNumber("+" + convoObj.userNumber, "IN");
  if (phoneNumber) {
    const country = phoneNumber.country;
    const countryCode = phoneNumber.countryCallingCode.toString();
    convoObj = { ...convoObj, country, countryCode };
  } else {
    throw new { errorMessage: "Invalid Phone Number format!" }();
  }
  const convo = await createConvo(convoObj);

  // emit new user
  toEMmit && emitNewUser(convo);

  const user = {
    conversationId: convo._id,
    assistantId: convo.assistantId,
    clientId: convo.clientId,
    number: convo.userNumber,
    userId: convo.userId,
    userName: convo.userName,
    lastActive: convo.lastActive,
    lastChat: convo.lastChat,
    intervenedBy: convo.intervenedBy,
    isIntervened: convo.isIntervened,
    isRequesting: convo.isRequesting,
    sessionStartedOn: convo.sessionStartedOn,
    waSessionStartedOn: convo.waSessionStartedOn,
    firstMessage: convo.firstMessage,
    countryCode: convo.countryCode,
    sessionPeriod: convo.sessionPeriod,
    waSessionChatId: convo.waSessionChatId,
    waSessionStatus: convo.waSessionStatus,
    waSessionCreatorGsId: convo.waSessionCreatorGsId,
    whatsappConversationId: convo.whatsappConversationId,
    whatsappConversationType: convo.whatsappConversationType,
    prevLastActive: null,
    onWhatsapp: convo.onWhatsapp,
    whatsappConvoExpTime: convo.whatsappConvoExpTime,
    optedIn: convo.optedIn,
    blocked: convo.blocked,
    offmessageSetTime: convo.offmessageSetTime,
    welcomeMessageSetTime: convo.welcomeMessageSetTime,
    activeFlowId: convo.activeFlowId,
    currentFlowMessageId: convo.currentFlowMessageId,
    noOfFlowAttempt: convo.noOfFlowAttempt,
    address: convo.address,
  };
  await setUserInCache(user);
  return convo;
};

const saveMsgToConvo = async (messageObj, userName) => {
  const chat = await saveChat(messageObj);
  const { conversationId, sentAt } = chat;

  const setObj = { lastChat: sentAt };
  if (userName) setObj.userName = userName;

  const pushObj = { chatIds: chat._id };
  if (chat.campaign) {
    const campaignObj = {
      name: chat.campaign.name,
      _id: chat.campaign._id,
      date: chat.sentAt,
    };
    pushObj.campaigns = campaignObj;
    pushObj.journey = { type: "CAMPAIGN", payload: campaignObj };
  }

  await Conversation.updateOne(
    { _id: conversationId },
    {
      $push: pushObj,
      $set: setObj,
    }
  );
  return chat;
};

const findMoreChats = async (options) => {
  try {
    const { conversationId, limit, skip, sort } = options;
    const chats = await Chat.aggregate([
      {
        $match: {
          conversationId: conversationId,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);

    return [null, chats];
  } catch (error) {
    return [error, false];
  }
};

module.exports = {
  findConvo,
  findConvos,
  findConvosCount,
  deleteNote,
  saveNote,
  findConvosWithChats,
  findChatsWithConvos,
  findConvosAnalytics,
  findConvoWithChatById,
  getAudience,
  fullyDeleteConvos,
  updateOneConvo,
  findConvoAndUpdate,
  getTotalConsumedTemplateQuota,
  saveParamsToConvo,
  updateAllConvos,
  createUser,
  getAudienceWithAllDetails,
  findConvosOptCount,
  saveMsgToConvo,
  getUser,
  findMoreChats,
  findConvoWithChatByUserNumber,
};
