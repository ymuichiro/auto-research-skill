import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "./lib/site-config.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const publicRoot = path.join(projectRoot, "public");
const port = Number(process.env.PORT ?? 4173);

async function runBuild() {
  await new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["run", "build:site"], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`build:site exited with code ${code}`));
    });
  });
}

function startTailwindWatch() {
  return spawn(
    "pnpm",
    ["exec", "tailwindcss", "-c", "tailwind.config.mjs", "-i", "./src/styles/input.css", "-o", "./public/assets/site.css", "--watch"],
    {
      cwd: projectRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    }
  );
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

function startServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
      const strippedPath = siteConfig.basePath && requestUrl.pathname.startsWith(siteConfig.basePath)
        ? requestUrl.pathname.slice(siteConfig.basePath.length)
        : requestUrl.pathname;
      const normalizedPath = strippedPath === "/" ? "/index.html" : strippedPath;
      let filePath = path.join(publicRoot, normalizedPath);

      if (!path.extname(filePath)) {
        filePath = path.join(publicRoot, normalizedPath, "index.html");
      }

      const payload = await readFile(filePath);
      response.writeHead(200, { "Content-Type": contentType(filePath) });
      response.end(payload);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  server.listen(port, () => {
    console.log(`Dev server: http://localhost:${port}${siteConfig.basePath || "/"}`);
  });

  return server;
}

let pendingBuild;

function scheduleBuild() {
  if (pendingBuild) {
    clearTimeout(pendingBuild);
  }

  pendingBuild = setTimeout(async () => {
    try {
      await runBuild();
      console.log("Site rebuilt.");
    } catch (error) {
      console.error(error.message);
    }
  }, 150);
}

async function main() {
  await runBuild();
  const cssWatcher = startTailwindWatch();
  const server = startServer();

  const watchers = [
    watch(path.join(projectRoot, "content"), { recursive: true }, scheduleBuild),
    watch(path.join(projectRoot, "scripts"), { recursive: true }, scheduleBuild)
  ];

  const shutdown = () => {
    watchers.forEach((entry) => entry.close());
    cssWatcher.kill("SIGINT");
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
