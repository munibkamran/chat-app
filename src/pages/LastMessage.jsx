import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";

const LastMessage = ({ chatId }) => {
  const [lastMsg, setLastMsg] = useState("");

  useEffect(() => {
    const docRef = doc(db, "chats", chatId);

    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.messages && data.messages.length > 0) {
          const last = data.messages[data.messages.length - 1];
          setLastMsg(last.text);
        } else {
          setLastMsg("No messages yet");
        }
      } else {
        setLastMsg("No messages yet");
      }
    });

    return () => unsub();
  }, [chatId]);

  return (
    <div>
      <p className="text-sm text-gray-400 truncate w-32">
        {lastMsg || "No messages yet"}
      </p>
    </div>
  );
};

export default LastMessage;
