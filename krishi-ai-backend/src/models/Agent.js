import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Create Schema
const AgentSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: false,
    },
    displayName: {
      type: String,
    },
    name: {
      // username
      type: String,
      unique: true,
      required: true,
    },
    assistantIds: {
      /////////////// define an array to store assistant ids
      type: Array,
      default: [],
    },
    clientId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    createdOn: {
      type: Date,
      default: () => new Date(),
    },
    power: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    imageUrl: String,
    googleId: String,
    company: String,
    contact: String,
    countryCode: String,
    pushNotificationDevices: Array,
    notificationKeys: Array,
    currency: String,
    timezone: { type: String, default: "Asia/Calcutta GMT+05:30" },
    firstProjectId: String,
    partnerId: String,
    companySize: Number,
    industry: String,
    filter: {},
    whiteLabel: Number,
    apiLimit: Number,
    state: String,
    country: String,
    crmDetails: Object,
    signUpUrl: String,
    website: String,
    signUpFrom: String,
    businessArchived: { type: Boolean, default: false },
    affiliateId: String,
  },
  { timestamps: true }
);

const Agent = mongoose.model("agent", AgentSchema);

export default Agent;
