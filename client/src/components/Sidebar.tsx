import NewChat from './NewChat';
import Chat from './Chat';
import { useChatContext } from '../context/ChatContext';

const Sidebar = () => {
  const { chats } = useChatContext();

  return (
    <div className=" h-full flex flex-col">
      <NewChat />
      <div className="max-h-max overflow-y-auto">
        {chats.map((chat) => (
          <Chat
            key={chat.id}
            id={chat.id}
            name={chat.name}
            lastMessage={chat.messages[chat.messages.length - 1].text}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
