import axios from "axios";
import { AISENSY_PROJECT_ID, AISENSY_API_KEY } from "../config/config.js";
import productRecommendationService from "./productRecommendationService.js";

export const sendMessageToUser = async (
  userPhoneNumber,
  replyMessage,
  audioUrl
) => {
  try {
    const baseOptions = {
      method: "POST",
      url: `https://apis.aisensy.com/project-apis/v1/project/${AISENSY_PROJECT_ID}/messages`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-AiSensy-Project-API-Pwd": AISENSY_API_KEY,
      },
    };

    // Send text message
    const textOptions = {
      ...baseOptions,
      data: {
        to: userPhoneNumber,
        type: "text",
        recipient_type: "individual",
        text: { body: replyMessage },
      },
    };
    await axios.request(textOptions);
    console.log("Text Message sent successfully");

    // Send audio message
    if (audioUrl) {
      const audioOptions = {
        ...baseOptions,
        data: {
          to: userPhoneNumber,
          type: "audio",
          audio: { link: audioUrl },
        },
      };
      await axios.request(audioOptions);
      console.log("Audio message sent successfully");
    }

    return;
  } catch (error) {
    console.error(
      "Error sending message via WhatsApp API:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const sendProductRecommendationToUser = async (
  userPhoneNumber,
  searchTerm
) => {
  try {
    const products = await productRecommendationService.getProductsFromAmazon(
      searchTerm
    );

    if (products?.length !== 5) return;

    const baseOptions = {
      method: "POST",
      url: `https://apis.aisensy.com/project-apis/v1/project/${AISENSY_PROJECT_ID}/messages`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-AiSensy-Project-API-Pwd": AISENSY_API_KEY,
      },
    };

    const cards = products.map((product, card_index) => {
      const { title, link, imageUrl } = product;
      // Truncate title to the first 90 characters
      const CHARACTER_LIMIT = 90;
      const words = title.split(" ");
      let shortTitle = "";
      for (const word of words) {
        const shortTitlePre = shortTitle;
        shortTitle += `${word} `;
        if (shortTitle.length > CHARACTER_LIMIT) {
          shortTitle = shortTitlePre + "...";
          break;
        }
      }

      if (!shortTitle.length) {
        shortTitle = title.substring(0, CHARACTER_LIMIT) + "...";
      }

      return {
        card_index,
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: imageUrl,
                },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: shortTitle,
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: link.split("https://www.amazon.in/")[1],
              },
            ],
          },
        ],
      };
    });

    // Send carousel message
    const textOptions = {
      ...baseOptions,
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userPhoneNumber,
        type: "template",
        template: {
          name: "agriculte_carousel_1",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [],
            },
            {
              type: "carousel",
              cards,
            },
          ],
        },
      },
    };
    await axios.request(textOptions);
    console.log("Text Message sent successfully");

    return;
  } catch (error) {
    console.error(
      "Error sending carousel message via WhatsApp API:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
