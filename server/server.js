import express from "express";
import "dotenv/config";
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Create http app and express server
const app = express();
const server = http.createServer(app) //the socket.io support this http server

//Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {}; //in this object we will store the data of all online users we will store data in the form of userid and socketid  {userId: socketId}

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected client
    io.emit("getOnlineUser", Object.keys(userSocketMap))


    socket.on("disconnect", ()=> {
   console.log("User disconnected", userId);
   delete userSocketMap[userId];
   io.emit("getOnlineUser", Object.keys(userSocketMap));
});

} )

//Middleware setup
app.use(express.json({limit: "4mb"})); //it will to to upload image max 4mb
app.use(cors()) //it will all the packet to connect our url

// Routes setup
app.use("/api/status", (req, res)=> res.send("Server is live"))   //we check were our backend server run or not
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)

// Connect to Mongodb
await connectDB()

const PORT = process.env.PORT  || 5000
server.listen(PORT,  ()=> console.log("Server is running on PORT:" +PORT) )


server.on('error', (err) => {
    console.error("Full server error:", err);
    process.exit(1);
});
