import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const ChatHeader = () => {
  const name = 'Chat Header';

  const toggleSetting = () => {
    console.log('toggle');
  };

  return (
    <div className="flex flex-row justify-between py-2">
      <p className="text-xl">{name}</p>
      <button onClick={toggleSetting} className="px-2">
        <FontAwesomeIcon icon={faGear} />
      </button>
    </div>
  );
};

export default ChatHeader;
