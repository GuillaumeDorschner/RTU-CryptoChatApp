import { useChatContext } from '../context/ChatContext';

interface ChatProps {
  id: number;
  name: string;
  lastMessage: string;
  focus: boolean;
}

const ChatList = ({ id, name, lastMessage, focus }: ChatProps) => {
  const { setUser } = useChatContext();

  const handleChatClick = () => {
    console.log(`Chat number ${id} clicked!`);

    setUser((prevUser) => ({ ...prevUser, openChatId: id }));
  };

  return (
    <div
      className={`max-w-full p-4 mb-4 rounded-lg cursor-pointer transition-shadow hover:shadow-md ${
        focus ? 'bg-focus' : 'bg-bgCard'
      }`}
      onClick={handleChatClick}
    >
      <p className={`text-lg font-semibold text-textPrimary ${focus ? 'text-textInverse' : 'text-text'}`}>{name}</p>
      <p className={`text-sm text-textSecondary truncate ${focus ? 'text-textInverse' : 'text-text'}`}>{lastMessage}</p>
    </div>
  );
};

export default ChatList;
