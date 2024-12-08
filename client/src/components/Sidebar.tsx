import NewChat from './NewChat';
import Chat from './Chat';

interface ChatData {
  id: number;
  name: string;
  lastMessage: string;
}

const Sidebar = () => {
  const chats: ChatData[] = [
    {
      id: 1,
      name: 'Guillaume',
      lastMessage: 'This is the last message',
    },
    {
      id: 2,
      name: 'John',
      lastMessage: 'Hello there!',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
    {
      id: 3,
      name: 'Emily',
      lastMessage: 'How are you doing?',
    },
  ];

  return (
    <div className=" h-full flex flex-col">
      <NewChat />
      <div className="max-h-max overflow-y-auto">
        {chats.map((chat) => (
          <Chat key={chat.id} id={chat.id} name={chat.name} lastMessage={chat.lastMessage} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
