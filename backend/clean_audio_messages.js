import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const client = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

async function cleanMessages() {
  console.log('Connecting to Stream Chat...');
  const filter = { type: 'messaging' };
  const sort = [{ last_message_at: -1 }];
  
  const channels = await client.queryChannels(filter, sort, {
    watch: false,
    state: true,
  });

  console.log(`Found ${channels.length} channels.`);
  let deletedCount = 0;

  for (const channel of channels) {
    console.log(`Checking channel ${channel.id}...`);
    const messages = channel.state.messages;
    for (const msg of messages) {
      if (msg.attachments && msg.attachments.length > 0) {
        const hasVoice = msg.attachments.some(a => a.type === 'voiceRecording' || a.type === 'audio');
        if (hasVoice) {
          console.log(`Deleting message ${msg.id} with voice recording...`);
          try {
            await client.deleteMessage(msg.id, { hard: true });
            deletedCount++;
          } catch (e) {
             console.error(`Failed to delete msg ${msg.id}:`, e.message);
          }
        }
      }
    }
  }

  console.log(`Done! Deleted ${deletedCount} voice messages.`);
}

cleanMessages().catch(err => console.error(err));
