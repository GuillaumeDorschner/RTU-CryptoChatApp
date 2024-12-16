import { useEffect, useRef } from 'react';
import Messages from './Messages';
import { useChatContext } from '../context/ChatContext';

const Chat = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { user, chats } = useChatContext();

  if (!user) return null;

  const other = chats.find((chat) => chat.id === user.openChatId);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [other?.messages]);

  return (
    <div className="p-4 bg-bgCard rounded-lg h-full flex flex-col">
      <div className="flex-grow overflow-y-auto mt-2 space-y-2">
        {other?.messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === user.id;
          const showName = index === 0 || other.messages[index - 1].senderId !== msg.senderId;

          return (
            <Messages
              key={index}
              name={showName ? (isCurrentUser ? 'You' : other?.name) : ''}
              message={msg.text}
              isCurrentUser={isCurrentUser}
            />
          );
        })}
        <div ref={chatEndRef}></div>
      </div>
    </div>
  );
};

export default Chat;
