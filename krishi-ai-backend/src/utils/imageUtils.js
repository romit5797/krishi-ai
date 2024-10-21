import axios from "axios";

import { TUNE_AI_API_KEY, TUNE_AI_ORG_KEY } from "../config/config.js";

export const visionCompletion = async (imageUrl) => {
  try {
    let data = {
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are assigned the task to analyse agricultural images and provide concise descriptions of detected issues. The output may include: Key Visual Indicators: Highlights the specific visual features that led to the identification. Use of Relevant Terms: Incorporates important agricultural terms for accuracy. Simple Language: Descriptions are easy to understand for quick comprehension. Identification of the Issue: Clearly states what the problem is (e.g., pest infestation, disease symptom, nutrient deficiency). For example: Example 1: Yellow Rust in Wheat: Wheat leaves display yellow stripe patterns along the veins, which is indicative of a yellow rust infection affecting the crop's health. Example 2: Whitefly Infestation in Cotton: Cotton plants show clusters of tiny white insects on the undersides of leaves, suggesting a whitefly infestation that may reduce yield.Example 3: Fall Armyworm Damage in Maize: Maize leaves have irregular, ragged holes and visible frass near the whorl, characteristic signs of fall armyworm damage. Example 4: Soil Salinity Issues: The soil surface exhibits a white, powdery crust, indicating salinity problems that can hinder plant growth and reduce soil fertility. Example 5: Livestock Malnutrition: Livestock appear undernourished with prominent ribs and hip bones visible, indicating possible malnutrition due to inadequate feeding. If you find the image unclear or irrelevant please ask folow-up question on agriculture.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the Image. If not clear about the image discard with a sorry message.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      model: "meta/llama-3.2-90b-vision",
      stream: false,
      frequency_penalty: 0.2,
      max_tokens: 200,
    };

    const completion = await axios.post(
      "https://proxy.tune.app/chat/completions",
      data,
      {
        headers: {
          Authorization: TUNE_AI_API_KEY,
          "Content-Type": "application/json",
          "X-Org-Id": TUNE_AI_ORG_KEY,
        },
      }
    );

    const msg =
      completion?.data?.choices[0].message?.content.trim() ||
      "Sorry, I couldn't process your image. Please try again.";

    return (
      "User has sent an image, following is the AI generated image description\n" +
      msg
    );
  } catch (error) {
    console.log(error);
    return null;
  }
};
