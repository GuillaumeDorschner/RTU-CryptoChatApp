import ChatList from './ChatList';

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
    <div className="sidebar">
      {chats.map(function (chat) {
        return <ChatList {...chat} />;
      })}
    </div>
  );
};

export default Sidebar;
