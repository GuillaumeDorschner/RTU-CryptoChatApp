import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useChatContext, Settings } from "../context/ChatContext";

const ChatHeader = () => {
  const { user, chats, settings, setSettings } = useChatContext();

  const toggleSetting = () => {
    const newSettings: Settings = {
      theme: settings?.theme || "light",
      open: !settings?.open || false,
    };

    setSettings(newSettings);
  };

  // TODO: problem
  const name = chats.find((chat) => chat.id === user?.openChatId)?.name;

  return (
    <div className="flex flex-row justify-between py-2">
      <p className="text-xl font-semibold text-text">{name}</p>
      <button onClick={toggleSetting} className="px-2">
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>
  );
};

export default ChatHeader;
