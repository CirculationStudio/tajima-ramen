// Free the dev server port before starting, but only from our own leftovers.
//
//   node scripts/free-port.js 8080
//
// WHY THIS EXISTS
// Eleventy's dev server silently increments the port when the one it wants is
// taken: ask for 8080, get 8081, with one easily-missed line of output. That is
// a bad default here, because the usual reason 8080 is busy is a stale
// `eleventy --serve` from an earlier session that is still watching src/ and
// still writing to _site/. Two servers writing one output directory produces a
// page that flickers between styled and unstyled, and the second server
// answering on a different port makes it look like the first one is broken.
//
// So: kill our own strays, and refuse to touch anything else.
//
// SAFETY: a process is only killed if it is an `eleventy` process whose open
// files place it inside THIS project directory. Anything else holding the port
// is reported and left alone, and this script exits non-zero so `npm start`
// stops rather than silently landing somewhere unexpected.

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PORT = process.argv[2] || "8080";
const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");

function sh(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

const pids = [...new Set(sh("lsof", ["-nP", `-iTCP:${PORT}`, "-sTCP:LISTEN", "-t"]).split("\n").filter(Boolean))];

if (pids.length === 0) {
  console.log(`port ${PORT} is free`);
  process.exit(0);
}

const ours = [];
const theirs = [];

for (const pid of pids) {
  const cmd = sh("ps", ["-p", pid, "-o", "command="]).trim();
  // Does this process actually live in this project? `lsof -p` lists its cwd
  // and open files; our eleventy run will have node_modules paths under ROOT.
  const openFiles = sh("lsof", ["-p", pid]);
  const isEleventy = /eleventy/.test(cmd);
  const inThisProject = openFiles.includes(ROOT);
  (isEleventy && inThisProject ? ours : theirs).push({ pid, cmd });
}

for (const { pid, cmd } of theirs) {
  console.error(`\nport ${PORT} is held by a process that is not ours, refusing to kill it:`);
  console.error(`  pid ${pid}  ${cmd.slice(0, 120)}`);
}

if (theirs.length > 0) {
  console.error(`\nStop that process yourself, or start on another port with:`);
  console.error(`  npx eleventy --serve --port=<other>\n`);
  process.exit(1);
}

for (const { pid } of ours) {
  console.log(`port ${PORT}: killing stale eleventy from this project (pid ${pid})`);
  try {
    process.kill(Number(pid), "SIGTERM");
  } catch {
    /* already gone */
  }
}

// Give SIGTERM a moment, then escalate to anything still holding the socket.
const deadline = Date.now() + 3000;
while (Date.now() < deadline) {
  const still = sh("lsof", ["-nP", `-iTCP:${PORT}`, "-sTCP:LISTEN", "-t"]).split("\n").filter(Boolean);
  if (still.length === 0) {
    console.log(`port ${PORT} is free`);
    process.exit(0);
  }
  try {
    execFileSync("sleep", ["0.2"]);
  } catch {
    /* ignore */
  }
}

for (const { pid } of ours) {
  try {
    process.kill(Number(pid), "SIGKILL");
  } catch {
    /* already gone */
  }
}
console.log(`port ${PORT} is free`);
