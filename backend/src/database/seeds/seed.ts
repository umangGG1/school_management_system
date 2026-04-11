/**
 * SMISSI Seed Script
 * Usage: npm run seed
 *
 * Seeds:
 * - 1 Demo school
 * - 22 User accounts (all roles) with hashed passwords
 * - 6 Classes (S1–S6), 10 subjects
 * - 5 Departments
 * - 3 Announcements
 * - 5 Calendar events
 * - 2 Dormitories + rooms
 * - Sample sick bay visit
 * - Sample security incident
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'smissi',
  username: process.env.DB_USER ?? 'smissi',
  password: process.env.DB_PASSWORD ?? 'smissi_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // ─── 1. School ──────────────────────────────────────────────────────────────
  const schoolRepo = AppDataSource.getRepository('schools');
  let school = await schoolRepo.findOne({ where: { name: 'SMISSI Secondary School' } });
  if (!school) {
    school = schoolRepo.create({
      name: 'SMISSI Secondary School',
      address: 'Plot 12, Kampala Road, Wakiso District',
      phone: '+256 700 000 000',
      email: 'admin@smissi.ac.ug',
      country: 'Uganda',
      currency: 'UGX',
      isActive: true,
    });
    school = await schoolRepo.save(school);
    console.log('✅ School created');
  }
  const schoolId = school.id;

  // ─── 2. Users ───────────────────────────────────────────────────────────────
  const userRepo = AppDataSource.getRepository('users');

  const users = [
    { email: 'j.ssemanda@smissi.ac.ug',    firstName: 'Julius',    lastName: 'Ssemanda',   roles: 'HEAD_TEACHER',          pw: 'demo1234' },
    { email: 'r.tumwebaze@smissi.ac.ug',    firstName: 'Robert',    lastName: 'Tumwebaze',  roles: 'DEPUTY_HEAD',           pw: 'demo1234' },
    { email: 'k.peter@smissi.ac.ug',        firstName: 'Peter',     lastName: 'Kato',       roles: 'HOD',                   pw: 'demo1234' },
    { email: 'exam.officer@smissi.ac.ug',   firstName: 'Sarah',     lastName: 'Namutebi',   roles: 'EXAMINATIONS_OFFICER',  pw: 'demo1234' },
    { email: 'm.byamugisha@smissi.ac.ug',   firstName: 'Michael',   lastName: 'Byamugisha', roles: 'TEACHER',               pw: 'demo1234' },
    { email: 'p.mwesige@smissi.ac.ug',      firstName: 'Patrick',   lastName: 'Mwesige',    roles: 'TEACHER',               pw: 'demo1234' },
    { email: 'r.nakabugo@smissi.ac.ug',     firstName: 'Ruth',      lastName: 'Nakabugo',   roles: 'TEACHER',               pw: 'demo1234' },
    { email: 'd.kakooza@smissi.ac.ug',      firstName: 'David',     lastName: 'Kakooza',    roles: 'TEACHER',               pw: 'demo1234' },
    { email: 'finance@smissi.ac.ug',        firstName: 'Grace',     lastName: 'Nakato',     roles: 'FINANCE_OFFICER',       pw: 'demo1234' },
    { email: 'payroll@smissi.ac.ug',        firstName: 'Moses',     lastName: 'Lubwama',    roles: 'PAYROLL_OFFICER',       pw: 'demo1234' },
    { email: 'hr@smissi.ac.ug',             firstName: 'Agnes',     lastName: 'Nambooze',   roles: 'HR_OFFICER',             pw: 'demo1234' },
    { email: 'dorm.master@smissi.ac.ug',    firstName: 'James',     lastName: 'Opolot',     roles: 'BOARDING_MASTER',       pw: 'demo1234' },
    { email: 'hob@smissi.ac.ug',            firstName: 'Mary',      lastName: 'Atim',       roles: 'HEAD_OF_BOARDING',      pw: 'demo1234' },
    { email: 'nurse@smissi.ac.ug',          firstName: 'Josephine', lastName: 'Nakamya',    roles: 'NURSE',                 pw: 'demo1234' },
    { email: 'gate1@smissi.ac.ug',          firstName: 'John',      lastName: 'Mukasa',     roles: 'GATE_GUARD',            pw: 'demo1234' },
    { email: 'security@smissi.ac.ug',       firstName: 'Alex',      lastName: 'Ssali',      roles: 'HEAD_OF_SECURITY',      pw: 'demo1234' },
    { email: 'eca@smissi.ac.ug',            firstName: 'Brian',     lastName: 'Ssekandi',   roles: 'ECA_OFFICER',           pw: 'demo1234' },
    { email: 'comms@smissi.ac.ug',          firstName: 'Diana',     lastName: 'Nansubuga',  roles: 'COMMUNICATIONS_OFFICER',pw: 'demo1234' },
    { email: 'uniform@smissi.ac.ug',        firstName: 'Fred',      lastName: 'Lubega',     roles: 'UNIFORM_OFFICER',       pw: 'demo1234' },
    { email: 'facilities@smissi.ac.ug',     firstName: 'Kenneth',   lastName: 'Muwanga',    roles: 'FACILITIES_MANAGER',    pw: 'demo1234' },
    { email: 'counselor@smissi.ac.ug',      firstName: 'Irene',     lastName: 'Namukasa',   roles: 'SCHOOL_COUNSELOR',      pw: 'demo1234' },
    { email: 'admin@smissi.ac.ug',          firstName: 'Super',     lastName: 'Admin',      roles: 'SUPER_ADMIN',           pw: 'admin9999' },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of users) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      user = userRepo.create({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: await hash(u.pw),
        roles: u.roles,
        schoolId,
        isActive: true,
      });
      user = await userRepo.save(user);
    }
    createdUsers[u.roles] = user;
  }
  console.log(`✅ ${users.length} users seeded`);

  // ─── 3. Classes ─────────────────────────────────────────────────────────────
  const classRepo = AppDataSource.getRepository('school_classes');
  for (const name of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']) {
    const existing = await classRepo.findOne({ where: { name, schoolId } });
    if (!existing) await classRepo.save(classRepo.create({ name, schoolId }));
  }
  console.log('✅ 6 classes seeded');

  // ─── 4. Subjects ────────────────────────────────────────────────────────────
  const subjectRepo = AppDataSource.getRepository('subjects');
  for (const name of ['Biology','Chemistry','Physics','Mathematics','Additional Mathematics','English Language','Literature in English','History','Geography','Computer Science']) {
    const existing = await subjectRepo.findOne({ where: { name, schoolId } });
    if (!existing) await subjectRepo.save(subjectRepo.create({ name, schoolId }));
  }
  console.log('✅ 10 subjects seeded');

  // ─── 5. Departments ─────────────────────────────────────────────────────────
  const deptRepo = AppDataSource.getRepository('departments');
  const depts = [
    { name: 'Sciences', code: 'SCI', hodId: createdUsers['HOD']?.id },
    { name: 'Mathematics', code: 'MTH' },
    { name: 'Languages', code: 'LNG' },
    { name: 'Humanities', code: 'HUM' },
    { name: 'Technical', code: 'TEC' },
  ];
  for (const d of depts) {
    const existing = await deptRepo.findOne({ where: { name: d.name, schoolId } });
    if (!existing) await deptRepo.save(deptRepo.create({ ...d, schoolId }));
  }
  console.log('✅ 5 departments seeded');

  // ─── 6. Announcements ───────────────────────────────────────────────────────
  const annRepo = AppDataSource.getRepository('announcements');
  const announcements = [
    { title: 'End of Term Exams Schedule Released', body: 'Exams begin Monday 16th March. All students must attend.', category: 'ACADEMIC', targetAudience: 'ALL', isPinned: true, createdById: createdUsers['HEAD_TEACHER']?.id },
    { title: 'Fee Payment Deadline — Friday 13th March', body: 'All outstanding fees must be cleared by Friday 13th March. Students with unpaid fees cannot sit exams.', category: 'ADMINISTRATIVE', targetAudience: 'ALL_STUDENTS', isPinned: true, createdById: createdUsers['HEAD_TEACHER']?.id },
    { title: 'UNEB Inspection — Thursday 13th March', body: 'UNEB inspectors visit Thursday. All HODs must submit schemes of work to DHM by Wednesday.', category: 'URGENT', targetAudience: 'ALL_STAFF', isPinned: true, createdById: createdUsers['DEPUTY_HEAD']?.id },
  ];
  for (const a of announcements) {
    const existing = await annRepo.findOne({ where: { title: a.title, schoolId } });
    if (!existing) await annRepo.save(annRepo.create({ ...a, schoolId, publishedAt: new Date() }));
  }
  console.log('✅ 3 announcements seeded');

  // ─── 7. Calendar Events ─────────────────────────────────────────────────────
  const calRepo = AppDataSource.getRepository('calendar_events');
  const events = [
    { title: 'End of Term Exams Begin', date: '2026-03-16', type: 'EXAM', allDay: true },
    { title: 'UNEB Inspection', date: '2026-03-13', type: 'ACADEMIC', allDay: true },
    { title: 'Sciences Department Meeting', date: '2026-03-12', type: 'MEETING', venue: 'Boardroom' },
    { title: 'Inter-House Sports Day', date: '2026-03-20', type: 'SPORTS', allDay: true },
    { title: 'Term 1 Ends', date: '2026-03-28', type: 'ACADEMIC', allDay: true },
  ];
  for (const e of events) {
    const existing = await calRepo.findOne({ where: { title: e.title, schoolId } });
    if (!existing) await calRepo.save(calRepo.create({ ...e, schoolId, createdById: createdUsers['HEAD_TEACHER']?.id }));
  }
  console.log('✅ 5 calendar events seeded');

  // ─── 8. Dormitories ─────────────────────────────────────────────────────────
  const dormRepo = AppDataSource.getRepository('dormitories');
  for (const d of [{ name: 'Nile House (Boys)', gender: 'BOYS', capacity: 120 }, { name: 'Victoria House (Girls)', gender: 'GIRLS', capacity: 110 }]) {
    const existing = await dormRepo.findOne({ where: { name: d.name, schoolId } });
    if (!existing) await dormRepo.save(dormRepo.create({ ...d, schoolId }));
  }
  console.log('✅ 2 dormitories seeded');

  // ─── 9. Security Incident ───────────────────────────────────────────────────
  const incidentRepo = AppDataSource.getRepository('security_incidents');
  const incident = await incidentRepo.findOne({ where: { schoolId, title: 'Unauthorized visitor at Gate 2' } });
  if (!incident) {
    await incidentRepo.save(incidentRepo.create({
      schoolId, title: 'Unauthorized visitor at Gate 2',
      description: 'Unknown individual attempted to enter without ID. Refused entry.', severity: 'MEDIUM', status: 'RESOLVED',
      reportedById: createdUsers['GATE_GUARD']?.id, resolvedAt: new Date(), resolutionNotes: 'Visitor escorted off premises.',
    }));
    console.log('✅ 1 security incident seeded');
  }

  // ─── 10. Sick Bay Visit ─────────────────────────────────────────────────────
  const visitRepo = AppDataSource.getRepository('sick_bay_visits');
  if ((await visitRepo.count({ where: { schoolId } })) === 0) {
    await visitRepo.save(visitRepo.create({
      schoolId, complaint: 'Headache and fever', temperature: 38.5,
      diagnosis: 'Viral infection', treatment: 'Paracetamol 500mg, rest prescribed.',
      status: 'OBSERVATION', attendedById: createdUsers['NURSE']?.id,
    }));
    console.log('✅ 1 sick bay visit seeded');
  }

  await AppDataSource.destroy();
  console.log('\n🎉 SMISSI seed complete!\n');
  console.log('Demo accounts (password: demo1234 | Super Admin: admin9999):');
  users.forEach((u) => console.log(`  ${u.roles.padEnd(25)} → ${u.email}`));
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
