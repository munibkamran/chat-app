import React, { useEffect, useState } from "react";
import Search from "./Search";
import { CiLogout } from "react-icons/ci";
import { auth, db } from "../firebase";
import Chats from "./Chats";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useSelector } from "react-redux";
import { changeUser } from "../redux/chatSlice";
import { useDispatch } from "react-redux";
import ThemeToggle from "../components/ThemeToggle";

const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState({});
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useDispatch();
  const skeletons = [1];
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.chat);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const totalUnreadCount = Object.values(chats || {}).reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0,
  );
  const currentUserUid = currentUser?.uid;
  const combinedId =
    currentUserUid > user?.uid
      ? currentUserUid + user?.uid
      : user?.uid + currentUserUid;
  const chatData = chats ? chats[combinedId] : null;
  const unreadCount = chatData?.unreadCount || 0;

  useEffect(() => {
    if (!currentUserUid) return;
    const unsub = onSnapshot(doc(db, "userChats", currentUserUid), (doc) => {
      setChats(doc.data() || {});
    });
    return () => unsub();
  }, [currentUserUid]);

  const filteredUsers =
    users?.filter((u) => {
      const matchesSearch = u.displayName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "all") return true;
      const combinedId =
        currentUserUid > u.uid
          ? currentUserUid + u.uid
          : u.uid + currentUserUid;
      return chats[combinedId]?.unreadCount > 0;
    }) || [];

  useEffect(() => {
    if (!currentUserUid) return;
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let list = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.uid !== currentUserUid) {
            list.push({ id: doc.id, ...userData });
          }
        });
        setUsers(list);
      },
      (error) => {
        console.log("Firestore Error:", error);
        toast.error("Could not load users");
      },
    );
    return () => unsub();
  }, [currentUserUid]);

  useEffect(() => {
    const timer = setTimeout(() => setImageLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const formatChatDate = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`bg-[#FFFFFF] dark:bg-[#1A1C20] md:w-[30%] flex-none border
         border-gray-200 dark:border-gray-700 lg:rounded-lg 
         w-full flex flex-col h-full overflow-auto no-scrollbar 
         ${user ? "hidden" : ""} md:block transition-colors 
         duration-300`}
    >
      <div className="py-[8px]">
        <div className="flex flex-row-reverse items-center justify-between px-3">
          <div>
            <ThemeToggle />
          </div>
          <div>
            <span className="text-[#67a8fe] text-2xl font-semibold select-none">
              Chattly.
            </span>
          </div>
        </div>
        <div className="flex items-center py-[8px] lg:px-[8px] px-[12px] justify-between rounded-full">
          {imageLoading ? (
            skeletons.map((n) => (
              <div key={n} className="flex items-center gap-[10px] p-2">
                <div className="w-[46px] h-[46px] rounded-full bg-gray-200 dark:bg-white/10 animate-pulse border border-gray-100 dark:border-white/5" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 animate-pulse rounded" />
                  <div className="h-2 w-16 bg-gray-200 dark:bg-white/10 animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : (
            <div className="relative flex gap-[8px] items-center">
              <img
                className="rounded-full h-[52px] w-[52px] object-cover"
                src={currentUser?.photoURL}
                alt=""
              />
              <div className="absolute bottom-0 left-[38px] w-2.5 h-2.5 bg-[#26C282] rounded-full border border-white dark:border-black"></div>
              <span className="text-black dark:text-white text-lg font-semibold select-none">
                {currentUser?.displayName || "User"}
              </span>
            </div>
          )}
          <button
            onClick={async () => {
              try {
                if (currentUserUid) {
                  await updateDoc(doc(db, "users", currentUserUid), {
                    isOnline: false,
                  });
                  toast.success("LoggOut Successfully");
                }
                await signOut(auth);
                navigate("/login");
              } catch (error) {
                toast.error("Logout failed!");
              }
            }}
            className="bg-gray-100 dark:bg-[#1A1C20] rounded-full h-[37px] w-[37px] flex justify-center items-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <CiLogout size={23} />
          </button>
        </div>

        <div className="p-2">
          <Search setSearchTerm={setSearchTerm} />
        </div>

        <div className="flex items-center px-4 gap-1 mb-2">
          <button
            onClick={() => setFilter("all")}
            className={`text-sm font-semibold px-3 py-1 rounded-full transition-all ${
              filter === "all"
                ? "bg-[#5F7EB8] text-white"
                : "bg-gray-200 dark:bg-[#383737] text-black dark:text-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`relative text-sm font-semibold px-3 py-1 rounded-full transition-all ${
              filter === "unread"
                ? "bg-[#5F7EB8] text-white"
                : "bg-gray-200 dark:bg-[#383737] text-black dark:text-gray-300"
            }`}
          >
            Unread{" "}
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#4184D6] text-[10px] text-white">
                {totalUnreadCount}
              </span>
            )}
          </button>
        </div>
        <div
          onClick={() => {
            dispatch(
              changeUser({
                user: {
                  uid: "global-chat",
                  displayName: "Group Chat",
                  photoURL: "talk.png",
                },
              }),
            );
            updateDoc(doc(db, "userChats", currentUserUid), {
              ["global-chat.unreadCount"]: 0,
            });
          }}
          className="overflow-x-hidden justify-between py-[12px] px-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#23242A] cursor-pointer transition-all"
        >
          <div className="relative flex items-center gap-2">
            <img
              src="talk.png"
              alt=""
              className="rounded-full h-[46px] w-[46px]"
            />

            <div className="flex flex-col">
              <span className="text-black dark:text-white font-medium text-sm">
                Group
              </span>
              <p className="dark:text-gray-400 text-black text-sm truncate w-32">
                {chats["global-chat"]?.lastMessage || "No messages yet"}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <div>
              <span className="dark:text-white text-gray-600 text-[10px]">
                {formatChatDate(chats["global-chat"]?.date)}
              </span>
            </div>
            <div>
              {chats["global-chat"]?.unreadCount > 0 && (
                <span className="bg-[#4184D6] text-white text-[10px] h-4 w-4 rounded-full flex justify-center items-center shadow-md">
                  {chats["global-chat"].unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Chats
          users={users}
          filteredUsers={filteredUsers}
          filter={filter}
          formatChatDate={formatChatDate}
        />
      </div>
    </div>
  );
};

export default Sidebar;
