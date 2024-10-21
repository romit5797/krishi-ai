import mongoose from "mongoose";
const Schema = mongoose.Schema;

const dailyInteractionAnalyticsSchema = new Schema({
  date: {
    type: Date,
    required: true,
    unique: true, // Ensure one document per day
  },
  totalUniqueUsers: {
    type: Number,
    required: true,
    default: 0,
  },
  totalMessages: {
    type: Number,
    required: true,
    default: 0,
  },
  topicWiseCount: {
    type: Map,
    of: Number, // Stores topic-wise counts dynamically
    default: {},
  },
  sentimentWiseCount: {
    type: Map,
    of: Number, // Stores sentiment-wise counts dynamically (e.g., positive, neutral, negative)
    default: {},
  },
  languageWiseCount: {
    type: Map,
    of: Number, // Stores language-wise counts dynamically (e.g., EN, HI, etc.)
    default: {},
  },
  regionWiseCount: {
    type: Map,
    of: Number, // Stores region-wise counts dynamically (e.g., India, US, etc.)
    default: {},
  },
});

// Create a model for Analytics
const DailyInteractionAnalytics = mongoose.model(
  "dailyInteractionAnalytics",
  dailyInteractionAnalyticsSchema
);

export default DailyInteractionAnalytics;
