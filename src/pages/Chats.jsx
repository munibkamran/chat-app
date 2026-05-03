import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeUser } from "../redux/chatSlice";
import { auth, db } from "../firebase";
import LastMessage from "./LastMessage";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

const Chats = ({ users, filteredUsers, filter, formatChatDate }) => {
  const { chatId, user: selectedUser } = useSelector((state) => state.chat);
  const [imageLoading, setImageLoading] = useState(true);
  const [chats, setChats] = useState([]);
  console.log(chats);
  const skeletons = [1, 2, 3, 4, 5];
  const dispatch = useDispatch();
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isOnline === b.isOnline) return 0;
    return a.isOnline ? -1 : 1;
  });
  const currentUserUid = auth.currentUser?.uid;
  useEffect(() => {
    const timer = setTimeout(() => setImageLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(
        doc(db, "userChats", currentUserUid),
        (snapShot) => {
          // setChats(snapShot.data())
          const newData = snapShot.data();

          if (chats) {
            Object.keys(newData).forEach((id) => {
              if (newData[id]?.unreadCount > (chats[id]?.unreadCount || 0)) {
                const audio = new Audio("/receive-sound.mp3");
                audio.play().catch((e) => console.log("Audio play error:", e));
              }
            });
          }

          return setChats(newData);
        },
      );
      return () => unsub();
    };

    currentUserUid && getChats();
  }, [currentUserUid]);

  return (
    <>
      {imageLoading ? (
        skeletons.map((n) => (
          <div key={n} className="flex items-center gap-[10px] p-2">
            <div className="w-[46px] h-[46px] rounded-full bg-white/10 animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-white/10 animate-pulse rounded" />
              <div className="h-2 w-16 bg-white/10 animate-pulse rounded" />
            </div>
          </div>
        ))
      ) : sortedUsers.length > 0 ? (
        sortedUsers.map((user, index) => {
          const isActive = selectedUser?.uid === user.uid;
          const combinedId =
            currentUserUid > user.uid
              ? currentUserUid + user.uid
              : user.uid + currentUserUid;
          const chatData = chats ? chats[combinedId] : null;
          const unreadCount = chatData?.unreadCount || 0;
          return (
            <div
              onClick={async () => {
                if (auth.currentUser) {
                  dispatch(
                    changeUser({
                      currentUserUid: auth.currentUser.uid,
                      user: user,
                    }),
                  );
                  try {
                    await setDoc(
                      doc(db, "userChats", currentUserUid),
                      {
                        [combinedId]: {
                          unreadCount: 0,
                        },
                      },
                      { merge: true },
                    );
                    console.log("Counter Reset Ho Gaya!");
                  } catch (err) {
                    console.log("Counter reset error:", err);
                  }
                }
              }}
              key={index}
              className={`justify-between flex items-center gap-[10px] cursor-pointer transition-all
                 py-[11px] px-[15px] hover:bg-[#F3F5F9] dark:hover:bg-[#23242A] ${
                   isActive
                     ? "bg-[#F3F5F9] dark:bg-[#23242A]"
                     : "hover:bg-[#F3F5F9] dark:hover:bg-[#23242A]"
                 }`}
            >
              <div className="flex items-center gap-2">
                <div className="rounded-full relative">
                  <img
                    className="rounded-full h-[46px] w-[46px]"
                    src={user.photoURL}
                    alt={user.displayName}
                  />
                  {user?.isOnline === true && (
                    <div className="z-50 absolute bottom-0 right-1 w-2.5 h-2.5 bg-[#26C282] rounded-full"></div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="dark:text-white text-black text-sm font-semibold">
                    {user?.displayName}
                  </span>
                  <LastMessage chatId={combinedId} />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div>
                  {chats[combinedId]?.lastMessage &&
                  chats[combinedId]?.lastMessage !== "No messages yet" &&
                  !isActive ? (
                    <span className="dark:text-white text-gray-600 text-[10px]">
                      {formatChatDate(chats[combinedId]?.date)}
                    </span>
                  ) : (
                    <div className="h-4"></div>
                  )}
                </div>
                <div>
                  {!isActive ? (
                    unreadCount > 0 && (
                      <span className="bg-[#4184D6] dark:text-white text-white text-[10px] h-4 w-4 p-[7.5px] rounded-full flex justify-center items-center">
                        {unreadCount}
                      </span>
                    )
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="dark:text-white text-gray-500 text-sm text-center">
          {filter === "unread" ? "No unread messages" : "No friends found"}
        </p>
      )}
    </>
  );
};

export default Chats;
