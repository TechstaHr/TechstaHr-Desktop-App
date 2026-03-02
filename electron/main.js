const { app, BrowserWindow, desktopCapturer, ipcMain, Tray, Menu } = require("electron");
const serve = require("electron-serve").default;
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const appServe = app.isPackaged
  ? serve({ directory: path.join(app.getAppPath(), "out") })
  : null;

let tray = null;
let win;

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,       // ❌ turn this off
      contextIsolation: true,       // ✅ turn this on
    },
    autoHideMenuBar: true,
    show: false,
  });

  win.maximize();
  win.show();

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", () => {
      win.webContents.reloadIgnoringCache();
    });
  }


  // 🧩 Create System Tray Icon
  // 🧩 Create System Tray Icon
  const createTray = async () => {
    try {
      let icon;
      if (app.isPackaged) {
        icon = await app.getFileIcon(process.execPath);
      } else {
        icon = path.join(__dirname, "logo.png"); // Fallback in dev
      }

      tray = new Tray(icon);

      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Open App",
          click: () => {
            win.show();
          },
        },
        {
          label: "Exit",
          click: () => {
            app.quit();
          },
        },
      ]);

      tray.setToolTip("Team Manager");
      tray.setContextMenu(contextMenu);

      // Optional: Show again when tray icon is double-clicked
      tray.on("double-click", () => {
        win.show();
      });
    } catch (error) {
      console.error("Failed to create tray icon:", error);
    }
  };

  createTray();

  // 🧩 When user clicks close, minimize to tray instead
  win.on("close", (event) => {
    event.preventDefault();
    win.hide();
  });



  // Start automatic screenshot capture after window is ready
  win.webContents.once("did-finish-load", () => {
    //startAutoScreenshot();
  });
};

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("take-screenshot", async () => {
  console.log("📸 Screenshot triggered from frontend");
  await captureScreenshot();
});

let screenshotInterval = null;

ipcMain.on("start-auto-screenshot", (event, intervalMs = 10000, authToken = null, currentProjectId = null) => {
  if (screenshotInterval) return; // Prevent multiple intervals
  if (authToken) {
    const tokenPath = path.join(app.getPath("userData"), "authToken.txt");
    fs.writeFileSync(tokenPath, authToken, "utf8");
  }
  if (currentProjectId) {
    const projectIdPath = path.join(app.getPath("userData"), "currentProjectId.txt");
    fs.writeFileSync(projectIdPath, currentProjectId, "utf8");
  }
  console.log("⏱️ Auto screenshot started");
  screenshotInterval = setInterval(() => {
    captureScreenshot().catch(err => console.error("Auto screenshot error:", err));
  }, intervalMs);
});

ipcMain.on("stop-auto-screenshot", () => {
  if (!screenshotInterval) return;
  clearInterval(screenshotInterval);
  screenshotInterval = null;
  console.log("⏹️ Auto screenshot stopped");
});




// ------------------------------
// 🧩 Auto Screenshot Logic
// ------------------------------
async function captureScreenshot() {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1920, height: 1080 } // full-HD capture
  });

  const source = sources[0];
  if (!source) return console.error("No screen source found");

  const image = source.thumbnail.toPNG();

  const screenshotDir = path.join(app.getPath("userData"), "screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const filePath = path.join(screenshotDir, `screenshot_${Date.now()}.png`);
  fs.writeFileSync(filePath, image);
  console.log(`📸 Screenshot saved to: ${filePath}`);

  // ---- Upload to Cloudinary ----
  const uploadPreset = "unsigned";
  const cloudName = "dydcrlazk";

  // Build x-www-form-urlencoded body with base64 file to avoid FormData/fetch in main process
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString("base64");

  const params = new URLSearchParams();
  params.append("file", `data:image/png;base64,${base64}`);
  params.append("upload_preset", uploadPreset);
  // Explicitly set a safe public_id to avoid display name issues
  params.append("public_id", `screenshot_${Date.now()}`);

  console.log("☁️ Uploading to Cloudinary...");
  // Optional params if environment variables are available (helpful for some presets)

  params.append("api_key", "847198842611943");

  params.append("timestamp", Math.floor(Date.now() / 1000).toString());

  let data;
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    data = response.data;
  } catch (err) {
    if (err.response) {
      console.error("❌ Cloudinary upload error:", err.response.status, err.response.data);
    } else {
      console.error("❌ Cloudinary upload error:", err.message || err);
    }
    return;
  }

  if (data.secure_url) {
    console.log("✅ Uploaded successfully:", data.secure_url);

    // Notify backend of upload completion with imageUrl and projectId
    try {
      const tokenPath = path.join(app.getPath("userData"), "authToken.txt");
      const projectIdPath = path.join(app.getPath("userData"), "currentProjectId.txt");

      const authToken = fs.existsSync(tokenPath)
        ? fs.readFileSync(tokenPath, "utf8")
        : null;
      const projectId = fs.existsSync(projectIdPath)
        ? fs.readFileSync(projectIdPath, "utf8")
        : null;

      if (!authToken || !projectId) {
        console.warn(
          "⚠️ Missing auth token or project ID; skipping notify-upload-completion",
        );
      } else {
        const notifyUrl = `https://techstahr-backend.onrender.com/api/v1/screenshot/${encodeURIComponent(
          projectId.trim(),
        )}/notify-upload-completion`;

        const notifyResp = await axios.post(
          notifyUrl,
          { imageUrl: data.secure_url },
          {
            headers: {
              Authorization: `Bearer ${authToken.trim()}`,
              "Content-Type": "application/json",
            },
            validateStatus: (status) => status < 400,
          },
        );

        console.log(
          "✅ Backend notified of upload completion:",
          notifyResp.status,
        );
      }
    } catch (notifyErr) {
      if (notifyErr.response) {
        console.error(
          "❌ Notify upload completion error:",
          notifyErr.response.status,
          notifyErr.response.data,
        );
      } else {
        console.error("❌ Notify upload completion error:", notifyErr);
      }
    }
  } else {
    console.error("❌ Upload failed:", data);
  }
}

function startAutoScreenshot() {
  // Take screenshot every 10 seconds (adjust as needed)
  setInterval(() => {
    captureScreenshot().catch(err => console.error("Screenshot error:", err));
  }, 10000);
}
