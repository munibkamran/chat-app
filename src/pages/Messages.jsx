import React, { useEffect, useRef, useState } from "react";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { db, auth } from "../firebase";
import { MdDelete } from "react-icons/md";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { user, chatId } = useSelector((state) => state.chat);
  const data = useSelector((state) => state.chat);
  const scrollRef = useRef();

  useEffect(() => {
    if (!data.chatId && data.user?.uid !== "global-chat") return;
    const unSub = onSnapshot(
      data.user?.uid === "global-chat"
        ? doc(db, "groups", "global-chat")
        : doc(db, "chats", data.chatId),
      (doc) => {
        if (doc.exists()) {
          setMessages(doc.data().messages || []);
        }
      },
    );

    return () => unSub();
  }, [data.chatId, data.user?.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const formatTime = (date) => {
    if (!date) return "Just now";
    const msgDate = date.toDate ? date.toDate() : new Date(date);
    return msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDelete = async (msg) => {
    const chatRef =
      data.user?.uid === "global-chat"
        ? doc(db, "groups", "global-chat")
        : doc(db, "chats", data.chatId);

    try {
      await updateDoc(chatRef, {
        messages: arrayRemove(msg),
      });
      toast.success("Message deleted");
    } catch (error) {
      console.log(err);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-4 md:px-[8px] no-scrollbar overflow-y-auto w-full">
      {messages.length > 0 ? (
        messages.map((msg, index) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          return (
            <div
              key={index}
              className={`w-full flex flex-col mb-3 ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`relative group flex items-end gap-2 max-w-[85%] md:max-w-[70%] lg:max-w-[60%]`}
              >
                {data.user?.uid === "global-chat" && !isMe && (
                  <img
                    src={msg.senderPhoto}
                    className="h-[28px] w-[28px] md:h-[32px] md:w-[32px] rounded-full mb-1 flex-shrink-0"
                  />
                )}

                <div
                  className={`relative rounded-xl px-3 py-2 md:px-2 md:py-2 shadow-sm max-w-[250px] lg:max-w-[400px] ${
                    isMe
                      ? "bg-[#4183D8] text-white rounded-br-none"
                      : "bg-[#ECEEF2] dark:bg-[#2B2D3D] dark:text-white text-black rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {msg.text}
                  </p>

                  {isMe && (
                    <button
                      onClick={() => handleDelete(msg)}
                      className="hidden group-hover:flex absolute -left-8 top-1/2 -translate-y-1/2 bg-red-500/20 hover:bg-red-500 p-1 rounded-full transition-all"
                    >
                      <MdDelete
                        size={18}
                        className="text-red-500 group-hover:text-white"
                      />
                    </button>
                  )}

                  {msg.img && (
                    <div className="mt-2 overflow-hidden rounded-md">
                      <img
                        src={msg.img}
                        alt="sent"
                        className="max-h-[250px] max-w-[300px] w-full object-cover"
                      />
                    </div>
                  )}
                  <p
                    className={`text-[10px] mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}
                  >
                    {formatTime(msg.date)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div
          className="select-none text-center mt-10 flex flex-col gap-10
        py-12 items-center justify-between"
        >
          <div className="rounded-full border border-gray-300 h-16 w-16">
            <img
              src={user.photoURL}
              alt="user-photo"
              className="rounded-full object-contain"
            />
            <span className="dark:text-gray-300 text-gray-500">
              {user?.displayName?.toLowerCase() === "global-chat"
                ? ""
                : user?.displayName}
            </span>
          </div>
          <div>
            <span className="dark:text-white/30 text-gray-500">
              Start conversation..
            </span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-shrink-0 pb-4" />
    </div>
  );
};

export default Messages;
