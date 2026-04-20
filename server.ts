import express from "express";
import { createServer as createViteServer } from "vite";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { Resend } from 'resend';

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Memory store for locking slots. Key: `${doctorId}_${date}_${time}`, Value: { userId, socketId, expiresAt }
export const lockedSlots = new Map<string, { userId?: string, socketId: string, expiresAt: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const io = new SocketIOServer(server, { cors: { origin: '*' } });

  app.use(express.json());
  app.use(cors());

  // Make io accessible in routes if needed later
  app.set("io", io);

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Provide initial locked slots
    socket.emit("sync_locked_slots", Array.from(lockedSlots.entries()));

    socket.on("lock_slot", ({ doctorId, date, time, userId }) => {
      const slotKey = `${doctorId}_${date}_${time}`;
      
      // Clear expired locks lazily
      const now = Date.now();
      if (lockedSlots.has(slotKey) && lockedSlots.get(slotKey)!.expiresAt < now) {
        lockedSlots.delete(slotKey);
      }

      if (lockedSlots.has(slotKey) && lockedSlots.get(slotKey)!.socketId !== socket.id) {
        socket.emit("slot_lock_failed", { message: "Slot already locked", slotKey });
        return;
      }

      // Lock for 5 minutes
      lockedSlots.set(slotKey, { userId, socketId: socket.id, expiresAt: now + 5 * 60 * 1000 });
      io.emit("slot_locked", { slotKey });
    });

    socket.on("unlock_slot", ({ doctorId, date, time }) => {
      const slotKey = `${doctorId}_${date}_${time}`;
      if (lockedSlots.has(slotKey) && lockedSlots.get(slotKey)!.socketId === socket.id) {
        lockedSlots.delete(slotKey);
        io.emit("slot_unlocked", { slotKey });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Remove all locks held by this socket
      const keysToDelete: string[] = [];
      lockedSlots.forEach((value, key) => {
        if (value.socketId === socket.id) keysToDelete.push(key);
      });
      keysToDelete.forEach(key => {
        lockedSlots.delete(key);
        io.emit("slot_unlocked", { slotKey: key });
      });
    });
  });

  // Cleanup loop for expired locks every 1 minute
  setInterval(() => {
    const now = Date.now();
    lockedSlots.forEach((value, key) => {
      if (value.expiresAt < now) {
        lockedSlots.delete(key);
        io.emit("slot_unlocked", { slotKey: key });
      }
    });
  }, 60000);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/notify", async (req, res) => {
    const { type, email, phone, details } = req.body;

    try {
      if (type === 'booking') {
        const { doctorName, date, time, patientName } = details;
        
        // 1. Send Email via Resend
        if (resend && email) {
          await resend.emails.send({
            from: 'DocReserve <onboarding@resend.dev>',
            to: email,
            subject: 'Appointment Confirmed - DocReserve',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
                <h1 style="color: #0F172A;">Appointment Confirmed!</h1>
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been successfully booked.</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${time}</p>
                </div>
                <p>Please arrive 10 minutes early. You can manage your appointment from your dashboard.</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94A3B8;">Sent by DocReserve System</p>
              </div>
            `
          });
        }

        // 2. WhatsApp Notification Placeholder (Requires Meta App ID / Phone ID)
        // In production, you would call https://graph.facebook.com/v17.0/${phone_id}/messages
        if (process.env.WHATSAPP_API_KEY && phone) {
           console.log(`[WhatsApp Sim] Sending confirmation to ${phone}: Appointment with Dr. ${doctorName} at ${time}, ${date}`);
           // Example implementation:
           /*
           await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
             method: 'POST',
             headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`, 'Content-Type': 'application/json' },
             body: JSON.stringify({
               messaging_product: "whatsapp",
               to: phone,
               type: "template",
               template: { name: "appointment_confirmation", language: { code: "en_US" } }
             })
           });
           */
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Notification Error:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
