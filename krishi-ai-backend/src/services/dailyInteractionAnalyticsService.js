import moment from "moment-timezone";
import DailyInteractionAnalytics from "../models/DailyInteractionAnalytics.js";

async function updateAnalyticsForDay({
  isUniqueUser = false,
  topic,
  language,
  sentiment,
  region,
}) {
  const startOfDay = moment.tz(new Date(), "Asia/Calcutta").startOf("day");
  const incrementObj = {
    totalMessages: 1,
    [`sentimentWiseCount.${sentiment}`]: 1,
    [`languageWiseCount.${language}`]: 1,
  };

  if (topic) {
    incrementObj[`topicWiseCount.${topic}`] = 1;
  }

  if (isUniqueUser) {
    incrementObj.totalUniqueUsers = 1;
  }

  if (region) {
    incrementObj[`regionWiseCount.${region}`] = 1;
  }

  try {
    const analytics = await DailyInteractionAnalytics.updateOne(
      { date: startOfDay }, // Match the document by date
      { $inc: incrementObj }, // Use $inc operator to increment the values dynamically
      { upsert: true } // Insert a new document if it doesn't exist
    );
    return [null, analytics];
  } catch (err) {
    return [err, null];
  }
}

async function getAnalytics(filter = {}, options = {}) {
  try {
    const analyticsDocs = await DailyInteractionAnalytics.find(
      filter,
      options
    ).lean();
    return [null, analyticsDocs];
  } catch (err) {
    return [err, null];
  }
}

export default { updateAnalyticsForDay, getAnalytics };
