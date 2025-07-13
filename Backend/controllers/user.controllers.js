import User from "../models/user.model.js";
import uploadOncloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId; 
        const user = await User.findById(userId).select("-password"); 
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching current user:", error);
        return res.status(400).json({ message: "get current user error" });
    }
}

export const updateAssistant=async(req,res)=>{
    try{
        const {assistantName,imageUrl}=req.body
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOncloudinary(req,file.path)
        }
        else{
            assistantImage=imageUrl;
        }

        const user=await User.findByIdAndUpdate(req.userId,{
            assistantName,assistantImage
        },{new:true}).select("-password")

        return res.status(200).json(user)
    } catch(error){
        return res.status(400).json({ message: "Update Assistant error" });
    }
}

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;
        const user = await User.findById(req.userId);
        user.history.push(command)
        user.save()
        const userName = user.name;
        const assistantName = user.assistantName;
        const result = await geminiResponse(command, assistantName, userName);

        const jsonMatch = result.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.status(400).json({ response: "sorry,I can't understand" });
        }
        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type.toLowerCase().trim();

        switch(type) {
            case 'get-date':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `current date is ${moment().format("YYYY-MM-DD")}`
                });
            case 'get-time':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `current time is ${moment().format("hh:mm:A")}`
                });
            case 'get-day':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format("dddd")}`
                });
            case 'get-month':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Current month is ${moment().format("MMMM")}`
                });
            // Group the types that can directly return gemResult.response
            case 'general':
            case 'google-search':
            case 'youtube-search':
            case 'youtube-play':
            case 'calculator-open':
            case 'instagram-open':
            case 'linkedin-open':
            case 'facebook-open':
            case 'weather-show':
            case 'wikipedia-search':
            case 'news-search':
            case 'translate':
            case 'definition-lookup':
            case 'reminder-set':
            case 'alarm-set':
            case 'currency-conversion':
            case 'unit-conversion':
            case 'joke':
            case 'quote':
            case 'recipe-search':
            case 'sports-score':
            case 'stock-quote':
            case 'email-send':
            case 'calendar-event':
            case 'music-recommendation':
            case 'traffic-update':
            case 'home-automation':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response
                });
            default:
                if(gemResult.response) {
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response: gemResult.response
                    });
                }
                return res.status(400).json({ response: "I didn't understand that command." });
        }
    } catch(error) {
        return res.status(500).json({ response: "ask assistant error" });
    }
}