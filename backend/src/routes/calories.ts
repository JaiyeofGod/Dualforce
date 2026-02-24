import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";

const caloriesRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

caloriesRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const { from, to } = c.req.query();
  const where: { userId: string; loggedAt?: { gte?: Date; lte?: Date } } = { userId: user.id };
  if (from || to) {
    where.loggedAt = {};
    if (from) where.loggedAt.gte = new Date(from);
    if (to) where.loggedAt.lte = new Date(to);
  }

  const logs = await prisma.calorieLog.findMany({
    where,
    orderBy: { loggedAt: "desc" },
  });
  return c.json({ data: logs });
});

caloriesRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      foodName: z.string().min(1),
      calories: z.number().int().min(0),
      meal: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]).default("other"),
      notes: z.string().optional(),
      loggedAt: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

    const body = c.req.valid("json");
    const log = await prisma.calorieLog.create({
      data: {
        userId: user.id,
        foodName: body.foodName,
        calories: body.calories,
        meal: body.meal ?? "other",
        notes: body.notes,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
    });
    return c.json({ data: log }, 201);
  }
);

caloriesRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const id = c.req.param("id");
  const log = await prisma.calorieLog.findFirst({ where: { id, userId: user.id } });
  if (!log) return c.json({ error: { message: "Not found" } }, 404);

  await prisma.calorieLog.delete({ where: { id } });
  return c.body(null, 204);
});

export { caloriesRouter };
