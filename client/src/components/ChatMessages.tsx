import { useEffect, useRef } from "react";
import Messages from "./Messages";
import { useChatContext } from "../context/ChatContext";

const Chat = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { user, chats } = useChatContext();

  if (!user) return null;

  // TODO: problem
  const other = chats.find((chat) => chat.id === user.openChatId);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [other?.messages]);

  return (
    <div className="flex h-full flex-col rounded-lg bg-bgCard p-4">
      <div className="mt-2 flex-grow space-y-2 overflow-y-auto">
        {other?.messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === user.id;
          const showName =
            index === 0 || other.messages[index - 1].senderId !== msg.senderId;

          return (
            <Messages
              key={index}
              name={showName ? (isCurrentUser ? "You" : other?.name) : ""}
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
