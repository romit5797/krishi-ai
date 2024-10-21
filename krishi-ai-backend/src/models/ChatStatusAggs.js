import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Create Schema
const ChatStatusAggsSchema = new Schema({
  assistantId: {
    type: String,
  },
  clientId: {
    type: String,
  },
  userMessages: {
    type: Object,
  },
  campaignMessages: {
    type: Object,
  },
  chatbotMessages: {
    type: Object,
  },
  agentMessages: {
    type: Object,
  },
  sentChatCount: {
    type: Number,
  },
  deliveredChatcount: {
    type: Number,
  },
  enqueuedChatCount: {
    type: Number,
  },
  readChatCount: {
    type: Number,
  },
  failedChatCount: {
    type: Number,
  },
  intervenedChatCount: {
    type: Number,
  },
  closedChatCount: {
    type: Number,
  },
  requestingChatCount: {
    type: Number,
  },
  repliedToCampaignCount: {
    type: Number,
  },
  templateMessagesCount: {
    type: Number,
  },
  uniqueUserCount: {
    type: Number,
  },
  uniqueVisitorCount: {
    type: Number,
  },
  sessionMessagesCount: {
    type: Number,
  },
  macUsageCount: {
    type: Number,
  },
  userCreatedMacCount: {
    type: Number,
  },
  businessCreatedMacCount: {
    type: Number,
  },
  templateCreditUsedCount: {
    type: Number,
  },
  engagementCount: {
    type: Number,
  },
  dayDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  bicCount: {
    type: Number,
  },
  bicCreditUsage: {
    type: Number,
  },
  bicCreditUsageCountryWise: {
    type: Number,
  },
  uicCount: {
    type: Number,
  },
  uicCreditUsage: {
    type: Number,
  },
  uicCreditUsageCountryWise: {
    type: Number,
  },
  scCount: {
    type: Number,
  },
  scCreditUsage: {
    type: Number,
  },
  scCreditUsageCountryWise: {
    type: Number,
  },
  acCount: {
    type: Number,
  },
  acCreditUsage: {
    type: Number,
  },
  acCreditUsageCountryWise: {
    type: Number,
  },
  mcCount: {
    type: Number,
  },
  mcCreditUsage: {
    type: Number,
  },
  mcCreditUsageCountryWise: {
    type: Number,
  },
  ucCount: {
    type: Number,
  },
  ucCreditUsage: {
    type: Number,
  },
  ucCreditUsageCountryWise: {
    type: Number,
  },
});

const ChatStatusAggs = mongoose.model("chatstatusaggs", ChatStatusAggsSchema);

export default ChatStatusAggs;
