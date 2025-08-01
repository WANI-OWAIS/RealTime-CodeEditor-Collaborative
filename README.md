
<div align="center">

# 🚀 **CodeSync**  
### *Real-time Collaborative Code Editor*

[![GitHub Stars](https://img.shields.io/github/stars/WANI-OWAIS/RealTime-CodeEditor-Collaborative?color=gold)](https://github.com/WANI-OWAIS/RealTime-CodeEditor-Collaborative/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/WANI-OWAIS/RealTime-CodeEditor-Collaborative?color=blue)](https://github.com/WANI-OWAIS/RealTime-CodeEditor-Collaborative/fork)
[![License](https://img.shields.io/github/license/WANI-OWAIS/RealTime-CodeEditor-Collaborative?color=green)](LICENSE)

> Collaborate. Code. Compile. Real-time.

<p align="center">
  <img src="frontend/src/assets/Banner.png" alt="CodeSync Banner" width="800"/>
</p>


</div>

---

## ✨ Features

- 🔄 **Real-time Collaboration** – Work with others in live code sessions  
- 🌐 **Multi-language Support** – JS, Python, Java, C++, Go, Rust, etc.  
- ⚡ **Instant Code Execution** – Compile and run in the browser  
- 👥 **User Management** – See who’s online and in your room  
- ⌨️ **Live Typing Indicators** – Know when someone’s typing  
- 📱 **Responsive UI** – Seamless experience across all devices  
- 🎨 **Modern Design** – Glassmorphism + Dark Mode  
- 🔌 **Auto-Reconnection** – Handles network drops smoothly  

---

## 🛠️ Tech Stack

### 🖥 Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Monaco Editor** - VS Code-like code editor
- **Socket.io Client** - Real-time communication
- **HTML5** - Semantic markup structure
- **CSS3** - Custom styling with gradients, flexbox, and animations

### ⚙️ Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket communication
- **Axios** - HTTP client
- **Piston API** - Code execution engine

---

## 🚀 Getting Started

### ⚙️ Prerequisites
- Node.js v16+
- npm or yarn

### 🔧 Installation

```bash
# Clone the repo
git clone https://github.com/WANI-OWAIS/RealTime-CodeEditor-Collaborative.git
cd RealTime-CodeEditor-Collaborative

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 📦 Run Locally

In two separate terminals:

**Backend**  
```bash
npm run dev
```

**Frontend**  
```bash
cd frontend
npm run dev
```

📍 Frontend: `http://localhost:5174`  
📍 Backend: `http://localhost:5000`

---

## 🧪 Usage Guide

1. **Enter a Room ID + Username**
2. **Join or Create a Room**
3. **Write and Collaborate**
4. **Choose Language and Click "Execute"**
5. **Share Room ID with Friends**

---

## 🧭 Project Structure

```
RealTime-CodeEditor-Collaborative/
├── backend/
│   └── index.js          # Express + Socket.io setup
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   ├── App.css       # UI styling
│   │   └── main.jsx      # React entry
│   ├── index.html
│   └── package.json
├── package.json
└── README.md
```

---

## 🔐 Environment Setup

Create a `.env` in root:

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:5174
```

---

## 💬 Socket Events

### 🔁 Client to Server
- `join`: Join a room
- `leaveRoom`: Leave the room
- `codeChange`: Share code updates
- `typing`: Typing indicator
- `languageChange`: Change language
- `compileCode`: Execute the code

### 📡 Server to Client
- `userJoined`: New user info
- `codeUpdate`: Code synced
- `userTyping`: User is typing
- `languageUpdate`: Language changed
- `codeResponse`: Output from execution

---

## 🌐 Supported Languages

✅ JavaScript  
✅ Python  
✅ Java  
✅ C / C++  
✅ Go  
✅ Rust  
✅ TypeScript  

---

## 🪲 Known Issues

- ⛔ Large file edits may reduce performance  
- ⏱ Execution timeouts depend on Piston API  
- 📱 Mobile layout may shift on keyboard open  

---

## 🗺️ Roadmap

- [ ] File upload/download  
- [ ] Code versioning & undo history  
- [ ] Voice chat integration  
- [ ] Plugin marketplace  
- [ ] Docker containerization  
- [ ] Persistent storage with DB  
- [ ] User login & authentication  
- [ ] Custom themes  

---

## 🙌 Contributing

```bash
# 1. Fork the repo
# 2. Create a new branch
git checkout -b feature/my-feature

# 3. Commit changes
git commit -m "Add feature"

# 4. Push to GitHub
git push origin feature/my-feature

# 5. Create a Pull Request 🎉
```

---

## 📄 License

This project is licensed under the **ISC License** – see the [LICENSE](LICENSE) file for more info.

---

## 👨‍💻 Author

**WANI OWAIS**  
🔗 [GitHub](https://github.com/WANI-OWAIS)

---

## 🙏 Special Thanks

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)  
- [Piston API](https://github.com/engineer-man/piston)  
- [Socket.io](https://socket.io/)  
- [Vite](https://vitejs.dev/)  

---

> ⭐ If you like this project, consider giving it a **star** on GitHub! It motivates me to keep building.
