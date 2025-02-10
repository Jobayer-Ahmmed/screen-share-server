import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import shortid from "shortid";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const users = {}; // Store user IDs and socket connections

io.on("connection", (socket) => {
    const userId = shortid.generate();
    users[userId] = socket.id;

    console.log(`✅ New frontend connected: ${userId}`);
    socket.emit("your-id", userId);

    socket.on("screen-data", ({ id, data }) => {
        const targetSocketId = users[id];
        if (targetSocketId) {
            io.to(targetSocketId).emit("screen-data", data);
        }
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${userId}`);
        delete users[userId];
    });
});

// Required for Vercel
export default app;

app.get("/", (req, res) => {
    res.send("Server running");
});
server.listen(8080, () => console.log("🚀 Server running on http://localhost:8080"));
