import React, {useState} from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ChatContainer from '../components/ChatContainer.jsx'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext.jsx'

const HomePage = () => {
   const {selectedUser} = useContext(ChatContext)
  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%] '>
        <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative
            ${selectedUser ? 'md:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr-2fr]' : 'md:grid-cols-2'}`}>
            <Sidebar />
            <ChatContainer/>
            
        </div>
    </div>
  )
}

export default HomePage