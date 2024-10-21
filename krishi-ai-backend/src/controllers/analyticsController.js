import catchAsync from "../utils/catchAsync.js";
import dailyInteractionAnalyticsService from "../services/dailyInteractionAnalyticsService.js";

export const getDashboardAnalytics = catchAsync(async (req, res, next) => {
  const [err, docs] = await dailyInteractionAnalyticsService.getAnalytics({});
  if (err) throw err;
  let messagesCount = 0;
  let uniqueUsersCount = 0;
  const usersDatewise = [];
  const messagesDatewise = [];
  const topicDistribution = {};
  const sentimentDistribution = {};
  const languageDistribution = {};
  const regionDistribution = {};
  for (const doc of docs) {
    const {
      date,
      totalUniqueUsers,
      totalMessages,
      topicWiseCount,
      sentimentWiseCount,
      languageWiseCount,
      regionWiseCount,
    } = doc;

    uniqueUsersCount += totalUniqueUsers;
    messagesCount += totalMessages;

    usersDatewise.push({ date, count: totalUniqueUsers });
    messagesDatewise.push({ date, count: totalMessages });

    Object.keys(topicWiseCount).map((topic) => {
      if (!topicDistribution[topic]) {
        topicDistribution[topic] = 0;
      }
      topicDistribution[topic] += topicWiseCount[topic];
    });

    Object.keys(sentimentWiseCount).map((sentiment) => {
      if (!sentimentDistribution[sentiment]) {
        sentimentDistribution[sentiment] = 0;
      }
      sentimentDistribution[sentiment] += sentimentWiseCount[sentiment];
    });

    Object.keys(languageWiseCount).map((lang) => {
      if (!languageDistribution[lang]) {
        languageDistribution[lang] = 0;
      }
      languageDistribution[lang] += languageWiseCount[lang];
    });

    Object.keys(regionWiseCount).map((region) => {
      if (!regionDistribution[region]) {
        regionDistribution[region] = 0;
      }
      regionDistribution[region] += regionWiseCount[region];
    });
  }

  res.status(200).send({
    messagesCount,
    messagesDatewise,
    uniqueUsersCount,
    usersDatewise,
    topicDistribution,
    sentimentDistribution,
    languageDistribution,
    regionDistribution,
  });
});
