import React, { useEffect, useState } from 'react'
import Home from './pages/Home'
import { Navigate, Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import { useNavigate } from 'react-router-dom'
import Avatar from './pages/Avatar'
import { Toaster } from 'react-hot-toast'
import { motion,AnimatePresence } from 'framer-motion'
import { CgSpinner } from "react-icons/cg";
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { useSelector } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
const App = () => {
  const { currentUser } = useSelector((state) => state.chat)
  const [appLoading, setAppLoading] = useState(true)
  const { mode } = useSelector((state) => state.theme)
  const ProtectedRoute = ({ children }) => {
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};
 
 useEffect(() => {
   const timer = setTimeout(() => {
     setAppLoading(false)
    },2000)
    return () => clearTimeout(timer)
  }, [])
  
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { isOnline: true });
      const handleTabClose = async () => {
        await updateDoc(userRef, { isOnline: false });
      };
      window.addEventListener("beforeunload", handleTabClose);
      return () => {
        window.removeEventListener("beforeunload", handleTabClose);
      };
    }
  });

  return () => unsub();
}, []);
  
  useEffect(() => {
    const root = window.document.documentElement
    if(mode === "dark"){
      root.classList.add("dark")
  }else{
    root.classList.remove("dark")
  }
 }, [mode])
 

//  if(appLoading) return <div className="loading-spinner">Loading...</div>;

  return (
    <>
      <Toaster />
      <AnimatePresence>
        {appLoading ? (
          <motion.div
           style={{
          backgroundColor: "#1A1C20"
        }}
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-cover bg-center bg-no-repeat fixed inset-0 z-[9999] flex flex-col justify-center items-center bg-white/10 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-blue-500"
            >
              <CgSpinner size={60}/>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white mt-6 font-poppins tracking-[4px] text-sm uppercase opacity-80"
            >
              Loading....
            </motion.h2>
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className='bg-white dark:bg-[#1A1C20]'
          >
              <Routes>
                <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute> } />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/avatar' element={<Avatar />} />
              </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
