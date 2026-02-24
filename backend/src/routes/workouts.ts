import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";

const workoutsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// GET /api/workouts - list workouts (with date range)
workoutsRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const { from, to } = c.req.query();
  const where: { userId: string; loggedAt?: { gte?: Date; lte?: Date } } = { userId: user.id };
  if (from || to) {
    where.loggedAt = {};
    if (from) where.loggedAt.gte = new Date(from);
    if (to) where.loggedAt.lte = new Date(to);
  }

  const workouts = await prisma.workout.findMany({
    where,
    orderBy: { loggedAt: "desc" },
  });
  return c.json({ data: workouts });
});

// POST /api/workouts - log a workout
workoutsRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      durationMin: z.number().int().min(1),
      notes: z.string().optional(),
      loggedAt: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

    const body = c.req.valid("json");
    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        name: body.name,
        type: body.type,
        durationMin: body.durationMin,
        notes: body.notes,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
    });
    return c.json({ data: workout }, 201);
  }
);

// DELETE /api/workouts/:id
workoutsRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const id = c.req.param("id");
  const workout = await prisma.workout.findFirst({ where: { id, userId: user.id } });
  if (!workout) return c.json({ error: { message: "Not found" } }, 404);

  await prisma.workout.delete({ where: { id } });
  return c.body(null, 204);
});

export { workoutsRouter };
