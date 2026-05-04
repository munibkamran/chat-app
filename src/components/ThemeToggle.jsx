import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineLightMode } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";
import { toggleTheme } from "../redux/themeSlice";
import { RiMoonClearLine } from "react-icons/ri";
import { GoSun } from "react-icons/go";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const themes = [
    { id: "light", icon: <GoSun size={18} />, label: "Light" },
    { id: "dark", icon: <RiMoonClearLine size={18} />, label: "Dark" },
  ];
  return (
    <div className="flex items-center gap-1 p-0.5 bg-gray-50 dark:bg-[#2A2D35] rounded-full border border-gray-200 dark:border-gray-700 w-fit transition-all duration-300 shadow-sm mb-4 ml-2">
      {themes.map((t) => (
        <button
        type="button"
          key={t.id}
          onClick={() => dispatch(toggleTheme(t.id))}
          title={t.label}
          className={`relative w-[25px] h-[25px] rounded-full transition-all duration-300 flex items-center justify-center ${
            mode === t.id
              ? "bg-white dark:bg-[#364153] text-[#4183D8] border dark:border-gray-500 dark:text-white shadow-md"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          {t.icon}

          {mode === t.id && (
            <span className="absolute -bottom-1 w-1 h-1 bg-current rounded-full opacity-50"></span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
