import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { goalsRouter } from "./routes/goals";
import { workoutsRouter } from "./routes/workouts";
import { studyRouter } from "./routes/study";
import { sleepRouter } from "./routes/sleep";
import { caloriesRouter } from "./routes/calories";
import { dashboardRouter } from "./routes/dashboard";
import { reportRouter } from "./routes/report";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// CORS
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return origin;
      const allowed = [
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^https:\/\/.*\.dev\.vibecode\.run$/,
        /^https:\/\/.*\.vibecode\.run$/,
        /^https:\/\/.*\.vibecodeapp\.com$/,
        /^https:\/\/.*\.vibecode\.dev$/,
        /^https:\/\/vibecode\.dev$/,
        /^exp:\/\//,
        /^vibecode:\/\//,
      ];
      return allowed.some((r) => r.test(origin)) ? origin : "";
    },
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
  })
);

app.use("*", logger());

// Auth middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Auth routes
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// App routes
app.route("/api/goals", goalsRouter);
app.route("/api/workouts", workoutsRouter);
app.route("/api/study", studyRouter);
app.route("/api/sleep", sleepRouter);
app.route("/api/calories", caloriesRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/report", reportRouter);

// Current user
app.get("/api/me", (c) => {
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  return c.json({ data: { user } });
});

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
