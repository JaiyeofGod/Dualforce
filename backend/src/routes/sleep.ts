import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";

const sleepRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

sleepRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const { from, to } = c.req.query();
  const where: { userId: string; loggedAt?: { gte?: Date; lte?: Date } } = { userId: user.id };
  if (from || to) {
    where.loggedAt = {};
    if (from) where.loggedAt.gte = new Date(from);
    if (to) where.loggedAt.lte = new Date(to);
  }

  const logs = await prisma.sleepLog.findMany({
    where,
    orderBy: { loggedAt: "desc" },
  });
  return c.json({ data: logs });
});

sleepRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      hours: z.number().min(0).max(24),
      quality: z.number().int().min(1).max(5).default(3),
      notes: z.string().optional(),
      loggedAt: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

    const body = c.req.valid("json");
    const log = await prisma.sleepLog.create({
      data: {
        userId: user.id,
        hours: body.hours,
        quality: body.quality ?? 3,
        notes: body.notes,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
    });
    return c.json({ data: log }, 201);
  }
);

sleepRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const id = c.req.param("id");
  const log = await prisma.sleepLog.findFirst({ where: { id, userId: user.id } });
  if (!log) return c.json({ error: { message: "Not found" } }, 404);

  await prisma.sleepLog.delete({ where: { id } });
  return c.body(null, 204);
});

export { sleepRouter };
