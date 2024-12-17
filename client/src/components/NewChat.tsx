import { useState } from 'react';
import ToggleDarkMode from './ToggleDarkMode';
import { useChatContext } from '../context/ChatContext';
import { v4 as uuidv4 } from 'uuid';
import { ECC } from '../CryptoAlgs/ECC/ecc';

const NewChat = () => {
  const { user, setUser, chats, setChats, ws } = useChatContext();
  const [newChatId, setNewChatId] = useState('');

  const handleNewChat = async () => {
    if (newChatId.trim() === '') return;

    const randomId = uuidv4();

    const ecc = (new ECC())

    const publicKey = ecc.getPublicKey();
    const privateKey = ecc.sk;

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
      publicKey: publicKey,
      senderName: user?.name,
    };

    ws?.send(JSON.stringify(data));

    const newChat = {
      id: randomId,
      name: '',
      participantId: newChatId,
      cryptographie: {
        AESkey: '',
        publicKey: publicKey,
        privateKey: privateKey,
      },
      messages: [],
    };

    setChats([...chats, newChat]);
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
      <p>Your ID:</p>
      <p>{user?.id}</p>
    </div>
  );
};

export default NewChat;
