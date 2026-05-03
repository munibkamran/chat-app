import React from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

const Home = () => {
  return (
    <div className="w-full bg-[#F4F6FA] dark:bg-[#20232D] flex justify-between h-[100vh] overflow-hidden lg:p-4">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default Home;
