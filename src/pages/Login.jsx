import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoEyeOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { ImSpinner3 } from "react-icons/im";
import { CgEyeAlt, CgSpinner } from "react-icons/cg";
import { TbMailFilled } from "react-icons/tb";
import { HiEyeSlash } from "react-icons/hi2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return toast.error("All fields are required!");
    }
    if (password.length <= 6)
      return toast.error("Password should be at least 6 characters");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        toast.error("Invalid email or password!");
      } else if (err.code === "auth/wrong-password") {
        toast.error("Wrong password!");
      } else {
        toast.error("Login failed! please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="flex justify-center items-center h-screen bg-[#20232D]">
        <form
          onSubmit={handleLogin}
          className="h-screen w-screen md:rounded-2xl max-w-[600px] md:h-[380px] bg-[#1A1C20] p-2 flex flex-col justify-center items-center gap-[16px]"
        >
          <div className="flex items-center flex-col">
            <h1 className="text-white font-semibold md:text-[32px] text-[30px] select-none">
              Welcome Back<span className="text-[#67A8FE] text-[45px]">.</span>
            </h1>
            <p
              className="text-gray-400 text-center px-8
          text-sm"
            >
              Glad to see you again! Log in to continue your conversations.
            </p>
          </div>
          <div
            className={`${email.length > 0 ? "border-[#42A5F5]" : "border-[#303541]"} border rounded-xl flex items-center bg-[#303541ac] px-[6px] py-1.5 w-[350px] transition-all mt-2`}
          >
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="outline-none w-full p-[4px] bg-transparent placeholder-gray-400 text-white"
              type="email"
              placeholder="Email"
            />
            <TbMailFilled className="text-gray-200" size={18} />
          </div>
          <div
            className={`${password.length > 0 ? "border-[#42A5F5]" : "border-[#303541]"} border rounded-xl flex items-center bg-[#303541ac] px-[6px] py-1.5 w-[350px] transition-all`}
          >
            <input
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="outline-none w-full p-[4px] bg-transparent placeholder-gray-400 text-white"
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
            className={`${email.length > 0 && password.length > 6 ? "bg-[#42A5F5]" : "border-[#42A5F5]"} text-white flex items-center justify-center gap-2 text-sm py-[10px]
             rounded-full md:w-[250px] w-[350px] mt-[10px] border border-[#42A5F5] font-semibold transition-all`}
          >
            {loading ? (
              <>
                <CgSpinner size={20} className="animate-spin" />{" "}
                <span>Finding Account...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-white text-sm cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
