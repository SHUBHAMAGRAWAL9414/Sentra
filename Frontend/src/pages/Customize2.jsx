import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext';
import axios from "axios"
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const Customize2 = () => {
    const {userData,setUserData,backendImage,selectedImage,serverUrl}=useContext(userDataContext);
    const [assistantName,setAssistantName]=useState(userData?.assistantName || "");
    const [loading,setLoading]=useState(false);
    const navigate=useNavigate();

    const handleUpdateAssistant=async()=>{
      setLoading(true)
      try{
        let formData=new FormData()
        formData.append("assistantName",assistantName)
        if(backendImage){
          formData.append("assistantImage",backendImage)
        } else{
          formData.append("imageUrl",selectedImage)
        }
        const result=await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true})
        setLoading(false)
        console.log(result.data)
        setUserData(result.data)
        navigate("/")
      }
      catch(error){
        setLoading(false)
        console.log(error)
      }
    }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative'>
      <MdKeyboardBackspace className='absolute text-white top-[30px] left-[30px] h-[25px] w-[25px] cursor-pointer' onClick={()=>navigate("/customize")}/>
      <h1 className='text-white text-[30px] text-center mb-[40px]'>Enter Your <span className='text-blue-200'>Assistant Name</span></h1>

      <input type="text" placeholder="eg. Anshu" className=' max-w-[600px] w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]' required onChange={(e)=>setAssistantName(e.target.value)} value={assistantName}/>
      {assistantName && <button className='min-w-[300px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] mt-[30px] cursor-pointer'disabled={loading} onClick={()=>{handleUpdateAssistant()}}>{!loading?"Finally Create Your Assistant":"Loading..."}</button>}
    </div>
  )
}

export default Customize2
