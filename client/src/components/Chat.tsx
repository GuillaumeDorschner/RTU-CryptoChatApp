interface ChatProps {
  id: number;
  name: string;
  lastMessage: string;
}

const ChatList = ({ id, name, lastMessage }: ChatProps) => {
  const handleChatClick = () => {
    console.log(`Chat number ${id} clicked!`);
  };

  return (
    <div
      className="max-w-full p-4 mb-4 rounded-lg bg-bgCard cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleChatClick}
    >
      <p className="text-lg font-semibold text-textPrimary">{name}</p>
      <p className="text-sm text-textSecondary truncate">{lastMessage}</p>
    </div>
  );
};

export default ChatList;
