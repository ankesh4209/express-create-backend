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

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
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
   ASK QUESTION
================================= */

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

/* ===============================
   MAIN LOGIC
================================= */

async function main() {
  try {
    // Check if folder exists
    if (await fs.pathExists(targetPath)) {
      console.log(
        chalk.yellow(`Directory ${chalk.bold(folderName)} already exists.`),
      );

      const answer = await askQuestion(
        chalk.yellow("Do you want to overwrite it? [y/N]: "),
      );

      if (answer !== "y" && answer !== "yes") {
        console.log(chalk.red("Operation cancelled."));
        return safeExit(0);
      }

      console.log(chalk.yellow("Removing existing directory..."));
      await fs.remove(targetPath);
    }

    console.log(chalk.green("Creating project from template..."));

    // Copy entire template folder
    await fs.copy(templatePath, targetPath);

    console.log(chalk.green("✓ Template copied successfully"));

    console.log(chalk.yellow("\nInstalling dependencies..."));

    // Run npm install inside new project
    await new Promise((resolve, reject) => {
      exec("npm install", { cwd: targetPath }, (err, stdout, stderr) => {
        if (err) {
          console.error(chalk.red("npm install failed:"), err.message);
          return reject(err);
        }

        if (stdout) console.log(stdout);
        if (stderr) console.log(chalk.dim(stderr));

        resolve();
      });
    });

    console.log(chalk.green.bold("\nSuccess! Your backend is ready 🚀\n"));
    console.log(`  ${chalk.cyan("cd")} ${folderName}`);
    console.log(`  ${chalk.cyan("npm start")}\n`);

    return safeExit(0);
  } catch (err) {
    console.error(chalk.red("\nError occurred:"), err.message);
    return safeExit(1);
  }
}

main().catch((err) => {
  console.error(chalk.red("Unexpected error:"), err);
  safeExit(1);
});
