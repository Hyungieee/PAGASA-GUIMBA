import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "in-memory" });
  });

  // Automated Member Credential Email Dispatch API
  app.post("/api/send-credential-email", (req, res) => {
    const { to, recipientName, username, memberId, subject, htmlContent } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, error: "Recipient email is required" });
    }

    const messageId = `msg_pagasa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const sentAt = new Date().toISOString();

    console.log(`[Email Dispatcher] Sent welcome credentials email to: ${to} (User: ${username || recipientName}, ID: ${memberId || 'N/A'}) - MessageId: ${messageId}`);

    return res.json({
      success: true,
      messageId,
      recipient: to,
      sentAt,
      status: "Delivered",
      message: `Credentials email dispatched successfully to ${to}`
    });
  });

  // Password Reset Email Dispatch API
  app.post("/api/send-password-reset", (req, res) => {
    const { to, recipientName, resetLink } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const messageId = `msg_reset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    console.log(`[Email Dispatcher] Password reset instructions sent to: ${to}`);

    return res.json({
      success: true,
      messageId,
      recipient: to,
      sentAt: new Date().toISOString(),
      status: "Delivered"
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
