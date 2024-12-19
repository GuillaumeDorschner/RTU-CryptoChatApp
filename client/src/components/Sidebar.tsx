import NewChat from "./NewChat";
import Chat from "./Chat";
import { useChatContext } from "../context/ChatContext";

const Sidebar = () => {
  const { user, chats } = useChatContext();

  return (
    <div className="flex h-full flex-col">
      <NewChat />
      <div className="max-h-max overflow-y-auto">
        {chats.map((chat) => (
          <Chat
            key={chat.id}
            id={chat.id}
            name={chat.name}
            focus={chat.id === user?.openChatId}
            lastMessage={chat.messages[chat.messages.length - 1]?.text}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
