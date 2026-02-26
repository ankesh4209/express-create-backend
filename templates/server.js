require("dotenv").config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const { Server } = require("socket.io");

const usersRoutes = require("./routes/users.routes");
const errorHandler = require("./middlewares/error.middleware");
const requestLogger = require("./middlewares/logger.middleware");
const logger = require("./config/logger");
const connectDB = require("./config/database");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ========================
// Middleware
// ========================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger); // custom logger instead of morgan

// ========================
// Routes
// ========================
app.use("/api/users", usersRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend Running 🚀" });
});

// ========================
// Error Handler
// ========================
app.use(errorHandler);

// ========================
// Socket.io
// ========================
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("message", (msg) => {
    logger.info(`Message from ${socket.id}: ${msg}`);
    io.emit("message", msg); // broadcast to all clients
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// ========================
// Server Start
// ========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; // export for testing / scaling
