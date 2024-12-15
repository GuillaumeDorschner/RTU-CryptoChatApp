import { useState } from 'react';
import ToggleDarkMode from './ToggleDarkMode';
import { useChatContext } from '../context/ChatContext';

const NewChat = () => {
  const { user, setUser, chats, setChats, ws } = useChatContext();
  const [newChatId, setNewChatId] = useState('');

  const handleNewChat = async () => {
    if (newChatId.trim() === '') return;

    const data = {
      type: 'relayPublicKey',
      keyType: 'publicKeyOne',
      senderId: user?.id,
      recipientId: newChatId,
      publicKey: 'heyydfskjfhsdkj 1', // TODO: ECDH
      senderName: user?.name,
    };

    // TODO: Send request to server to create new chat
    ws?.send(JSON.stringify(data));

    // TODO fail alert user not found
    // TODO fail alert user already in chat
  };
  return (
    <div className="flex flex-col max-w-full p-4 mb-4 rounded-lg bg-bgCard">
      <div className="flex flex-row my-2 justify-between">
        <div className="flex justify-center items-center text-xl">Newchat</div>
        <ToggleDarkMode />
      </div>
      <input
        placeholder="Enter ID of user"
        onChange={(e) => setNewChatId(e.target.value)}
        className="border-2 border-bgGlobal rounded-lg p-1 px-2 bg-bgCard"
        type="text"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleNewChat();
        }}
      />
      <p>my id: {user?.id})</p>
    </div>
  );
};

export default NewChat;
