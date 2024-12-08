const ChatList = () => {
  const chat = (id: any) => {
    console.log('Chat number ' + id + ' clicked!');
  };

  return (
    <div className="max-w-full m-4" onClick={chat}>
      ChatList
    </div>
  );
};

export default ChatList;
