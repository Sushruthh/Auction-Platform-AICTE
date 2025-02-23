import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import {v2 as cloudinary} from "cloudinary";

export const register = async(req,res,next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Profile image required", 400))
    }

    const {profileImage} = req.files; 

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats.includes(profileImage.mimetype)){
        return next(new ErrorHandler("File format not supported", 400));
    }


    const {
        userName,
        email,
        password, 
        phone, 
        address, 
        role, 
        bankAccountNumber, 
        bankAccountName,
        bankName,
        upiID,
        paypalEmail,
    } = req.body;

    if(!userName || !email || !phone || !password || !address || !role){
        return next(new ErrorHandler("Please fill all the details", 400));
    }
    if(role === "Auctioneer"){
        if(!bankAccountName || !bankAccountNumber || !bankName){
            return next(new ErrorHandler("Please complete all the bank details", 400));
        }
        if(!upiID){
            return next(new ErrorHandler("Please provide your UPI ID", 400));
        }
        if(!paypalEmail){
            return next(new ErrorHandler("Please provide your PayPal email", 400));
        }
    }
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler("User already registered", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        profileImage.tempFilePath, {
            folder : "MERN_AUCTION_PLATFORM_USERS",
        }
    );
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown cloudinary error");
        return next(new ErrorHandler("Failed to upload profile image to cloudinary", 500));
    }

    const user = await User.create({
        userName,
        email,
        password, 
        phone, 
        address, 
        role,
        profileImage : {
            public_id : cloudinaryResponse.public_id,
            url : cloudinaryResponse.secure_url,
        },
        paymentMethods : {
            bankTransfer : {
                bankAccountNumber,
                bankAccountName,
                bankName,
            },
            UPI : {
                upiID,
            },
            paypal : {
                paypalEmail,
            },
        },
    });
    res.status(201).json({
        success : true,
        message : "User Registered",
    });
};