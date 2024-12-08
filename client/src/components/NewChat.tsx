import ToggleDarkMode from './ToggleDarkMode';

const NewChat = () => {
  return (
    <div className="flex flex-row m-4 justify-between">
      <div className="max-w-full ">Newchat</div>
      <ToggleDarkMode />
    </div>
  );
};

export default NewChat;
