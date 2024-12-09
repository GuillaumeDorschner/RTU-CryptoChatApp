interface MessagesProps {
  name: string;
  message: string;
}

const Messages = ({ name, message }: MessagesProps) => {
  return (
    <div className="flex flex-col">
      {name && <p className="text-sm text-gray-500 mb-1">{name}</p>}
      <div className="px-3 py-2 bg-bubbleChat rounded-lg w-max">{message}</div>
    </div>
  );
};

export default Messages;
