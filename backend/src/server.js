require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Kết nối CSDL MongoDB Atlas
connectDB();

// Cấu hình Middleware
app.use(cors({
  origin: '*', // Cho phép mọi frontend hoặc cấu hình theo CLIENT_URL
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình Socket.IO thời gian thực
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Lưu biến `io` vào app để controllers có thể bắn event
app.set('socketio', io);

// Xử lý sự kiện kết nối Socket.IO
io.on('connection', (socket) => {
  console.log(`⚡ Client kết nối Socket.IO: ${socket.id}`);

  // Tham gia phòng bếp (Kitchen Display System)
  socket.on('join:kitchen', () => {
    socket.join('kitchen_room');
    console.log(`👨‍🍳 Socket ${socket.id} đã vào kênh Kitchen Display`);
  });

  // Tham gia phòng thu ngân (Cashier)
  socket.on('join:cashier', () => {
    socket.join('cashier_room');
    console.log(`💵 Socket ${socket.id} đã vào kênh Thu ngân`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client ngắt kết nối: ${socket.id}`);
  });
});

// Gắn API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Cloud Restaurant Management API',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Máy chủ Backend đang chạy tại http://localhost:${PORT}`);
});
