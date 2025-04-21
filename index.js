import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const users = {}; 

io.on("connection", (socket) => {
    console.log("New frontend connected:", socket.id);

    socket.on("myEmail", (email) => {
        if (!email) {
            console.error("Email is required.");
            return;
        }
        console.log("User registered with email:", email);
        users[email] = socket.id; 
        socket.email = email;
        socket.emit("email-registered", { message: "Email registered successfully." });
    });


    socket.on("screen-data", ({ pEmail, data }) => {
        const targetSocketId = users[pEmail];
        if (targetSocketId) {
            io.to(targetSocketId).emit("screen-data", data); 
            socket.emit("connected-to-partner"); 
        } else {
            console.log("Target user not found:", pEmail);
            socket.emit("partner-not-found", { message: "Partner not found." });
        }
    });

    socket.on("disconnect", () => {
        const email = socket.email; 
        if (email) {
            console.log(`User disconnected: ${email}`);
            delete users[email]; 
            io.emit("user-disconnected", { email }); 
        }
    });
});

app.get("/", (req, res) => {
    res.send("Server running");
});


// server.listen(8080, () => console.log("Server running on http://localhost:8080"));
server.listen(8787, "23.98.93.20", () => {
    console.log("Server running on http://23.98.93.20:8787");
});


export default app;