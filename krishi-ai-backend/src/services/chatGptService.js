import OpenAI from "openai";
import { OPENAI_API_KEY, GROQ_API_KEY } from "../config/config.js";
import messageService from "../services/messages.service.js";
import vectorService from "../services/vectorService.js";
import Groq from "groq-sdk";
import moment from "moment";
import { languages } from "../commons/languages.js";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const groq = new Groq({ apiKey: GROQ_API_KEY });

export const getChatGptResponse = async (
  userMessage,
  userNumber,
  messageType,
  languageCode
) => {
  try {
    // Retrieve the last 20 messages for this user from the database
    const [error, messages] = await messageService.findLeanMessages(
      {
        userNumber,
      },
      {},
      { limit: 8, sort: { createdAt: -1 } }
    );

    if (error) throw error;

    const latestMessage = messages[0];
    const isUniqueUser =
      latestMessage &&
      moment(latestMessage.createdAt)
        .startOf("day")
        .isSame(moment().startOf("day"))
        ? false
        : true;

    // Using hypothetical Document Embeddings
    let hypothetical_completion;
    try {
      hypothetical_completion = await groq.chat.completions.create({
        model: "llama-3.2-90b-text-preview",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in agriculture.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });
    } catch (error) {
      console.log("Error fetching response from Groq:", error.message);
      console.log("Falling back to OpenAI GPT-4-o-mini");
      hypothetical_completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant specialized in agriculture.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      });
    }
    const hypotheticalMessage =
      hypothetical_completion.choices[0].message.content.trim();
    let searchResults = [];
    try {
      searchResults = await vectorService.searchQdrant(
        userMessage + hypotheticalMessage,
        messageType === "image" ? "vision" : "text"
      );
    } catch (error) {
      console.error("Error searching Qdrant:", error.message);
    }
    // Reverse the array to get messages in chronological order
    const conversationHistory = messages.reverse().map((msg) => ({
      role: msg.sender,
      content: msg.content,
    }));

    // Add search results to the conversation history
    let searchResultString = "";
    if (searchResults.length > 0) {
      const searchResultsContent = searchResults
        .map((result) => result.payload.paragraph || result.payload.Content)
        .join("\n\n");
      searchResultString = `Here are some relevant search results:\n\n${searchResultsContent}\n\nPlease use this information to inform your response if applicable.`;
    }

    const userLanguage = languages[languageCode];
    const systemPrompt =
      `You are KRISHI AI an expert in agriculture, a multi-lingual chatbot providing agricultural information related to Indian Agriculture on topics like weather forecasts, crop selection, pest and disease management, irrigation tips, modern farming, techniques, government assistance, market prices, soil health, farm equipment, legal guidance, financial services, community events, storage and logistics, sustainable practices, animal husbandry; only respond to agriculture-related queries, keeping answers simple, practical, and enthusiastic to empower farmers, and politely redirect any non-agriculture questions back to relevant topics. Do ask additional question to get full knowledge of the situation, before reaching a conclusion. Return answer in ${userLanguage} only.` +
      searchResultString;

    // Add system message at the beginning
    conversationHistory.unshift({
      role: "system",
      content: systemPrompt,
    });

    // Add user's new message to the conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    let completion;

    console.log(conversationHistory);

    try {
      if (languageCode === "en" || languageCode === "hi") {
        completion = await groq.chat.completions.create({
          model: "llama-3.2-90b-text-preview",
          messages: conversationHistory,
        });
      } else {
        throw new Error("Unsupported language for Llama model");
      }
    } catch (error) {
      console.log(
        "Error fetching response from Groq or unsupported language:",
        error.message
      );

      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationHistory,
      });
    }

    const replyMessage = completion.choices[0].message.content.trim();

    return { replyMessage, isUniqueUser, conversationHistory };
  } catch (error) {
    console.error("Error fetching response from OpenAI:", error.message);
    throw error;
  }
};

// Function to generate embeddings for a batch of up to 100 paragraphs
export async function getEmbeddingsBatch(paragraphs) {
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
    throw new Error("Input must be an array of paragraphs");
  }

  try {
    // Use OpenAI API to get embeddings
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002", // Replace with the desired model
      input: paragraphs,
    });

    // Extract and return embeddings
    return response.data.map((e) => e.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}
