import ToggleDarkMode from './ToggleDarkMode';

const NewChat = () => {
  const handleNewChat = async () => {
    console.log('New chat with user ID: ');
  };
  return (
    <div className="flex flex-col max-w-full p-4 mb-4 rounded-lg bg-bgCard">
      <div className="flex flex-row my-2 justify-between">
        <div className="flex justify-center items-center text-xl">Newchat</div>
        <ToggleDarkMode />
      </div>
      <input
        type="text"
        placeholder="Enter ID of user"
        className="border-2 border-bgGlobal rounded-lg p-1 px-2 bg-bgCard"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleNewChat();
        }}
      />
    </div>
  );
};

export default NewChat;
