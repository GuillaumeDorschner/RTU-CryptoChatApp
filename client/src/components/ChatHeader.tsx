import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useChatContext } from '../context/ChatContext';

const ChatHeader = () => {
  const { user, chats, setSettings } = useChatContext();

  const toggleSetting = () => {
    setSettings((prevSettings) => ({ ...prevSettings, open: !prevSettings.open }));
  };

  const name = chats.find((chat) => chat.id === user?.openChatId)?.name;

  return (
    <div className="flex flex-row justify-between py-2">
      <p className="text-text text-xl font-semibold">{name}</p>
      <button onClick={toggleSetting} className="px-2">
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>
  );
};

export default ChatHeader;
