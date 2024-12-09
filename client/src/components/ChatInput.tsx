import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ChatInput = () => {
  const handleSendMessage = () => {
    console.log('Message sent!');
  };

  return (
    <div className="flex items-center p-2 bg-bubbleChat rounded-lg shadow-md">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-grow p-2 border-none rounded-lg outline-none bg-bubbleChat focus:ring focus:ring-blue-300 bg-"
      />
      <button onClick={handleSendMessage} className="ml-2 py-1 px-2 text-text">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  );
};

export default ChatInput;
