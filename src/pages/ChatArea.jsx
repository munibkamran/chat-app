import React, { useEffect, useState } from "react";
import {
  HiOutlineVideoCamera,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { IoPersonAdd } from "react-icons/io5";
import { BsThreeDots, BsPaperclip } from "react-icons/bs";
import { CiImageOn } from "react-icons/ci";
import { MdSend } from "react-icons/md";
import { FaAngleLeft } from "react-icons/fa6";
import Messages from "./Messages";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  setDoc,
  getDoc,
  onSnapshot,
  increment,
  query,
  collection,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuid } from "uuid";
import { changeUser } from "../redux/chatSlice";

const ChatArea = () => {
  const { user, chatId } = useSelector((state) => state.chat);
  const [users, setUsers] = useState([]);
  console.log("Global update for users:", users);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const remainingCount = onlineUsers.length > 4 ? onlineUsers.length - 4 : 0;
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const currentUser = auth.currentUser;
  const receiverUid = user?.uid;
  const dispatch = useDispatch();

  const handleSend = async () => {
    const cloudName = "doeind56b";
    const uploadPreset = "Chat-App";
    if (!chatId) return;

    try {
      let downloadURL = null;
      if (img) {
        const data = new FormData();
        data.append("file", img);
        data.append("upload_preset", uploadPreset);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "post", body: data },
        );
        const urlData = await res.json();
        if (urlData.secure_url) downloadURL = urlData.secure_url;
      }

      if (!text.trim() && !downloadURL) return;

      const isGlobal = user?.uid === "global-chat";
      const chatPath = isGlobal
        ? doc(db, "groups", "global-chat")
        : doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatPath);

      if (!chatSnap.exists()) await setDoc(chatPath, { messages: [] });

      await updateDoc(chatPath, {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
          senderName: currentUser.displayName,
          senderPhoto: currentUser.photoURL,
          ...(downloadURL && { img: downloadURL }),
        }),
      });

      if (isGlobal) {
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          ["global-chat.lastMessage"]: text || "Sent an image",
          ["global-chat.date"]: Timestamp.now(),
          ["global-chat.unreadCount"]: 0,
        });

        users.forEach(async (u) => {
          if (u.uid !== currentUser.uid) {
            await updateDoc(doc(db, "userChats", u.uid), {
              ["global-chat.lastMessage"]: text,
              ["global-chat.date"]: Timestamp.now(),
              ["global-chat.unreadCount"]: increment(1),
            });
          }
        });
      } else {
        await updateDoc(doc(db, "userChats", receiverUid), {
          [chatId + ".lastMessage"]: text || "Sent an image",
          [chatId + ".unreadCount"]: increment(1),
          [chatId + ".date"]: Timestamp.now(),
        });
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [chatId + ".lastMessage"]: text || "Sent an image",
          [chatId + ".date"]: Timestamp.now(),
        });
      }

      setText("");
      setImg(null);
    } catch (error) {
      console.log("Error in handleSend:", error);
    }
  };

  useEffect(() => {
    const useRef = collection(db, "users");
    const q = query(useRef);
    const unsub = onSnapshot(q, (snapshot) => {
      let list = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData !== currentUser.uid) {
          list.push({ id: doc.id, ...userData });
        }
      });
      setUsers(list);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("isOnline", "==", true));
    const unsub = onSnapshot(q, (snapShot) => {
      const users = [];
      snapShot.forEach((doc) => {
        const userData = doc.data();
        if (userData?.uid !== currentUser?.uid)
          users.push({ ...doc.data(), id: doc.id });
      });
      setOnlineUsers(users);
    });
    return () => unsub();
  }, []);

  return (
    <div
      className={`bg-[#F4F6FA] dark:bg-[#20232D] md:w-[70%] w-full h-dvh flex flex-col overflow-hidden ${user ? "flex" : "hidden"} md:flex transition-colors duration-300`}
    >
      {user ? (
        <>
          <div className="flex-none w-full h-[70px] border-b border-gray-300 dark:border-gray-700 bg-[#F4F6FA] dark:bg-[#20232D] flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-3">
              <div
                onClick={() => dispatch(changeUser({ user: "", chatId: "" }))}
                className="block lg:hidden cursor-pointer"
              >
                <FaAngleLeft className="text-black dark:text-white" size={24} />
              </div>
              {user.uid !== "global-chat" && (
                <img
                  src={user.photoURL}
                  className="rounded-full h-[45px] w-[45px] object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="text-black dark:text-white font-bold text-lg">
                  {user?.displayName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex -space-x-2">
                {user?.uid === "global-chat" &&
                  onlineUsers
                    .slice(0, 4)
                    .map((item) => (
                      <img
                        key={item.uid}
                        src={item.photoURL}
                        className="h-9 w-9 rounded-full border-2 border-white dark:border-[#20232D]"
                      />
                    ))}
                {remainingCount > 0 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-[#417dff]">
                    <span className="text-[11px] font-medium text-gray-600 dark:text-white">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-2">
            <Messages />
          </div>
          <div className="flex-none p-4 lg:pb-4 bg-transparent sticky bottom-0">
            <div className="bg-white dark:bg-[#1A1C20] shadow-sm rounded-full lg:rounded-lg w-full h-[55px] flex items-center px-4 gap-3 border dark:border-gray-800">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type Something...."
                className="flex-1 bg-transparent outline-none text-black dark:text-white text-sm"
              />
              <div className="flex items-center gap-3 text-gray-400">
                <input
                  type="file"
                  style={{ display: "none" }}
                  id="file"
                  onChange={(e) => setImg(e.target.files[0])}
                />
                <label htmlFor="file">
                  <CiImageOn
                    className={`cursor-pointer ${img ? "text-blue-500" : ""}`}
                    size={24}
                  />
                </label>
                <BsPaperclip className="cursor-pointer" size={20} />
                <button
                  onClick={handleSend}
                  className={`${text.length > 0 ? "bg-[#4183D8] border-[#4183D8] text-white" : "border-gray-400"} dark:text-white border border-gray-400 p-2 rounded-full hover:scale-105 transition-all`}
                >
                  <MdSend size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-center items-center opacity-50">
          <HiOutlineChatBubbleLeftRight size={80} className="text-gray-300" />
          <p className="mt-4 font-medium dark:text-white text-black">
            Select a friend to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
