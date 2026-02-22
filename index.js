#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const readline = require("readline");

const chalk = require("chalk"); // optional but highly recommended for better UX
// If you don't want chalk, remove it and replace chalk calls with plain console.log

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(
    chalk.cyan(`
Usage:
  npx create-express-backend <project-name>
  npx create-express-backend@latest my-api

Examples:
  npx create-express-backend my-backend
  npx create-express-backend api-v2

Options:
  --help, -h     Show this help message
  `),
  );
  process.exit(0);
}

const folderName = args[0].trim();
if (!folderName || folderName === ".") {
  console.error(chalk.red("Error: Please provide a valid project name"));
  console.log(chalk.yellow("Example: npx create-express-backend my-app"));
  process.exit(1);
}

const targetPath = path.join(process.cwd(), folderName);

console.log(
  chalk.blue(
    `\nCreating production-ready Express backend → ${chalk.bold(folderName)}`,
  ),
);
console.log(chalk.dim(`Target directory: ${targetPath}\n`));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  try {
    // 1. Check if folder already exists
    if (await fs.pathExists(targetPath)) {
      console.log(
        chalk.yellow(`Directory ${chalk.bold(folderName)} already exists.`),
      );

      const answer = await askQuestion(
        chalk.yellow("Do you want to overwrite it? [y/N]: "),
      );

      if (answer !== "y" && answer !== "yes") {
        console.log(chalk.red("Operation cancelled."));
        rl.close();
        process.exit(0);
      }

      console.log(chalk.yellow("Removing existing directory..."));
      await fs.remove(targetPath);
    }

    // 2. Create root directory
    await fs.ensureDir(targetPath);
    console.log(chalk.green("✓ Project folder created"));

    // ────────────────────────────────────────────────
    // Your original structure (no bin/)
    const structure = [
      "config/database.js",
      "config/env.js",
      "config/logger.js",
      "controllers/users.controller.js",
      "routes/users.routes.js",
      "services/users.service.js",
      "models/user.model.js",
      "middlewares/auth.middleware.js",
      "middlewares/error.middleware.js",
      "middlewares/logger.middleware.js",
      "utils/jwt.util.js",
      "errors/BaseError.js",
      "errors/BadRequestError.js",
      "errors/NotFoundError.js",
      ".env",
      ".env.example",
      ".gitignore",
      "server.js",
      "package.json",
      "README.md",
    ];

    // ────────────────────────────────────────────────
    // Your package.json template
    const packageJsonContent = {
      name: folderName,
      version: "1.0.0",
      description: "Production-ready Express backend",
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "nodemon server.js",
      },
      dependencies: {},
      devDependencies: {},
      author: "",
      license: "ISC",
    };

    // ────────────────────────────────────────────────
    // Your pre-filled file contents
    const fileContents = {
      ".env": `PORT=5000
MONGO_URI=mongodb://localhost:27017/${folderName}
JWT_SECRET=your_jwt_secret_key
`,
      ".env.example": `# Copy this to .env and fill values
PORT=5000
MONGO_URI=mongodb://localhost:27017/${folderName}
JWT_SECRET=your_jwt_secret_key
`,
      ".gitignore": `node_modules
.env
`,
      "server.js": `require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

const usersRoutes = require("./routes/users.routes");
const errorHandler = require("./middlewares/error.middleware");
const logger = require("./config/logger");
const { connectDB } = require("./config/database");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Connect to DB
connectDB();

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
  logger.info(\`Socket connected: \${socket.id}\`);
  socket.on("message", (msg) => io.emit("message", msg));
  socket.on("disconnect", () => logger.info(\`Socket disconnected: \${socket.id}\`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(\`Server running on port \${PORT}\`));
`,
      "README.md": `# ${folderName}

Production-ready Express backend with Socket.io, logging, and error handling.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:5000
`,
    };

    // 3. Create all files
    for (const file of structure) {
      const fullPath = path.join(targetPath, file);
      await fs.ensureDir(path.dirname(fullPath));

      if (file === "package.json") {
        await fs.writeJson(fullPath, packageJsonContent, { spaces: 2 });
      } else if (file in fileContents) {
        await fs.writeFile(fullPath, fileContents[file], "utf8");
      } else {
        await fs.writeFile(
          fullPath,
          "// TODO: Add production code here\n",
          "utf8",
        );
      }
    }

    console.log(chalk.green("✓ All files and folders created"));

    // 4. Install dependencies
    console.log(
      chalk.yellow(
        "\nInstalling dependencies... (this may take 30–90 seconds)",
      ),
    );
    const installCmd = `cd "${folderName}" && npm install express dotenv cors helmet morgan socket.io jsonwebtoken bcryptjs winston mongoose nodemon eslint --save`;

    await new Promise((resolve, reject) => {
      exec(installCmd, (err, stdout, stderr) => {
        if (err) {
          console.error(chalk.red("npm install failed:"), err.message);
          if (stderr) console.error(stderr);
          reject(err);
          return;
        }
        if (stdout) console.log(stdout.trim());
        if (stderr) console.log(chalk.dim(stderr.trim()));
        resolve();
      });
    });

    // ────────────────────────────────────────────────
    // Final success message & exit
    console.log(chalk.green.bold("\nSuccess! Your backend is ready 🚀\n"));

    console.log(`  ${chalk.cyan("cd")} ${folderName}`);
    console.log(
      `  ${chalk.cyan("npm run dev")}     # start development server with nodemon`,
    );
    console.log(
      `  ${chalk.cyan("npm start")}       # start production server\n`,
    );

    console.log(chalk.dim("Happy coding!\n"));

    rl.close();
    process.exit(0);
  } catch (err) {
    console.error(chalk.red("\nError occurred:"), err.message);
    if (err.stack) {
      console.error(chalk.dim(err.stack.split("\n").slice(1).join("\n")));
    }
    rl.close();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(chalk.red("Unexpected error:"), err);
  process.exit(1);
});
