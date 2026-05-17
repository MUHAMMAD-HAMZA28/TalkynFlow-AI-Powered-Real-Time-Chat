import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export const getStreamToken = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Initialize server-side Stream client
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    // Generate user token for Stream Chat
    const token = serverClient.createToken(user._id.toString());

    res.status(200).json({
      token,
      apiKey,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Stream Token Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleBotChat = async (req, res) => {
  try {
    const { channelId, messageText } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!channelId || !messageText) {
      return res.status(400).json({ message: "Channel ID and message text are required" });
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // Ensure the bot user is registered on Stream Chat
    try {
      await serverClient.upsertUser({
        id: "talkynbot",
        name: "TalkynBot",
        role: "bot",
      });
    } catch (upsertErr) {
      console.error("Error upserting bot user:", upsertErr);
    }

    // Split ID or use as-is
    const cleanChannelId = channelId.includes(":") ? channelId.split(":")[1] : channelId;
    const channel = serverClient.channel("messaging", cleanChannelId);

    // Send keystroke start-typing event to show "TalkynBot is typing..." on screen!
    try {
      await channel.sendEvent({
        type: "typing.start",
        user: { id: "talkynbot", name: "TalkynBot" },
      });
    } catch (eventErr) {
      console.error("Error sending typing.start event:", eventErr);
    }

    let aiResponse = "";
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      // Call Gemini API if Gemini key is available
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are TalkynBot, a friendly and extremely helpful AI assistant inside the TalkynFlow chat application. Keep your responses concise, highly natural, engaging, strictly in English, and absolutely do not use any emojis under any circumstances. User says: ${messageText}`
              }]
            }]
          })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          aiResponse = data.candidates[0].content.parts[0].text;
        } else {
          aiResponse = "I'm sorry, I had trouble generating a reply from Gemini. Please try again.";
        }
      } catch (geminiError) {
        console.error("Gemini Error:", geminiError);
        aiResponse = "I'm sorry, I had trouble connecting to Google Gemini.";
      }
    } else if (openaiKey) {
      // Call OpenAI API
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are TalkynBot, a friendly and extremely helpful AI assistant inside the TalkynFlow chat application. Keep your responses concise, highly natural, engaging, strictly in English, and absolutely do not use any emojis under any circumstances."
              },
              { role: "user", content: messageText }
            ]
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          aiResponse = data.choices[0].message.content;
        } else {
          console.error("OpenAI API Error:", data);
          aiResponse = "I'm sorry, I encountered an issue processing your request. Please try again.";
        }
      } catch (openaiError) {
        console.error("OpenAI Error:", openaiError);
        aiResponse = "I'm sorry, I could not connect to OpenAI.";
      }
    } else {
      aiResponse = "I'm sorry, but no AI credentials (OPENAI_API_KEY or GEMINI_API_KEY) were found in the server configuration.";
    }

    // Stop typing indicator
    try {
      await channel.sendEvent({
        type: "typing.stop",
        user: { id: "talkynbot", name: "TalkynBot" },
      });
    } catch (eventErr) {
      console.error("Error sending typing.stop event:", eventErr);
    }

    // Send AI reply message
    await channel.sendMessage({
      text: aiResponse,
      user_id: "talkynbot",
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("TalkynBot API Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const handleDirectAIChat = async (req, res) => {
  try {
    const { messageText, history } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!messageText) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = "";

    // Build history for conversational memory
    const formattedHistory = Array.isArray(history) ? history.map(h => ({
      role: h.role === "bot" || h.role === "assistant" ? "assistant" : "user",
      content: h.content || h.text
    })) : [];

    if (geminiKey) {
      try {
        const geminiContents = formattedHistory.map(h => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        }));
        geminiContents.push({
          role: "user",
          parts: [{ text: `You are TalkynBot, a friendly and extremely helpful AI assistant inside the TalkynFlow chat application. Keep your responses highly natural, engaging, strictly in English, and absolutely do not use any emojis under any circumstances. User prompt: ${messageText}` }]
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents
          })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          aiResponseText = data.candidates[0].content.parts[0].text;
        } else {
          console.error("Gemini Direct Error:", data);
          aiResponseText = "I'm sorry, I could not generate a response from Gemini.";
        }
      } catch (geminiError) {
        console.error("Gemini Fetch Direct Error:", geminiError);
        aiResponseText = "I'm sorry, I encountered an issue connecting to Gemini.";
      }
    } else if (openaiKey) {
      try {
        const openaiMessages = [
          {
            role: "system",
            content: "You are TalkynBot, a friendly and extremely helpful AI assistant inside the TalkynFlow chat application. Keep your responses highly natural, engaging, strictly in English, and absolutely do not use any emojis under any circumstances."
          },
          ...formattedHistory,
          { role: "user", content: messageText }
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: openaiMessages
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          aiResponseText = data.choices[0].message.content;
        } else {
          console.error("OpenAI Direct Error:", data);
          aiResponseText = "I'm sorry, I could not generate a response from OpenAI.";
        }
      } catch (openaiError) {
        console.error("OpenAI Fetch Direct Error:", openaiError);
        aiResponseText = "I'm sorry, I encountered an issue connecting to OpenAI.";
      }
    } else {
      aiResponseText = "AI credentials are not configured. Please add OPENAI_API_KEY or GEMINI_API_KEY to your environment.";
    }

    res.status(200).json({ text: aiResponseText });
  } catch (error) {
    console.error("Direct AI Chat Handler Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};