import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useChatContext } from '../context/ChatContext';
import { AESImpl, WordArray } from 'crypto-lib';

const aes = new AESImpl();

function getOrThrowStr(input: string | undefined): string {
  if (typeof input === 'string') {
    return input;
  }
  throw new Error('string was undefined');
}

function getByteLengthUtf16(input: string): number {
  let byteLength = 0;
  for (const char of input) {
    byteLength += char.charCodeAt(0) > 0xffff ? 4 : 2;
  }
  return byteLength;
}

const ChatInput = () => {
  const { user, chats, setChats, ws } = useChatContext();
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim() && user && user.openChatId !== null) {
      const newMessage = {
        text: messageInput.trim(),
        senderId: user.id,
        time: new Date(),
      };

      const chat = chats.find((chat) => chat.id === user.openChatId);

      const participantId = chat?.participantId;
      const sharedKey = chat?.cryptographie?.AESkey;
      aes.init(getOrThrowStr(sharedKey), getByteLengthUtf16(getOrThrowStr(sharedKey)), aesConstants);
      const salt = aes._salt;
      console.log('shared key 4: ' + sharedKey);

      const encryptedMessage: string = WordArray.stringifyBase64(aes.encryptMessage(messageInput.trim(), aesConstants));
      console.log('Encrypted message source: ' + encryptedMessage);
      console.log('Salt: ' + salt);

      const data = {
        type: 'relayEncryptedMessage',
        senderId: user.id,
        recipientId: participantId,
        encryptedMessage: encryptedMessage,
        salt: salt,
      };

      ws?.send(JSON.stringify(data));

      const updatedChats = chats.map((chat) =>
        chat.id === user.openChatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat,
      );

      setChats(updatedChats);
      setMessageInput('');
    }
  };

  return (
    <div className="flex items-center p-2 bg-bubbleChat rounded-lg shadow-md">
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        className="flex-grow p-2 border-none rounded-lg outline-none bg-bubbleChat focus:ring focus:ring-blue-300"
        placeholder="Type your message..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSendMessage();
        }}
      />
      <button onClick={handleSendMessage} className="ml-2 py-1 px-2 text-text">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  );
};

export default ChatInput;
