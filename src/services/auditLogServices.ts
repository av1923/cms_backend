import { prisma } from "../utils/db";

export async function logAudit(
  userId: string,
  userRole: string,
  action: string,
  courseId?: string,
  changedFields?: Record<string, any>,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        user_role: userRole,
        action,
        course_id: courseId,
        changed_fields: changedFields,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export async function getEvents(courseId?: string, eventType?: string, limit: number = 50) {
  const where: Record<string, any> = {};
  if (courseId) where.course_id = courseId;
  if (eventType) where.action = { contains: eventType };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { performed_at: "desc" },
    take: limit,
    include: {
      course: { select: { course_code: true, course_name: true } },
    },
  });

  return logs.map((log) => ({
    event: log.action,
    timestamp: log.performed_at.toISOString(),
    course_id: log.course_id,
    course_code: log.course?.course_code,
    course_name: log.course?.course_name,
    user_id: log.user_id,
    user_role: log.user_role,
    changed_fields: log.changed_fields,
    ip_address: log.ip_address,
  }));
}
