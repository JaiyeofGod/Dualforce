import { Hono } from "hono";
import { prisma } from "../prisma";
import { auth } from "../auth";

const dashboardRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/dashboard - get today's progress and weekly summary
dashboardRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  // Today bounds
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // This week bounds (Monday to Sunday)
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch goal
  let goal = await prisma.goal.findUnique({ where: { userId: user.id } });
  if (!goal) {
    goal = await prisma.goal.create({
      data: { userId: user.id },
    });
  }

  // Today's calories
  const todayCalories = await prisma.calorieLog.findMany({
    where: { userId: user.id, loggedAt: { gte: todayStart, lt: todayEnd } },
  });
  const todayCaloriesTotal = todayCalories.reduce((sum, l) => sum + l.calories, 0);

  // Today's sleep
  const todaySleep = await prisma.sleepLog.findFirst({
    where: { userId: user.id, loggedAt: { gte: todayStart, lt: todayEnd } },
    orderBy: { loggedAt: "desc" },
  });

  // This week's workouts
  const weekWorkouts = await prisma.workout.count({
    where: { userId: user.id, loggedAt: { gte: weekStart, lt: weekEnd } },
  });

  // This week's study hours
  const weekStudySessions = await prisma.studySession.findMany({
    where: { userId: user.id, loggedAt: { gte: weekStart, lt: weekEnd } },
  });
  const weekStudyHours = weekStudySessions.reduce((sum, s) => sum + s.durationMin / 60, 0);

  return c.json({
    data: {
      goal,
      today: {
        calories: todayCaloriesTotal,
        sleepHours: todaySleep?.hours ?? null,
        calorieEntries: todayCalories,
      },
      week: {
        workouts: weekWorkouts,
        studyHours: Math.round(weekStudyHours * 10) / 10,
      },
    },
  });
});

export { dashboardRouter };
