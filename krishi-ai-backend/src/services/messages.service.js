import Message from "../models/Message.js";

export let userMessageCount = {};

const createNewMessage = async (payload) => {
  try {
    const value = new Message(payload);
    await value.save();
    return [null, value];
  } catch (error) {
    return [error, false];
  }
};

const updateMessage = async (queryObj, updateObj) => {
  try {
    const response = await Message.updateOne(queryObj, updateObj);
    return [null, response];
  } catch (error) {
    return [error, false];
  }
};

const findLeanMessages = async (queryObj, projection = {}, options = {}) => {
  try {
    const value = await Message.find(queryObj, projection, options).lean();
    return [null, value];
  } catch (error) {
    return [error, false];
  }
};

const findOneAndUpdateMessage = async (queryObj, updateObj, options = {}) => {
  try {
    const response = await Message.findOneAndUpdate(queryObj, updateObj, {
      new: true,
      ...options,
    }).lean();
    return [null, response];
  } catch (error) {
    return [error, false];
  }
};

const getUserMessagesCount = async () => {
  const docs = await Message.find().lean();
  for (const doc of docs) {
    const { userNumber, sender } = doc;
    if (sender === "assistant") continue;

    if (!userMessageCount[userNumber]) {
      userMessageCount[userNumber] = 0;
    }

    userMessageCount[userNumber] += 1;
  }

  return userMessageCount;
};

// Function to calculate if the message count is at a point to send a message
async function shouldSendRecommendationMessage(userNumber) {
  const messageCount = await Message.count({
    userNumber,
    sender: "user",
  }).lean();
  
  let base = 7;
  let difference = 14;

  // Loop through the doubling differences to check if the count matches any of the sequence
  while (messageCount >= base) {
    if (messageCount === base) {
      return true; // The message count matches one of the intervals
    }
    base += difference; // Move to the next interval
    difference *= 2; // Double the difference for the next interval
  }
  return false; // The message count doesn't match any of the intervals
}

export default {
  createNewMessage,
  updateMessage,
  findLeanMessages,
  findOneAndUpdateMessage,
  getUserMessagesCount,
  shouldSendRecommendationMessage,
};
