import dotenv from "dotenv";

import app from "./app.js";

import connectDB from "./db/index.js";

dotenv.config();


 
const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        try {
            app.listen(port, () => {
                console.log(`Example app listening on port http://localhost:${port}`);
            })
        } catch (error) {
            console.error("Error starting the server:", error);
            process.exit(1);
        }
        
    })



