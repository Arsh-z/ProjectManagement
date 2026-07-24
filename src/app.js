import express from "express";
import cors from "cors";
const app = express(); 

//basic configuration

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));


//cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "patch", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    
    
}),
);

//import routes 
import router from "./routes/healthcheck.route.js";

app.use("api/v1/healthcheck", router);

app.get('/', (req, res) => {
  res.send('welcome to base campy')
})

app.get('/health', (req, res) => {
  res.send("hello from arsh")
})


export default app;

