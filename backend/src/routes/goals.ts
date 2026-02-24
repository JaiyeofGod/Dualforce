import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";

const goalsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/goals - get user's goals
goalsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  let goal = await prisma.goal.findUnique({ where: { userId: user.id } });
  if (!goal) {
    // Create default goals
    goal = await prisma.goal.create({
      data: {
        userId: user.id,
        weeklyWorkouts: 3,
        weeklyStudyHours: 10,
        dailySleepHours: 8,
        dailyCalorieTarget: 2000,
      },
    });
  }
  return c.json({ data: goal });
});

// PUT /api/goals - update user's goals
goalsRouter.put(
  "/",
  zValidator(
    "json",
    z.object({
      weeklyWorkouts: z.number().int().min(0).max(14).optional(),
      weeklyStudyHours: z.number().min(0).max(168).optional(),
      dailySleepHours: z.number().min(0).max(24).optional(),
      dailyCalorieTarget: z.number().int().min(0).optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

    const body = c.req.valid("json");
    const goal = await prisma.goal.upsert({
      where: { userId: user.id },
      update: body,
      create: {
        userId: user.id,
        weeklyWorkouts: body.weeklyWorkouts ?? 3,
        weeklyStudyHours: body.weeklyStudyHours ?? 10,
        dailySleepHours: body.dailySleepHours ?? 8,
        dailyCalorieTarget: body.dailyCalorieTarget ?? 2000,
      },
    });
    return c.json({ data: goal });
  }
);

export { goalsRouter };
