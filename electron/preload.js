const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    send: (channel, args) => {
        ipcRenderer.send(channel, args);
    },
    takeScreenshot: () => ipcRenderer.send("take-screenshot"),
    startAutoScreenshot: (intervalMs, authToken, currentProjectId) => ipcRenderer.send("start-auto-screenshot", intervalMs, authToken, currentProjectId),
    stopAutoScreenshot: () => ipcRenderer.send("stop-auto-screenshot")
});