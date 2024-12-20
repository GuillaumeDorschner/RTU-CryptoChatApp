interface MessagesProps {
  name: string;
  message: string;
  isCurrentUser: boolean;
}

const Messages = ({ name, message, isCurrentUser }: MessagesProps) => {
  return (
    <div
      className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      {name && <p className="mb-1 text-sm text-gray-500">{name}</p>}
      <div
        className={`w-max rounded-lg px-3 py-2 ${isCurrentUser ? "bg-blue-500 text-white" : "bg-bubbleChat"}`}
      >
        {message}
      </div>
    </div>
  );
};

export default Messages;
