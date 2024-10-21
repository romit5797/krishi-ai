const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exampleSchema = new Schema(
  {
    header_handle: {
      type: [String],
      default: undefined,
    },
    body_text: {
      type: [[String]],
      default: undefined,
    },
  },
  { _id: false }
);

const buttonsSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    example: {
      type: [String],
      default: undefined,
    },
  },
  { _id: false }
);

const cardSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["HEADER", "BODY", "BUTTONS"],
      required: true,
    },
    format: {
      type: String,
      enum: ["IMAGE", "VIDEO"],
    },
    text: {
      type: String,
    },
    example: {
      type: exampleSchema,
      default: undefined,
    },
    buttons: {
      type: [buttonsSchema],
      default: undefined,
    },
  },
  { _id: false }
);

const componentSchema = new Schema(
  {
    components: {
      type: [cardSchema],
      required: true,
    },
  },
  { _id: false }
);

const templateMessageSchema = new Schema(
  {
    assistantId: {
      type: String,
      required: true,
    },
    assistantName: {
      type: String,
    },
    quality: {
      type: String,
    },
    clientId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
    },
    label: {
      type: String,
    },
    type: {
      type: String,
    },
    templateLanguage: {
      type: String,
    },
    format: {
      type: String,
    },
    sampleMessage: {
      type: String,
    },
    parameters: {
      type: Number,
    },
    createdBy: {
      type: String,
    },
    category: {
      type: String,
    },
    status: {
      type: String,
      enum: ["APPROVED", "REJECTED", "PENDING"],
      default: "PENDING",
    },
    processed: {
      default: null,
      type: Date,
    },
    actionType: {
      type: String,
    },
    sampleMediaUrl: {
      type: String,
    },
    sampleCTAUrl: {
      type: String,
    },
    callToAction: [],
    quickReplies: [],
    namespace: {
      type: String,
    },
    rejectedReason: {
      type: String,
    },
    archived: {
      type: Boolean,
    },
    partnerId: {
      type: String,
    },
    headerText: {
      type: String,
    },
    footerText: {
      type: String,
    },
    isClickTrackingEnabled: {
      type: Boolean,
    },
    buttons: {
      type: [buttonsSchema],
    },
    carouselCards: {
      type: [componentSchema],
    },
    iconUrl: { type: String },
    templateParams: { type: [] },
  },
  { timestamps: true }
);

templateMessageSchema.index({
  assistantName: "text",
  assistantId: "text",
  clientId: "text",
  status: "text",
  label: "text",
  name: "text",
  type: "text",
});

const TemplateMessage = mongoose.model(
  "templateMessage",
  templateMessageSchema
);

module.exports = TemplateMessage;
