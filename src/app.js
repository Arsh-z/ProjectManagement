import express from "express";
import cors from "cors";
//import { registerUser } from "./controllers/auth.controller.js";
import cookieParser from "cookie-parser";
const app = express(); 

//basic configuration

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());



//cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "patch", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    
    
}),
);

//import routes 
//import router from "./routes/healthcheck.route.js";
import healthCheckRouter  from "./routes/auth.routes.js";
import authRouter from "./routes/auth.routes.js"
//import projectRouter from "./routes/project.routes.js"
//import projectRouter from "./routes/project.routes.js";

//app.use("api/v1/projects", projectRouter);
app.use("api/v1/healthcheck", healthCheckRouter);
app.use("api/v1/auth", authRouter);
//app.use("api/v1/projects", projectRouter);

//app.post('/register',registerUser)

app.get('/', (req, res) => {
  res.send('welcome to base campy')
})




export default app;

