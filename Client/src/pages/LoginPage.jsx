import React from 'react'
import assets from '../assets/assets'
import { useState } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'

const LoginPage = () => {
    const [currState, SetcurrState] = useState("Sign up")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [bio, setBio] = useState("")
    const [isDataSubmitted, setIsDataSubmitted] = useState(false)
        
    const {login} = useContext(AuthContext)

    const onSubmitHandler=(event) =>{
        event.preventDefault();

        if(currState === "Sign up" && !isDataSubmitted){
            setIsDataSubmitted(true)
            return;
        }
        login(currState==="Sign up" ? "signup" : "login", {fullName,email,password, bio})
    }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-content gap-8 
    sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
        {/* Left */}
       <div className="flex flex-col items-center">
             <img src={assets.chat_icon} alt="" className="w-[min(30vw,250px)]" />
             <h2 className="text-white text-3xl font-semibold mt-2">Connective</h2>
        </div>
        {/* Right */}
        <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
            <h2 className='font-medium text-2xl flex justify-between items-center'>
                {currState}
                {isDataSubmitted && <img onClick={()=> setIsDataSubmitted(false)} 
                src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>
                }
                </h2>
               { currState==="Sign up" && !isDataSubmitted && (
                <input 
                onChange={(e)=> setFullName(e.target.value)} value={fullName}
                type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' 
                placeholder='Full Name' required />
               )}
                {!isDataSubmitted &&(
                    <>
                    <input 
                    onChange={(e)=>setEmail(e.target.value)} value={email}
                    type="email" placeholder='Email-id' required className='p-2 border border-gray-500 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500'/>

                     <input 
                    onChange={(e)=>setPassword(e.target.value)} value={password}
                    type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
                    </>
                    
                )}
                {

                    currState==="Sign up" && isDataSubmitted && (
                        <textarea onChange={(e)=>setBio(e.target.value)}value={bio}
                        rows={4} className='p-2 border border-gray-500 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500'placeholder='provide a short bio ...' required></textarea>
                    )
                }
                <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                    {currState==="Sign up" ? "Create Account" : " Login Now"}
                </button>

                <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <input type="checkbox" />
                    <p>Agree to terms of use and privacy policy</p>
                </div>

                <div className='flex flex-col gap-2'>
                    {currState==="Sign up" ? (
                        <p className='text-sm text-gray-600'>Already have an Account <span onClick={()=> {SetcurrState("Login"); 
                            setIsDataSubmitted(false)}}
                        className='font-medium text-violet-500 cursor-pointer'>Login Here</span></p>
                    ) : (
                        <p className='text-sm text-gray-600'>Create an Account <span onClick={()=>{SetcurrState("Sign up");}}
                        className='font-medium text-violet-500 cursor-pointer'>Click Here</span></p>
                    )}
                </div>
        </form>
    </div>
  )
}

export default LoginPage