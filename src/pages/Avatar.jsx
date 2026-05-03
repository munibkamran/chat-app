import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { GoArrowRight } from "react-icons/go";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc, setDoc } from "firebase/firestore";

const Avatar = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [imageLoading, setImageLoading] = useState(true);
  const avatars = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Taylor&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Charlie&backgroundColor=e5e7eb",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aiden&backgroundColor=c1f2e8",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=b3c7f7",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=ffcfb3",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Maya&backgroundColor=e2d1f9",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=d4e4bc",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/pixel-art/svg?seed=Jordan",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Taylor",
  ];

  const handleSetAvatar = async () => {
    if (selectedAvatar === null) return toast.error("Please select an avatar!");
    const user = auth.currentUser;
    if (!user) return toast.error("No user logged in!");
    setLoading(true);
    try {
      const avatarUrl = avatars[selectedAvatar];

      await updateProfile(user, { photoURL: avatarUrl });

      await setDoc(
        doc(db, "users", user.uid),
        {
          photoURL: avatarUrl,
        },
        { merge: true },
      );

      toast.success("Profile updated!");
      navigate("/");
    } catch (err) {
      toast.error(`Something went wrong ${err}`);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setImageLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        backgroundImage: `url('back3.jpg')`,
      }}
      className="overflow-hidden h-screen w-full flex justify-center items-center  bg-cover bg-center bg-no-repeat"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/10 overflow-hidden w-full h-screen backdrop-blur-sm px-[4px] border border-white/10 flex flex-col justify-center items-center"
      >
        <h1 className="text-white text-2xl font-poppins mb-8 select-none">
          Pick your avatar
        </h1>

        <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-5">
          {imageLoading
            ? [1, 2, 3, 4, 5].map((skeleton) => (
                <div
                  key={skeleton}
                  className="w-20 h-20 rounded-full bg-white/10 animate-pulse flex-shrink-0 border border-white/5"
                />
              ))
            : avatars.map((url, index) => (
                <motion.img
                  whileHover={{
                    scale: 1.15,
                    filter: "brightness(1.1)",
                  }}
                  key={index}
                  src={url}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(index)}
                  className={`w-20 h-20 rounded-full cursor-pointer transition-all duration-300 border-4 ${
                    selectedAvatar === index
                      ? "border-blue-950 scale-110"
                      : "border-transparent opacity-70"
                  }`}
                />
              ))}
        </div>

        <button
          onClick={handleSetAvatar}
          disabled={loading}
          className="bg-transparent flex items-center gap-[10px] backdrop-blur-sm border border-white text-white px-8 py-2 font-semibold transition-all"
        >
          {loading ? "Saving..." : "Next"}
          <GoArrowRight size={22} />
        </button>
      </motion.div>
    </div>
  );
};

export default Avatar;
