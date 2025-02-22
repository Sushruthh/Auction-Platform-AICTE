import { config } from "dotenv";
import express from "express";
import cors from "cors";    
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

const app = express();  // Create an express app object
config({
    path: "./config/config.env"
})

app.use(
    cors({  // Use the cors middleware to allow requests from the frontend
        origin: [process.env.FRONTEND_URL],  
        methods: ["POST", "GET", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(cookieParser()); // Use the cookie-parser middleware to parse cookies
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(
    fileUpload({
        useTempFiles : true,
        tempFileDir: "/tmp/",
    })
);

export default app;  // Export the app object