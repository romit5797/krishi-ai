import ChatStatusAggs from "../models/ChatStatusAggs.js";
const findDaywiseChatAnalytics = async (queryObj) => {
  try {
    const dailyAnalytics = await ChatStatusAggs.find(queryObj).lean();
    return [null, dailyAnalytics];
  } catch (error) {
    return [error, false];
  }
};

export { findDaywiseChatAnalytics };
