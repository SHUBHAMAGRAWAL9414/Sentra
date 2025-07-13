/*eslint-disable*/
import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const { userData, setUserData, serverUrl, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
      console.log(result.data);
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    if(!isRecognizingRef.current && !isSpeakingRef.current){
      try {
        recognitionRef.current?.start();
      } catch (error) {
      if (error.name !=="InvalidStateError") {
        console.error("Recognition error:", error);
      }
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices();
    // Find a Hindi voice first; fallback to an English voice if needed.
    const hindiVoice = voices.find(v => v.lang==='hi');
    if(hindiVoice){
      utterance.voice=hindiVoice;
    }
    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(()=>{
        startRecognition();
      },800);
    }
      synth.cancel();
      synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    } else if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    } else if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    } else if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    } else if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    } else if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    } else if (type === 'linkedin-open') {
      window.open(`https://www.linkedin.com/`, '_blank');
    } else if (type === 'wikipedia-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://en.wikipedia.org/wiki/Special:Search?search=${query}`, '_blank');
    } else if (type === 'news-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://news.google.com/search?q=${query}`, '_blank');
    } else if (type === 'translate') {
      window.open(`https://translate.google.com/`, '_blank');
    } else if (type === 'definition-lookup') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.dictionary.com/browse/${query}`, '_blank');
    } else if (type === 'reminder-set' || type === 'alarm-set') {
      alert(`Reminder/Alarm feature is not implemented yet.`);
    } else if (type === 'currency-conversion' || type === 'unit-conversion') {
      const query = encodeURIComponent(userInput);
      const searchTerm = type === 'currency-conversion' ? "currency conversion" : "unit conversion";
      window.open(`https://www.google.com/search?q=${searchTerm}+${query}`, '_blank');
    } else if (type === 'joke' || type === 'quote') {
      // Simply speak the answer.
    } else if (type === 'recipe-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.allrecipes.com/search/results/?wt=${query}`, '_blank');
    } else if (type === 'sports-score') {
      window.open(`https://www.espn.com/`, '_blank');
    } else if (type === 'stock-quote') {
      window.open(`https://www.google.com/finance`, '_blank');
    } else if (type === 'email-send') {
      window.open(`https://mail.google.com/`, '_blank');
    } else if (type === 'calendar-event') {
      window.open(`https://calendar.google.com/`, '_blank');
    } else if (type === 'music-recommendation') {
      window.open(`https://open.spotify.com/`, '_blank');
    } else if (type === 'traffic-update') {
      window.open(`https://www.google.com/maps`, '_blank');
    } else if (type === 'home-automation') {
      alert(`Home automation feature is not implemented yet.`);
    } else {
      console.log("Unhandled command type:", type);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults=false;

    recognitionRef.current = recognition;

    let isMounted=true;

    const startTimeout=setTimeout(()=>{
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
        try{
          recognition.start();
          console.log("Recognition requested to start");
        } catch(e){
          if(e.name !=="InvalidStateError"){
            console.error(e);
          }
        }
      }
    },1000);

    recognition.onstart=()=>{
      isRecognizingRef.current=true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if(isMounted){
            try{
              recognition.start();
              console.log("Recognition restarted");
            } catch(e){
              if(e.name !=="InvalidStateError"){
                console.error(e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !=="aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if(isMounted){
            try{
              recognition.start();
              console.log("Recognition restarted after error")
            } catch(e){
              if(e.name !=="InvalidStateError"){
                console.error(e);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      // Check if the transcript contains the assistant name, then process the command.
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
          handleCommand(data);
          setAiText(data.response);
          setUserText("");
        }
    };

      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`); 
      greeting.lang = 'hi-IN'; 
      window.speechSynthesis.speak(greeting); 


    return () => {
      isMounted=false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
        <button className='min-w-[150px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] cursor-pointer' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[150px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] px-[20px] py-[10px] cursor-pointer' onClick={() => navigate("/customize")}>Customize your Assistant</button>
        <div className='w-full h-[2px] bg-gray-400 '></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData.history ? userData.history.map((his, index) => (
            <div key={index} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
          )) : null}
        </div>
      </div>
      <button className='min-w-[150px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] mt-[30px] absolute hidden lg:block top-[20px] right-[20px] cursor-pointer'
        onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] bg-white rounded-full font-semibold text-black text-[19px] mt-[30px] hidden lg:block absolute top-[100px] right-[20px] px-[20px] py-[10px] cursor-pointer'
        onClick={() => navigate("/customize")}>Customize your Assistant</button>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} className='h-full object-cover' alt="Assistant" />
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} className='w-[200px]' alt="User" />}
      {aiText && <img src={aiImg} className='w-[200px]' alt="Ai" />}
      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText || aiText || null}</h1>
    </div>
  );
};

export default Home;
