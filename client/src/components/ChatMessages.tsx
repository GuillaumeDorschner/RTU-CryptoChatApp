import Messages from './Messages';

interface Chat {
  name: string;
  messages: Messages[];
}

interface Messages {
  user: number;
  message: string;
}

const Chat = () => {
  const chat: Chat = {
    name: 'Guillaume',
    messages: [
      { user: 1, message: 'Hello Guillaume!' },
      { user: 0, message: 'Hi there, how are you?' },
      { user: 0, message: 'Are you available for a call?' },
      { user: 1, message: 'Sure, let’s do it!' },
      { user: 0, message: 'Great, sending you the link.' },
    ],
  };

  return (
    <div className="p-4 bg-bgCard rounded-lg">
      <h3 className="text-lg font-bold">{chat.name}</h3>
      <div className="mt-2 space-y-2">
        {chat.messages.map((msg, index) => {
          return <Messages key={index} name={''} message={msg.message} />;
        })}
      </div>
    </div>
  );
};

export default Chat;
