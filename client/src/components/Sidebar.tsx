import NewChat from './NewChat';
import Chat from './Chat';

interface Message {
  user: number;
  message: string;
}

interface ChatData {
  id: number;
  name: string;
  messages: Message[];
}

const Sidebar = () => {
  const chats: ChatData[] = [
    {
      id: 1,
      name: 'Guillaume',
      messages: [
        { user: 1, message: 'Hello Guillaume!' },
        { user: 0, message: 'Hi there, how are you?' },
        { user: 0, message: 'Are you available for a call?' },
        { user: 1, message: 'Sure, let’s do it!' },
        { user: 0, message: 'Great, sending you the link.' },
      ],
    },
    {
      id: 2,
      name: 'John',
      messages: [
        { user: 1, message: 'Hey John!' },
        { user: 0, message: 'What’s up?' },
      ],
    },
  ];

  return (
    <div className=" h-full flex flex-col">
      <NewChat />
      <div className="max-h-max overflow-y-auto">
        {chats.map((chat) => (
          <Chat key={chat.id} id={chat.id} name={chat.name} lastMessage={chat.messages[0].message} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
