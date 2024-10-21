import { createHmac, randomBytes } from "crypto";

const createHash = async (text, secret) => {
  const hash = createHmac("sha256", secret).update(text).digest("hex");
  return hash;
};

const randomString = (size = 21) => {
  return randomBytes(size).toString("hex").slice(0, size);
};

export default { createHash, randomString };
