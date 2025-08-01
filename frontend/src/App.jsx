import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

// Define socket URL depending on environment (localhost for dev, production URL otherwise)
const socketUrl = window.location.hostname === 'localhost' 
  ? "http://localhost:5000" 
  : "https://realtime-codeeditor-collaborative.onrender.com";

// Initialize socket with reconnection options
const socket = io(socketUrl, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

const App = () => {
  // State variables for user, room, code, language, users list, typing status, output, and connection status
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Welcome to JavaScript!\nconsole.log('Hello, World!');");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [outPut, setOutPut] = useState("");
  const [version, setVersion] = useState("*");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Setup socket event listeners on component mount
  useEffect(() => {
    setIsConnected(socket.connected);

    socket.on("connect", () => {
      setIsConnected(true);

      // Rejoin room automatically if already joined before a disconnect
      if (joined && roomId && userName) {
        socket.emit("join", { roomId, userName });
      }
    });

    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", () => setIsConnected(false));

    // Update the list of users in the room
    socket.on("userJoined", (users) => setUsers(users));

    // Update code editor with changes from other users
    socket.on("codeUpdate", (newCode) => setCode(newCode));

    // Show typing indicator for other users
    socket.on("userTyping", (user) => {
      if (user && user !== userName) {
        setTyping(`⌨️ ${user.slice(0, 10)}... is typing`);
        setTimeout(() => setTyping(""), 3000);
      }
    });

    // Update language selection when changed by users
    socket.on("languageUpdate", (newLanguage) => setLanguage(newLanguage));

    // Display output of compiled/executed code
    socket.on("codeResponse", (response) => setOutPut(response.run.output));

    // Cleanup event listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
      socket.off("codeResponse");
    };
  }, []);

  // Notify server when user unloads or closes tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Join room with room ID and username
  const joinRoom = () => {
    if (roomId && userName) {
      if (!socket.connected) {
        // Wait for socket to connect before joining
        socket.on("connect", () => {
          socket.emit("join", { roomId, userName });
          socket.off("connect");
        });
      } else {
        socket.emit("join", { roomId, userName });
      }
      setJoined(true);
    }
  };

  // Leave the current room and reset state
  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// Welcome to JavaScript!\nconsole.log('Hello, World!');");
    setLanguage("javascript");
  };

  // Copy room ID to clipboard with feedback
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  // Handle code changes and emit updates and typing event to server
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  // Handle language selection change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  // Trigger code execution request via socket
  const runCode = () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setOutPut("🔄 Executing code...");
    socket.emit("compileCode", { code, roomId, language, version });
  };

  // Render join room form if not joined yet
  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>🚀 Join Code Room</h1>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && userName && joinRoom()}
          />
          <input
            type="text"
            placeholder="Enter Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && roomId && joinRoom()}
          />
          <button 
            onClick={joinRoom}
            disabled={!roomId || !userName}
            style={{
              opacity: (!roomId || !userName) ? 0.6 : 1,
              cursor: (!roomId || !userName) ? 'not-allowed' : 'pointer'
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  // Render collaborative editor UI after joining a room
  return (
    <div className="editor-container">
      <div className="sidebar">
        <div className="room-info">
          <div>
            <h2>Code Room: {roomId}</h2>
            <p className={`connection-status ${isConnected ? '' : 'connecting'}`} 
               style={{
                 fontSize: '12px', 
                 color: isConnected ? '#2ecc71' : '#e74c3c',
                 backgroundColor: isConnected ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                 border: `1px solid ${isConnected ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
               }}>
              {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
            </p>
          </div>
          <div>
            <button onClick={copyRoomId} className="copy-button">
              Copy Room ID
            </button>
            {copySuccess && <div className="copy-success">{copySuccess}</div>}
          </div>
        </div>
        <h3>👥 Users in Room ({users.length})</h3>
        <ul>
          {users.length === 0 ? (
            <li style={{color: '#7f8c8d', fontStyle: 'italic', textAlign: 'center'}}>
              Waiting for users to join...
            </li>
          ) : (
            users.filter(user => user && typeof user === 'string').map((user, index) => (
              <li key={index} title={user}>
                👤 {user.length > 10 ? user.slice(0, 10) + "..." : user}
                {user === userName && <span style={{color: '#f093fb', marginLeft: '5px'}}>(You)</span>}
              </li>
            ))
          )}
        </ul>

        <div className="typing-indicator">
          {typing || "💭 No one is typing..."}
        </div>

        <h3>🔧 Language</h3>
        <select
          className="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="typescript">TypeScript</option>
        </select>
        
        <button className="leave-button" onClick={leaveRoom}>
          🚪 Leave Room
        </button>
      </div>

      {/* Code editor and output console */}
      <div className="editor-wrapper">
        <Editor
          height={"calc(100vh - 250px)"}
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Consolas', 'Monaco', 'Lucida Console', monospace",
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
        <button 
          className="run-btn" 
          onClick={runCode}
          disabled={!code.trim()}
          style={{
            opacity: !code.trim() ? 0.6 : 1,
            cursor: !code.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          ▶️ Execute Code
        </button>
        <textarea
          className="output-console"
          value={outPut}
          readOnly
          placeholder="🖥️ Output will appear here after execution..."
        />
      </div>
    </div>
  );
};

export default App;
