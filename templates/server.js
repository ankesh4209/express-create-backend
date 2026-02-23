require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

const usersRoutes = require("./routes/users.routes");
const errorHandler = require("./middlewares/error.middleware");
const logger = require("./config/logger");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Routes
app.use("/api/users", usersRoutes);

app.get("/", (req, res) => res.json({ message: "Backend Running 🚀" }));

// Error handler
app.use(errorHandler);

// Socket.io
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on("message", (msg) => io.emit("message", msg));
  socket.on("disconnect", () =>
    logger.info(`Socket disconnected: ${socket.id}`),
  );
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
