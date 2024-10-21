import { OPENAI_API_KEY, GROQ_API_KEY } from "../config/config.js";
import Groq from "groq-sdk";
import OpenAI from "openai";

import { sentiments } from "../commons/sentiments.js";
import { topics } from "../commons/topics.js";
import { languages } from "../commons/languages.js";
import { regions } from "../commons/region.js";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const groq = new Groq({ apiKey: GROQ_API_KEY });

// imports calculate function from step 1
export const runConversation = async (userPrompt) => {
  const messages = [
    {
      role: "system",
      content:
        "You are KRISHI.AI, a multi-lingual chatbot providing accurate, up-to-date agricultural information on topics like crop techniques, pest control, weather, soil health, sustainable farming, irrigation, livestock care, market trends, government schemes, and farming tools; only respond to agriculture-related queries in the user’s language, keeping answers simple, practical, and enthusiastic to empower farmers, and politely redirect any non-agriculture questions back to relevant topics.",
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "agriculture-ai",
        description:
          "Extracts language, topic, sentiment, and region from the user's message for agriculture-related queries.",
        parameters: {
          type: "object",
          properties: {
            language: {
              type: "string",
              description: "The language of the user's message",
              enum: Object.keys(languages),
            },
            topic: {
              type: "string",
              description:
                "The agricultural topic of the user's message, if none of the given topics apply then return null",
              enum: Object.keys(topics),
            },
            sentiment: {
              type: "string",
              description: "The sentiment of the user's message",
              enum: sentiments,
            },
            region: {
              type: "string",
              description: "The region of the user, rreturn null if not found",
              enum: Object.keys(regions),
            },
          },
          required: ["language", "topic", "sentiment", "region"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    // stream: false,
    tools: tools,
    tool_choice: "required",
    // max_tokens: 4096,
  });

  const responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    throw new Error("No tool calls found in the response.");
  }

  try {
    const toolCall = toolCalls[0];

    if (!toolCall.function || !toolCall.function.arguments) {
      throw new Error("Invalid tool call structure.");
    }

    const parsedToolCall = JSON.parse(toolCall.function.arguments);
    return parsedToolCall;
  } catch (error) {
    console.error("Error parsing tool call arguments:", error.message);
    throw new Error("Failed to parse tool call arguments.");
  }
};

export const getLanguageCode = async (userPrompt) => {
  const messages = [
    {
      role: "system",
      content:
        "You are KRISHI.AI, a multi-lingual chatbot providing accurate language of user's input.",
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "agriculture-ai",
        description: "Extracts language from the user's message.",
        parameters: {
          type: "object",
          properties: {
            language: {
              type: "string",
              description: "The language of the user's message",
              enum: Object.keys(languages),
            },
          },
          required: ["language"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: tools,
    tool_choice: "required",
  });

  const responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    throw new Error("No tool calls found in the response.");
  }

  try {
    const toolCall = toolCalls[0];

    if (!toolCall.function || !toolCall.function.arguments) {
      throw new Error("Invalid tool call structure.");
    }

    const parsedToolCall = JSON.parse(toolCall.function.arguments);
    return parsedToolCall?.language;
  } catch (error) {
    console.error("Error parsing tool call arguments:", error.message);
    throw new Error("Failed to parse tool call arguments.");
  }
};

export const runRecommendation = async (conversationHistory) => {
  const messages = conversationHistory;

  const tools = [
    {
      type: "function",
      function: {
        name: "product-recommendation",
        description:
          "Suggest a relevant product based on the user's conversation history which must be available in amazon india. This product should provide benifit to user in terms of agriculture. This product can be only seeds or fertilizers available on amazon india.",
        parameters: {
          type: "object",
          properties: {
            product: {
              type: "string",
              description:
                "The product name for the recommendation, that the user might be looking for. If not found return null",
            },
          },
          required: ["product"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: tools,
    tool_choice: "required",
  });

  const responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    throw new Error("No tool calls found in the response.");
  }

  try {
    const toolCall = toolCalls[0];

    if (!toolCall.function || !toolCall.function.arguments) {
      throw new Error("Invalid tool call structure.");
    }

    const parsedToolCall = JSON.parse(toolCall.function.arguments);
    return parsedToolCall?.product;
  } catch (error) {
    console.error("Error parsing tool call arguments:", error.message);
    throw new Error("Failed to parse tool call arguments.");
  }
};
