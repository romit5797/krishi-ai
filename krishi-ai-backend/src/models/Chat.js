import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  assistantId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  userNumber: {
    type: String,
    required: true,
  },
  campaign: {
    type: Object,
  },
  gsId: {
    type: String,
  },
  sender: String,
  payload: Object,
  type: String,
  status: String,
  waId: String,
  isHSM: Boolean,
  intent: String,
  paramters: Object,
  queryText: String,
  context: Object,
  deliveredAt: Date,
  readAt: Date,
  sentAt: Date,
  messagePrice: Number,
  messageCountDeducted: Number,
  agentId: String,
  mediaSize: Number,
  isSearchable: Boolean,
  failurePayload: Object,
  quotaExceeded: Boolean,
  isTemplate: Boolean,
  isConsumingTemplateQuota: Boolean,
  macDetails: Object,
  userName: String,
  countryCode: String,
  timezone: { type: String, default: "Asia/Calcutta GMT+05:30" },
});

const Chat = mongoose.model("chat", chatSchema);
export default Chat;
