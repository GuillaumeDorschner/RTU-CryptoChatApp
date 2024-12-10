import { useEffect, useRef } from 'react';
import Messages from './Messages';
import { useChatContext } from '../ChatContext';

const Chat = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { chats } = useChatContext();

  console.log(chats);

  // const chat: Chat = {
  //   name: 'Guillaume',
  //   messages: [
  //     { user: 1, message: 'Hello Guillaume!' },
  //     { user: 0, message: 'Hi there, how are you?' },
  //     { user: 0, message: 'Are you available for a call?' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 1, message: 'Sure, let’s do it!' },
  //     { user: 0, message: 'Great, sending you the link.' },
  //   ],
  // };

  // useEffect(() => {
  //   if (chatEndRef.current) {
  //     chatEndRef.current.scrollIntoView({ behavior: 'instant' });
  //   }
  // }, [chat.messages]);

  return (
    <div className="p-4 bg-bgCard rounded-lg h-full flex flex-col">
      {/* <h3 className="text-lg font-bold">{chat.name}</h3>
      <div className="flex-grow overflow-y-auto mt-2 space-y-2">
        {chat.messages.map((msg, index) => (
          <Messages key={index} name={msg.user === 1 ? chat.name : ''} message={msg.message} />
        ))}
        <div ref={chatEndRef}></div>
      </div> */}
    </div>
  );
};

export default Chat;
