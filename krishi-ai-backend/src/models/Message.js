import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    userNumber: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
    },
    inputAudioUrl: {
      type: String,
    },
    outputAudioUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
