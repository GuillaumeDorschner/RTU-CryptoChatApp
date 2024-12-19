import { useChatContext } from "../context/ChatContext";

interface ChatProps {
  id: number;
  name: string;
  lastMessage: string;
  focus: boolean;
}

const ChatList = ({ id, name, lastMessage, focus }: ChatProps) => {
  const { setUser } = useChatContext();

  const handleChatClick = () => {
    // TODO: problem
    setUser((prevUser) => ({ ...prevUser, openChatId: id }));
  };

  return (
    <div
      className={`mb-4 max-w-full cursor-pointer rounded-lg p-4 transition-shadow hover:shadow-md ${
        focus ? "bg-focus" : "bg-bgCard"
      }`}
      onClick={handleChatClick}
    >
      <p
        className={`text-textPrimary text-lg font-semibold ${focus ? "text-textInverse" : "text-text"}`}
      >
        {name}
      </p>
      <p
        className={`text-textSecondary truncate text-sm ${focus ? "text-textInverse" : "text-text"}`}
      >
        {lastMessage}
      </p>
    </div>
  );
};

export default ChatList;
