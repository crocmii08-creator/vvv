import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import cookieSession from "cookie-session";
import fs from "fs";
import { parse } from "csv-parse/sync";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SESSION_SECRET || "aura-iq-secret"],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: "none",
      httpOnly: true,
    })
  );

  // --- OAuth Configuration ---
  const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
  const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
  const REDIRECT_URI = `${process.env.APP_URL}/auth/callback`;
  const AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
  const TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const SCOPES = "openid profile User.Read Calendars.Read";

  // --- API Routes ---

  // 1. Get Auth URL
  app.get("/api/auth/url", (req, res) => {
    if (!CLIENT_ID) {
      return res.status(500).json({ error: "MICROSOFT_CLIENT_ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPES,
      response_mode: "query",
    });
    res.json({ url: `${AUTH_URL}?${params.toString()}` });
  });

  // 2. OAuth Callback
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const response = await axios.post(
        TOKEN_URL,
        new URLSearchParams({
          client_id: CLIENT_ID!,
          client_secret: CLIENT_SECRET!,
          code: code as string,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, refresh_token } = response.data;
      
      // Store tokens in session
      if (req.session) {
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
      }

      res.send(`
        <html>
          <body style="background: #0f172a; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="color: #00f2ff;">AURA-IQ Connected</h2>
              <p>Microsoft Outlook successfully integrated. Closing window...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 1500);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Token exchange error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  // 3. Get Calendar Events (Occupancy Predictions)
  app.get("/api/calendar/events", async (req, res) => {
    const accessToken = req.session?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Fetch events for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const response = await axios.get("https://graph.microsoft.com/v1.0/me/calendarview", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          startDateTime: startOfDay.toISOString(),
          endDateTime: endOfDay.toISOString(),
          $select: "subject,start,end,location",
        },
      });

      // Map events to occupancy predictions
      const events = response.data.value.map((event: any) => ({
        subject: event.subject,
        start: event.start.dateTime,
        end: event.end.dateTime,
        location: event.location.displayName,
      }));

      res.json({ events });
    } catch (error: any) {
      console.error("Fetch calendar error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch calendar" });
    }
  });

  // 4. Check Auth Status
  app.get("/api/auth/status", (req, res) => {
    res.json({ connected: !!req.session?.accessToken });
  });

  // 5. Logout
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session = null;
    }
    res.json({ success: true });
  });

  // 6. Get Calendar Data from CSV
  app.get("/api/calendar/csv", (req, res) => {
    try {
      const csvPath = path.join(process.cwd(), "calendar_data.csv");
      if (!fs.existsSync(csvPath)) {
        return res.json({ events: [] });
      }

      const fileContent = fs.readFileSync(csvPath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const now = new Date();
      const events = records.map((record: any) => {
        const start = new Date(now.getTime() + parseInt(record.start_offset_minutes) * 60000);
        const end = new Date(start.getTime() + parseInt(record.duration_minutes) * 60000);
        return {
          subject: record.subject,
          start: start.toISOString(),
          end: end.toISOString(),
          location: record.location,
          attendees: parseInt(record.attendees),
        };
      });

      res.json({ events });
    } catch (error) {
      console.error("CSV parse error:", error);
      res.status(500).json({ error: "Failed to parse CSV" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
