import { StreamChat } from "stream-chat"; 
import dotenv from "dotenv"; 
dotenv.config(); 

const apiKey = process.env.STREAM_API_KEY; 
const apiSecret = process.env.STREAM_API_SECRET; 

// 1. Initialize the Server Client
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// 2. Function to generate user token
export const createUserToken = async (userId) => {
  try {
    const token = serverClient.createToken(userId);
    return token;
  } catch (error) {
    console.error("Error creating stream token:", error);
    throw new Error("Could not create token");
  }
};

// 3. Function to sync user details (Upsert = Update + Insert)
export const upsertStreamUser = async (userId, name, image) => {
  try {
    await serverClient.upsertUser({
      id: userId,
      name: name,
      image: image,
    });
  } catch (error) {
    console.error("Error updating user in Stream:", error);
  }
};

export default serverClient;