#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const readline = require("readline");
const chalk = require("chalk");

const args = process.argv.slice(2);

/* ===============================
   HELP COMMAND
================================= */
if (!args[0] || args.includes("--help") || args.includes("-h")) {
  console.log(
    chalk.cyan(`
Usage:
  npx express-create-backend <project-name>
  npx express-create-backend@latest <project-name>

Examples:
  npx express-create-backend my-backend
  npx express-create-backend api-v2

Options:
  --help, -h     Show this help message
`),
  );
  process.exit(0);
}

const folderName = args[0].trim();
if (!folderName || folderName === ".") {
  console.error(chalk.red("Error: Please provide a valid project name"));
  console.log(
    chalk.yellow("Example: npx express-create-backend my-backend-app"),
  );
  process.exit(1);
}

const targetPath = path.join(process.cwd(), folderName);
const templatePath = path.join(__dirname, "templates");

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

/* ===============================
   SAFE EXIT HANDLER
================================= */
let isExiting = false;
function safeExit(code = 0) {
  if (isExiting) return;
  isExiting = true;
  try {
    rl.close();
  } catch (e) {}
  process.exit(code);
}
process.on("SIGINT", () => {
  console.log(chalk.red("\nCancelled by user"));
  safeExit(0);
});

/* ===============================
   ASK QUESTION UTILITY
================================= */
const askQuestion = (query) =>
  new Promise((resolve) =>
    rl.question(query, (answer) => resolve(answer.trim().toLowerCase())),
  );

/* ===============================
   MAIN FUNCTION
================================= */
(async function main() {
  try {
    // Check if folder exists
    if (await fs.pathExists(targetPath)) {
      console.log(
        chalk.yellow(`Directory ${chalk.bold(folderName)} already exists.`),
      );

      const answer = await askQuestion(
        chalk.yellow("Do you want to overwrite it? [y/N]: "),
      );
      if (!["y", "yes"].includes(answer)) {
        console.log(chalk.red("Operation cancelled."));
        return safeExit(0);
      }

      console.log(chalk.yellow("Removing existing directory..."));
      await fs.remove(targetPath);
    }

    console.log(chalk.green("Creating project from template..."));
    await fs.copy(templatePath, targetPath);
    console.log(chalk.green("✓ Template copied successfully"));

    console.log(
      chalk.yellow(
        "\nInstalling dependencies (this may take a few minutes)...",
      ),
    );
    await new Promise((resolve, reject) => {
      const install = exec("npm install", { cwd: targetPath });
      install.stdout.pipe(process.stdout);
      install.stderr.pipe(process.stderr);
      install.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error("npm install failed")),
      );
    });

    console.log(chalk.green.bold("\nSuccess! Your backend is ready 🚀"));
    console.log(`  ${chalk.cyan("cd")} ${folderName}`);
    console.log(`  ${chalk.cyan("npm start")}\n`);

    safeExit(0);
  } catch (err) {
    console.error(chalk.red("\nError occurred:"), err.message || err);
    safeExit(1);
  }
})();
