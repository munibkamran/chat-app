import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { HiEyeSlash, HiOutlineEyeSlash } from "react-icons/hi2";
import toast from "react-hot-toast";
import { CgEyeAlt, CgSpinner } from "react-icons/cg";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { TbMailFilled } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !email.trim() || !password.trim()) {
      return toast.error("All fields are required!");
    }
    if (password.length <= 6)
      return toast.error("Password should be at least 6 characters");

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, {
        displayName: userName,
      });

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName: userName,
        email: email,
        photoURL: "",
        isOnline: false,
      });

      await setDoc(doc(db, "userChats", res.user.uid), {});
      setUserName("");
      setEmail("");
      setPassword("");
      toast.success("Account created!");
      setTimeout(() => {
        navigate("/avatar");
      }, 1000);
    } catch (err) {
      toast.error(`Something went wrong ${err}`);
      setError(err);
      console.log(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen flex justify-center items-center bg-[#20232D]">
        <form
          onSubmit={handleSubmit}
          className="max-w-[620px] bg-[#1A1C20] py-14 w-full h-screen md:h-fit flex flex-col justify-center items-center gap-[16px]
           md:rounded-2xl"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-start flex-col">
              <span className="select-none uppercase font-semibold text-gray-400 text-sm">
                start for free
              </span>
              <h1 className="text-white font-semibold md:text-[36px] text-[30px] select-none">
                Create an account
                <span className="text-[#67A8FE] text-[45px]">.</span>
              </h1>
            </div>
            <p
              className="text-gray-400 text-center px-8
          text-sm"
            >
              Join our community and start chatting with friends today.
            </p>
          </div>
          <div
            className={`${userName.length > 0 ? "border-[#42A5F5]" : "border-[#303541]"} transition-all border rounded-xl mt-2 flex items-center bg-[#303541ac] px-[6px] py-1.5 w-[350px]`}
          >
            <input
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-white outline-none p-[4px] w-full bg-transparent placeholder-gray-400"
              type="text"
              placeholder="Username"
            />
            <FaUserCircle className="text-gray-200" size={18} />
          </div>
          <div
            className={`${email.length > 0 ? "border-[#42A5F5]" : "border-[#303541]"} border rounded-xl flex items-center bg-[#303541ac] px-[6px] py-1.5 w-[350px]`}
          >
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-white outline-none w-full p-[4px] bg-transparent placeholder-gray-400"
              type="email"
              placeholder="Email"
            />
            <TbMailFilled className="text-gray-200" size={18} />
          </div>
          <div
            className={`${password.length > 0 ? "border-[#42A5F5]" : "border-[#303541]"} border rounded-xl flex items-center bg-[#303541ac] px-[6px] py-1.5 w-[350px]`}
          >
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-white outline-none w-full p-[4px] bg-transparent placeholder-gray-400"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
            <div onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <CgEyeAlt className="text-gray-200" size={18} />
              ) : (
                <HiEyeSlash className="text-gray-200" size={18} />
              )}
            </div>
          </div>
          <button
            disabled={loading}
            className={`${userName.length > 0 && email.length > 0 && password.length > 6 ? "bg-[#42A5F5]" : "border-[#42A5F5]"} text-white flex items-center justify-center gap-2 text-sm py-[10px]
             rounded-full w-[350px] md:w-[250px] mt-[10px] border border-[#42A5F5] font-semibold transition-all`}
          >
            {loading ? (
              <>
                <CgSpinner size={20} className="animate-spin" />{" "}
                <span>Creating Account...</span>
              </>
            ) : (
              <span
                className={`${
                  userName.length > 0 && email.length > 0 && password.length > 6
                    ? ""
                    : "text-white"
                }`}
              >
                Create account
              </span>
            )}
          </button>
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-white text-sm cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;
