import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// URL to keep alive and reload interval
const url = `https://realtime-codeeditor-collaborative.onrender.com`;
const interval = 30000;

// Periodically send a GET request to keep the site awake
function reloadWebsite() {
  axios.get(url).then(() => {
    console.log("website reloded");
  }).catch((error) => {
    console.error(`Error : ${error.message}`);
  });
}
setInterval(reloadWebsite, interval);

// Setup Socket.IO server with CORS enabled
const io = new Server(server, {
  cors: { origin: "*" },
});

// Map to track rooms and their users
const rooms = new Map();
// Map to store current code and language for each room
const roomStates = new Map();

// Default starter code for different languages
const defaultCode = {
  javascript: "// Welcome to JavaScript!\nconsole.log('Hello, World!');",
  python: "# Welcome to Python!\nprint('Hello, World!')",
  java: "// Welcome to Java!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
  cpp: "// Welcome to C++!\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}",
  c: "// Welcome to C!\n#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
  go: "// Welcome to Go!\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
  rust: "// Welcome to Rust!\nfn main() {\n    println!(\"Hello, World!\");\n}",
  typescript: "// Welcome to TypeScript!\nconsole.log('Hello, World!');"
};

// Handle socket connections and events
io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  // User joins a room
  socket.on("join", ({ roomId, userName }) => {
    if (!roomId || !userName || typeof userName !== 'string') return;
    
    // Leave previous room if any
    if (currentRoom && rooms.has(currentRoom)) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    
    currentRoom = roomId;
    currentUser = userName;
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      roomStates.set(roomId, {
        code: defaultCode.javascript,
        language: "javascript"
      });
    }
    
    // Add user to room (remove if already present to handle reconnections)
    rooms.get(roomId).delete(userName);
    rooms.get(roomId).add(userName);
    
    // Send current room state to the new user
    const roomState = roomStates.get(roomId);
    console.log(`Sending current state to ${userName} in room ${roomId}:`, {
      codeLength: roomState.code.length,
      language: roomState.language
    });
    socket.emit("codeUpdate", roomState.code);
    socket.emit("languageUpdate", roomState.language);
    
    // Notify all users in room about updated user list
    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId)));
  });

  // Broadcast code changes
  socket.on("codeChange", ({ roomId, code }) => {
    // Update room state with current code
    if (roomStates.has(roomId)) {
      roomStates.get(roomId).code = code;
      console.log(`Code updated in room ${roomId}, length: ${code.length}`);
    }
    // Broadcast to other users in the room
    socket.to(roomId).emit("codeUpdate", code);
  });

  // User leaves room
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(currentUser);
      
      // Clean up empty rooms
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
        roomStates.delete(currentRoom);
      } else {
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }
      
      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  // Notify when user is typing
  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  // Broadcast language change
  socket.on("languageChange", ({ roomId, language }) => {
    // Update room state with current language and reset code
    if (roomStates.has(roomId)) {
      const newCode = defaultCode[language] || defaultCode.javascript;
      roomStates.get(roomId).language = language;
      roomStates.get(roomId).code = newCode;
      
      console.log(`Language changed to ${language} in room ${roomId}, code reset`);
      
      // Broadcast language and new code to all users in the room
      io.to(roomId).emit("languageUpdate", language);
      io.to(roomId).emit("codeUpdate", newCode);
    }
  });

  // Compile and run code via external API
  socket.on("compileCode", async ({ code, roomId, language, version }) => {
    if (rooms.has(roomId)) {
      try {
        const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
          language,
          version,
          files: [{ content: code }],
        });
        io.to(roomId).emit("codeResponse", response.data);
      } catch (error) {
        io.to(roomId).emit("codeResponse", { error: error.message });
      }
    }
  });

  // Handle user disconnect
  socket.on("disconnect", (reason) => {
    if (currentRoom && currentUser && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(currentUser);
      
      // Clean up empty rooms
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
        roomStates.delete(currentRoom);
      } else {
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }
    }
  });
});

// Serve static frontend files and handle all other routes
const port = process.env.PORT || 5000;
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Start server
server.listen(port, () => {
  console.log("server is working on port 5000");
});
