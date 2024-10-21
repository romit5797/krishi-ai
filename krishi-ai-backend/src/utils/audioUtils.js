import { createClient } from "@deepgram/sdk";
import fs from "fs";
import path from "path";
// import { fileURLToPath } from "url";
import { OPENAI_API_KEY } from "../config/config.js";
import {
  DEEPGRAM_API_KEY,
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
} from "../config/config.js";
import axios from "axios";
import OpenAI from "openai";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const deepgram = createClient(DEEPGRAM_API_KEY);

export const convertAudioToText = async (mediaUrl) => {
  try {
    // Download the audio file
    const audioResponse = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
    });
    const audioBuffer = Buffer.from(audioResponse.data);

    // Send the audio buffer to Deepgram API
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",
        smart_format: true,
        detect_language: true,
      }
    );

    if (error) throw error;

    const transcription = result.results.channels[0].alternatives[0].transcript;
    const detectedLanguage = result.results.channels[0].detected_language;

    return [transcription, detectedLanguage];
  } catch (error) {
    console.error(
      "Error converting audio to text:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const convertTextToAudio = async (text, outputFilePath) => {
  try {
    const apiKey = ELEVENLABS_API_KEY;
    // Ensure the directory exists
    await new Promise((resolve, reject) => {
      fs.mkdir(path.dirname(outputFilePath), { recursive: true }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(outputFilePath, buffer);

    return outputFilePath;
  } catch (error) {
    console.error(
      "Error converting text to audio:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// export const convertAudioToText = async (mediaUrl) => {
//   const tempFilePath = path.join(__dirname, "temp_audio_file.mp3");
//   try {
//     // Download the audio file
//     const audioResponse = await axios.get(mediaUrl, {
//       responseType: "stream",
//     });
//     console.time("audio");
//     // Save the audio file locally
//     const writer = fs.createWriteStream(tempFilePath);
//     audioResponse.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on("finish", resolve);
//       writer.on("error", reject);
//     });

//     // Transcribe the audio using OpenAI Whisper

//     const response = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(tempFilePath),
//       model: "whisper-1",
//     });

//     const transcription = response.text;

//     // Delete the temporary audio file
//     fs.unlinkSync(tempFilePath);

//     console.timeEnd("audio");

//     return transcription;
//   } catch (error) {
//     console.error(
//       "Error converting audio to text:",
//       error.response ? error.response.data : error.message
//     );
//     throw error;
//   }
// };
