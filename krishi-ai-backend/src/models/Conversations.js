import mongoose from "mongoose";
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
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
    chatIds: {
      type: Array,
      default: [],
    },
    params: {
      type: Object,
      default: {},
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    isIntervened: {
      type: Boolean,
      default: false,
    },
    isRequesting: {
      type: Date,
      default: null,
    },
    lastActive: {
      type: Date,
      default: null,
    },
    lastChat: {
      type: Date,
      default: null,
    },
    userNumber: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    intervenedBy: {
      type: String,
    },
    allRequiredParamsPresent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: Array,
    },
    tags: {
      type: Array,
    },
    starred: {
      type: Array,
    },
    journey: {
      type: Array,
    },
    displayColor: "",
    displayFontColor: "",
    source: "",
    chats: [],
    campaigns: [],
    firstMessage: { type: Object, default: null },
    sessionStartedOn: { type: Date },
    waSessionStartedOn: Date,
    countryCode: String,
    createdOn: Date,
    waSessionStatus: String,
    waSessionCreatorGsId: String,
    waSessionChatId: String,
    lastTemplateMessage: Date,
    tagsAddedAt: Date,
    tagsRemovedAt: Date,
    paramsUpdatedAt: Date,
    sessionPeriod: Date,
    sessionCreatedOn: Date,
    sessionCreatedBy: String,
    macSessionStatus: String,
    macSessionChatId: String,
    macSessionCreatorGsId: String,
    onWhatsapp: Boolean,
    timezone: { type: String, default: "Asia/Calcutta GMT+05:30" },
    whatsappConvoExpTime: Date,
    optedIn: { type: Boolean, default: true },
    blocked: { type: Boolean, default: false },
    partnerId: {
      type: String,
    },
    offmessageSetTime: Date,
    welcomeMessageSetTime: Date,
    activeFlowId: { type: String, default: "" },
    currentFlowMessageId: { type: String, default: "" },
    noOfFlowAttempt: { type: Number, default: 0 },
    recentCartData: { type: Object },
    recentCartRawData: { type: Object },
    recentCartTotalValue: { type: Number, default: 0 },
    address: { type: [], default: [] },
  },
  { timestamps: true, minimize: false }
);

const Conversation = mongoose.model("conversations", conversationSchema);

export default Conversation;
