import { Hono } from "hono";
import { prisma } from "../prisma";
import { auth } from "../auth";

const reportRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/report/weekly?weekOffset=0 -- 0 = this week, 1 = last week, etc.
reportRouter.get("/weekly", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const weekOffset = parseInt(c.req.query("weekOffset") ?? "0", 10) || 0;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
  const weekStart = new Date(thisWeekMonday.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const goal = await prisma.goal.findUnique({ where: { userId: user.id } });

  const [workouts, studySessions, sleepLogs, calorieLogs] = await Promise.all([
    prisma.workout.findMany({ where: { userId: user.id, loggedAt: { gte: weekStart, lt: weekEnd } }, orderBy: { loggedAt: "asc" } }),
    prisma.studySession.findMany({ where: { userId: user.id, loggedAt: { gte: weekStart, lt: weekEnd } }, orderBy: { loggedAt: "asc" } }),
    prisma.sleepLog.findMany({ where: { userId: user.id, loggedAt: { gte: weekStart, lt: weekEnd } }, orderBy: { loggedAt: "asc" } }),
    prisma.calorieLog.findMany({ where: { userId: user.id, loggedAt: { gte: weekStart, lt: weekEnd } }, orderBy: { loggedAt: "asc" } }),
  ]);

  const totalStudyHours = studySessions.reduce((s, x) => s + x.durationMin / 60, 0);
  const avgSleepHours = sleepLogs.length > 0 ? sleepLogs.reduce((s, x) => s + x.hours, 0) / sleepLogs.length : 0;
  const totalCalories = calorieLogs.reduce((s, x) => s + x.calories, 0);
  const avgDailyCalories = totalCalories / 7;

  return c.json({
    data: {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      goal,
      summary: {
        workoutsCompleted: workouts.length,
        studyHours: Math.round(totalStudyHours * 10) / 10,
        avgSleepHours: Math.round(avgSleepHours * 10) / 10,
        avgDailyCalories: Math.round(avgDailyCalories),
        totalCalories,
      },
      workouts,
      studySessions,
      sleepLogs,
      calorieLogs,
    },
  });
});

export { reportRouter };
