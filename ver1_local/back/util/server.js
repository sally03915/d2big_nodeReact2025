const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {  origin: "*", },
});

io.on("connection", (socket) => {
  console.log("🚀 사용자가 연결됨:", socket.id);

  socket.on("message", (msg) => {
    io.emit("message", msg); // 모든 클라이언트에게 메시지 전송
  });

  socket.on("disconnect", () => {
    console.log("❌ 사용자 연결 종료:", socket.id);
  });
});

server.listen(3075, () => console.log("🔥 서버 실행 중..."));
