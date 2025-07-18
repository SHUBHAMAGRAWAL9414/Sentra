import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const uploadOncloudinary=async(filePath)=>{

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try{
        const uploadResult = await cloudinary.uploader.upload(filePath)
        fs.unlinkSync(filePath); // Delete the file after upload
        return uploadResult.secure_url; // Return the URL of the uploaded image
    } catch(error){
        fs.unlinkSync(filePath);
        return res.status(500).json({ message: "cloudinary error"});
    }
}
export default uploadOncloudinary;