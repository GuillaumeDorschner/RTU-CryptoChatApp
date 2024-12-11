interface MessagesProps {
  name: string;
  message: string;
  isCurrentUser: boolean;
}

const Messages = ({ name, message, isCurrentUser }: MessagesProps) => {
  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      {name && <p className="text-sm text-gray-500 mb-1">{name}</p>}
      <div className={`px-3 py-2 rounded-lg w-max ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-bubbleChat'}`}>
        {message}
      </div>
    </div>
  );
};

export default Messages;
