import { useState } from 'react';
import ToggleDarkMode from './ToggleDarkMode';
import { useChatContext } from '../context/ChatContext';

const NewChat = () => {
  const { user, setUser, chats, setChats, ws } = useChatContext();
  const [newChatId, setNewChatId] = useState('');

  const handleNewChat = async () => {
    if (newChatId.trim() === '') return;

    const randomId = Math.floor(Math.random() * 1000); // TODO: remove
    const randomPublic = Math.floor(Math.random() * 1000); // TODO: remove
    const randomPrivate = Math.floor(Math.random() * 1000); // TODO: remove

    // fail alert user already in chat
    const chatExists = chats.find((chat) => chat.participantId === newChatId);
    if (chatExists) {
      console.log('Chat already exists');
      alert('Chat already exists');
      return;
    }

    const data = {
      type: 'relayPublicKey',
      keyType: 'publicKeyOne',
      senderId: user?.id,
      recipientId: newChatId,
      publicKey: randomPublic, // TODO: ECDH key pair
      senderName: user?.name,
    };

    ws?.send(JSON.stringify(data));

    const newChat = {
      id: randomId,
      name: '',
      participantId: newChatId,
      cryptographie: {
        AESkey: '',
        publicKey: randomPublic,
        privateKey: randomPrivate,
      },
      messages: [],
    };

    setChats([...chats, newChat]);

    console.log('chats: ', chats);
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
