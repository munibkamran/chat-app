import React from "react";
import { CiSearch } from "react-icons/ci";

const Search = ({ filteredUsers, setSearchTerm }) => {
  return (
    <form className="dark:bg-[#23242A] bg-[#F3F5F9] backdrop-blur-sm max-w-[335px] mx-auto dark:text-white text-black w-full py-[10px] px-[10px] rounded-full flex items-center gap-1">
      <CiSearch size={22} className="dark:text-white text-gray-500" />
      <input
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
        placeholder="Search user or chat"
        className="bg-transparent outline-none w-full placeholder-[bg-[#F4F6FA]] dark:placeholder-[#585757]"
      />
    </form>
  );
};

export default Search;
