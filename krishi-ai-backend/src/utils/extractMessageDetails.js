export const extractMessageDetails = (payload) => {
  try {
    const messageData = payload.data.message;
    const userPhoneNumber = messageData.phone_number;
    const messageType = messageData.message_type;
    const userName = messageData.userName || "User";

    let userMessage = "";
    let mediaUrl = "";
    let mediaType = "";

    switch (messageType) {
      case "TEXT":
        userMessage = messageData.message_content.text;
        mediaType = "text";
        break;
      case "AUDIO":
        mediaUrl = messageData.message_content.url;
        mediaType = messageType.toLowerCase();
        break;
      case "IMAGE":
      case "VIDEO":
        mediaUrl = messageData.message_content.url;
        mediaType = messageType.toLowerCase();
        break;
      default:
        throw new Error("Unsupported message type");
    }

    return { userMessage, userPhoneNumber, mediaUrl, mediaType, userName };
  } catch (error) {
    console.error("Error extracting message details:", error);
    throw error;
  }
};
