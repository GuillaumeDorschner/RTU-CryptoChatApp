import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useChatContext } from '../context/ChatContext';

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

      const participantId = chats.find((chat) => chat.id === user.openChatId)?.participantId;

      if (ws) {
        ws?.send(
          JSON.stringify({
            type: 'relayEncryptedMessage',
            senderId: user.id,
            recipientId: participantId,
            encryptedMessage: newMessage.text, // TODO: Encrypt before sending
          }),
        );
      } else {
        console.error('WebSocket connection is closed or not established.');
      }

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
