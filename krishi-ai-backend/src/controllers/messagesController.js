import catchAsync from "../utils/catchAsync.js";
import { extractMessageDetails } from "../utils/extractMessageDetails.js";
import { getChatGptResponse } from "../services/chatGptService.js";
import {
  sendMessageToUser,
  sendProductRecommendationToUser,
} from "../services/whatsappService.js";
import { convertAudioToText } from "../utils/audioUtils.js";
import { convertTextToAudio } from "../utils/audioUtils.js";
import path from "path";
import messageService, {
  userMessageCount,
} from "../services/messages.service.js";
import { uploadFileToCloudStorage } from "../utils/cloudStorage.js";
import dailyInteractionAnalyticsService from "../services/dailyInteractionAnalyticsService.js";
import {
  getLanguageCode,
  runConversation,
  runRecommendation,
} from "../services/functionCalling.js";
import { visionCompletion } from "../utils/imageUtils.js";

export const generateBotResponse = catchAsync(async (req, res, next) => {
  const incomingMessage = req.body;
  res.sendStatus(200);
  // Step 1: Extract message details
  const { userMessage, userPhoneNumber, mediaUrl, mediaType, userName } =
    extractMessageDetails(incomingMessage);

  let processedUserMessage;
  let languageCode = "en";
  let inputMediaUrl = "";

  if (mediaType === "audio") {
    [processedUserMessage, languageCode] = await convertAudioToText(mediaUrl);
    inputMediaUrl = mediaUrl;
  } else if (mediaType === "image" || mediaType === "video") {
    inputMediaUrl = mediaUrl;
    const message = await visionCompletion(mediaUrl);
    processedUserMessage = message;
  } else {
    processedUserMessage = userMessage;

    languageCode = await getLanguageCode(userMessage);
  }

  // Create and save the user's message

  if (!processedUserMessage) {
    const msg = "Sorry, I couldn't process your message. Please try again.";
    await sendMessageToUser(userPhoneNumber, msg);
    return;
  }

  const [err, message] = await messageService.createNewMessage({
    userNumber: userPhoneNumber,
    sender: "user",
    content: processedUserMessage,
    messageType: mediaType,
    audioUrl: inputMediaUrl,
    imageUrl: inputMediaUrl,
  });

  if (err) throw err;

  // Step 2: Get response from ChatGPT

  const { replyMessage, isUniqueUser } = await getChatGptResponse(
    processedUserMessage,
    userPhoneNumber,
    mediaType,
    languageCode
  );

  console.log("replyMessage", replyMessage);
  // Convert reply text to audio
  const audioFileName = `output_${Date.now()}.mp3`;
  const audioFilePath = path.join(process.cwd(), "audio_files", audioFileName);

  try {
    await convertTextToAudio(replyMessage, audioFilePath);
  } catch (error) {
    console.error("Error converting text to audio:", error);
  }

  const audioUrl = await uploadFileToCloudStorage(audioFilePath);

  const [error, assistantMessageDoc] = await messageService.createNewMessage({
    userNumber: userPhoneNumber,
    sender: "assistant",
    content: replyMessage,
    messageType: "text",
    audioUrl,
  });

  if (error) throw error;

  // Step 3: Send response back to user via WhatsApp API

  await sendMessageToUser(userPhoneNumber, replyMessage, audioUrl);

  // Update user message count -> Later to be changed to cache based
  userMessageCount[userPhoneNumber] =
    (userMessageCount[userPhoneNumber] || 0) + 1;

  try {
    const shouldSendRecommendationMessage =
      await messageService.shouldSendRecommendationMessage(userPhoneNumber);

    const function_call = await runConversation(processedUserMessage);

    if (shouldSendRecommendationMessage) {
      const searchTerm = await runRecommendation(conversationHistory);

      if (searchTerm) {
        await sendProductRecommendationToUser(userPhoneNumber, searchTerm);
      }
    }

    const { language, topic, sentiment, region } = function_call;

    await dailyInteractionAnalyticsService.updateAnalyticsForDay({
      isUniqueUser,
      topic,
      language,
      sentiment,
      region,
    });
  } catch (err) {
    console.error("Error running function call: ", err);
  }

  return;
});
