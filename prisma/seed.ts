import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set!");
  console.error("Please create a .env file with DATABASE_URL=postgresql://...");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  await prisma.auditLog.deleteMany();
  await prisma.instructorAssignment.deleteMany();
  await prisma.prerequisite.deleteMany();
  await prisma.coursePricing.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();

  const ins1 = await prisma.instructor.create({
    data: { instructor_id: "INS-00042", instructor_name: "Dr. Maria Santos", email: "maria.santos@university.edu", department: "Computer Science" },
  });
  const ins2 = await prisma.instructor.create({
    data: { instructor_id: "INS-00055", instructor_name: "Prof. Juan Reyes", email: "juan.reyes@university.edu", department: "Computer Science" },
  });
  const ins3 = await prisma.instructor.create({
    data: { instructor_id: "INS-00089", instructor_name: "Dr. Ana Lopez", email: "ana.lopez@university.edu", department: "Mathematics" },
  });

  const c1 = await prisma.course.create({
    data: { course_id: "CRS-2024-0001", course_code: "CS101", course_name: "Introduction to Programming", course_type: "Lecture", units: 3, semester: "2024-2025-1", classification: "Core", status: "Active", section_capacity: 40, enrolled_count: 35, room_requirement: "SCI-201" },
  });
  const c2 = await prisma.course.create({
    data: { course_id: "CRS-2024-0002", course_code: "CS101L", course_name: "Intro to Programming Lab", course_type: "Lab", units: 1, semester: "2024-2025-1", classification: "Core", status: "Active", section_capacity: 30, enrolled_count: 28, room_requirement: "LAB-105" },
  });
  const c3 = await prisma.course.create({
    data: { course_id: "CRS-2024-0003", course_code: "CS100", course_name: "Fundamentals of Computing", course_type: "Lecture", units: 3, semester: "2024-2025-1", classification: "Core", status: "Active", section_capacity: 50, enrolled_count: 48 },
  });
  const c4 = await prisma.course.create({
    data: { course_id: "CRS-2024-0004", course_code: "MATH101", course_name: "College Algebra", course_type: "Lecture", units: 3, semester: "2024-2025-1", classification: "Core", status: "Active", section_capacity: 45, enrolled_count: 42 },
  });
  const c5 = await prisma.course.create({
    data: { course_id: "CRS-2024-0005", course_code: "CS201", course_name: "Data Structures", course_type: "Lecture", units: 3, semester: "2024-2025-1", classification: "Major", status: "Draft", section_capacity: 35, enrolled_count: 0 },
  });

  await prisma.coursePricing.createMany({
    data: [
      { course_id: c1.course_id, base_fee: 15000.00, lab_fee: null, currency: "PHP" },
      { course_id: c2.course_id, base_fee: 5000.00, lab_fee: 1500.00, currency: "PHP" },
      { course_id: c3.course_id, base_fee: 15000.00, lab_fee: null, currency: "PHP" },
      { course_id: c4.course_id, base_fee: 15000.00, lab_fee: null, currency: "PHP" },
      { course_id: c5.course_id, base_fee: 18000.00, lab_fee: null, currency: "PHP" },
    ],
  });

  await prisma.instructorAssignment.createMany({
    data: [
      { course_id: c1.course_id, instructor_id: ins1.instructor_id, section: "A", schedule: "MWF 08:00-09:00", room: "SCI-201", semester: "2024-2025-1" },
      { course_id: c2.course_id, instructor_id: ins2.instructor_id, section: "B", schedule: "TTh 10:00-12:00", room: "LAB-105", semester: "2024-2025-1" },
      { course_id: c3.course_id, instructor_id: ins3.instructor_id, section: "A", schedule: "MWF 10:00-11:00", room: "MATH-101", semester: "2024-2025-1" },
      { course_id: c4.course_id, instructor_id: ins3.instructor_id, section: "B", schedule: "TTh 13:00-14:30", room: "MATH-102", semester: "2024-2025-1" },
    ],
  });

  await prisma.prerequisite.createMany({
    data: [
      { course_id: c1.course_id, required_course_id: c3.course_id, requirement_type: "prerequisite" },
      { course_id: c1.course_id, required_course_id: c4.course_id, requirement_type: "prerequisite" },
      { course_id: c2.course_id, required_course_id: c1.course_id, requirement_type: "corequisite" },
      { course_id: c5.course_id, required_course_id: c1.course_id, requirement_type: "prerequisite" },
    ],
  });

  console.log("✅ Seed completed!");
  console.log("\n📧 Demo login:");
  console.log("   Email: maria.santos@university.edu");
  console.log("   Password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
