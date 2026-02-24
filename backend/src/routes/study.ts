import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../prisma";
import { auth } from "../auth";

const studyRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

studyRouter.get("/", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const { from, to } = c.req.query();
  const where: { userId: string; loggedAt?: { gte?: Date; lte?: Date } } = { userId: user.id };
  if (from || to) {
    where.loggedAt = {};
    if (from) where.loggedAt.gte = new Date(from);
    if (to) where.loggedAt.lte = new Date(to);
  }

  const sessions = await prisma.studySession.findMany({
    where,
    orderBy: { loggedAt: "desc" },
  });
  return c.json({ data: sessions });
});

studyRouter.post(
  "/",
  zValidator(
    "json",
    z.object({
      subject: z.string().min(1),
      durationMin: z.number().int().min(1),
      notes: z.string().optional(),
      loggedAt: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

    const body = c.req.valid("json");
    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        subject: body.subject,
        durationMin: body.durationMin,
        notes: body.notes,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      },
    });
    return c.json({ data: session }, 201);
  }
);

studyRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { message: "Unauthorized" } }, 401);

  const id = c.req.param("id");
  const session = await prisma.studySession.findFirst({ where: { id, userId: user.id } });
  if (!session) return c.json({ error: { message: "Not found" } }, 404);

  await prisma.studySession.delete({ where: { id } });
  return c.body(null, 204);
});

export { studyRouter };
