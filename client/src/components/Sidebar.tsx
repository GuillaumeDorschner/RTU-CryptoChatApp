import NewChat from './NewChat';
import Chat from './Chat';

const Sidebar = () => {
  let chats = [
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
  ];

  return (
    <div className="m-4">
      <NewChat />
      {chats.map(function (chat) {
        return <Chat {...chat} />;
      })}
    </div>
  );
};

export default Sidebar;
