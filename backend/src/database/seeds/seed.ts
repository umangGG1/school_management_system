import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME ?? 'smissi',
        username: process.env.DB_USER ?? 'smissi',
        password: process.env.DB_PASSWORD ?? 'smissi_dev',
      }),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}', __dirname + '/../../**/*.entities{.ts,.js}'],
  synchronize: true,
  logging: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // ─── School ─────────────────────────────────────────────────────────────────
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

  // ─── Users ──────────────────────────────────────────────────────────────────
  const userRepo = AppDataSource.getRepository('users');

  const users = [
    { email: 'j.ssemanda@smissi.ac.ug',  firstName: 'Julius',    lastName: 'Ssemanda',   roles: 'HEAD_TEACHER',           pw: 'demo1234' },
    { email: 'r.tumwebaze@smissi.ac.ug',  firstName: 'Robert',    lastName: 'Tumwebaze',  roles: 'DEPUTY_HEAD',            pw: 'demo1234' },
    { email: 'k.peter@smissi.ac.ug',      firstName: 'Peter',     lastName: 'Kato',       roles: 'HOD',                    pw: 'demo1234' },
    { email: 'exam.officer@smissi.ac.ug', firstName: 'Sarah',     lastName: 'Namutebi',   roles: 'EXAMINATIONS_OFFICER',   pw: 'demo1234' },
    { email: 'm.byamugisha@smissi.ac.ug', firstName: 'Michael',   lastName: 'Byamugisha', roles: 'TEACHER',                pw: 'demo1234' },
    { email: 'finance@smissi.ac.ug',      firstName: 'Grace',     lastName: 'Nakato',     roles: 'FINANCE_OFFICER',        pw: 'demo1234' },
    { email: 'payroll@smissi.ac.ug',      firstName: 'Moses',     lastName: 'Lubwama',    roles: 'PAYROLL_OFFICER',        pw: 'demo1234' },
    { email: 'hr@smissi.ac.ug',           firstName: 'Agnes',     lastName: 'Nambooze',   roles: 'HR_OFFICER',             pw: 'demo1234' },
    { email: 'dorm.master@smissi.ac.ug',  firstName: 'James',     lastName: 'Opolot',     roles: 'BOARDING_MASTER',        pw: 'demo1234' },
    { email: 'hob@smissi.ac.ug',          firstName: 'Mary',      lastName: 'Atim',       roles: 'HEAD_OF_BOARDING',       pw: 'demo1234' },
    { email: 'nurse@smissi.ac.ug',        firstName: 'Josephine', lastName: 'Nakamya',    roles: 'NURSE',                  pw: 'demo1234' },
    { email: 'gate1@smissi.ac.ug',        firstName: 'John',      lastName: 'Mukasa',     roles: 'GATE_GUARD',             pw: 'demo1234' },
    { email: 'security@smissi.ac.ug',     firstName: 'Alex',      lastName: 'Ssali',      roles: 'HEAD_OF_SECURITY',       pw: 'demo1234' },
    { email: 'eca@smissi.ac.ug',          firstName: 'Brian',     lastName: 'Ssekandi',   roles: 'ECA_OFFICER',            pw: 'demo1234' },
    { email: 'counselor@smissi.ac.ug',    firstName: 'Irene',     lastName: 'Namukasa',   roles: 'SCHOOL_COUNSELOR',       pw: 'demo1234' },
    { email: 'facilities@smissi.ac.ug',   firstName: 'Kenneth',   lastName: 'Muwanga',    roles: 'FACILITIES_MANAGER',     pw: 'demo1234' },
    { email: 'uniform@smissi.ac.ug',      firstName: 'Fred',      lastName: 'Lubega',     roles: 'UNIFORM_OFFICER',        pw: 'demo1234' },
    { email: 'comms@smissi.ac.ug',        firstName: 'Diana',     lastName: 'Nansubuga',  roles: 'COMMUNICATIONS_OFFICER', pw: 'demo1234' },
    { email: 'admin@smissi.ac.ug',        firstName: 'Super',     lastName: 'Admin',      roles: 'SUPER_ADMIN',            pw: 'admin9999' },
  ];

  for (const u of users) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepo.save(userRepo.create({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: await hash(u.pw),
        roles: u.roles,
        schoolId,
        isActive: true,
      }));
    }
  }
  console.log(`✅ ${users.length} users seeded`);

  // ─── Staff Members ──────────────────────────────────────────────────────────
  const staffRepo = AppDataSource.getRepository('staff_members');
  const existingStaff = await staffRepo.count({ where: { schoolId } });
  if (existingStaff === 0) {
    const staffSeed = [
      { employeeNumber: 'E001', firstName: 'Nakakande',  lastName: 'Komurembe', position: 'HOD Mathematics',  department: 'Mathematics', phone: '+256 700 100 001' },
      { employeeNumber: 'E002', firstName: 'Byamugisha', lastName: 'Kizza',     position: 'Chemistry Teacher', department: 'Sciences',     phone: '+256 700 100 002' },
      { employeeNumber: 'E003', firstName: 'Opolot',     lastName: 'Samuel',    position: 'History Teacher',   department: 'Humanities',   phone: '+256 700 100 003' },
      { employeeNumber: 'E004', firstName: 'Atim',       lastName: 'Norah',     position: 'HOD English',       department: 'Languages',    phone: '+256 700 100 004' },
      { employeeNumber: 'E005', firstName: 'Kato',       lastName: 'Peter',     position: 'Biology Teacher',   department: 'Sciences',     phone: '+256 700 100 005' },
      { employeeNumber: 'E006', firstName: 'Nakato',     lastName: 'Grace',     position: 'Finance Officer',   department: 'Finance',      phone: '+256 700 100 006' },
      { employeeNumber: 'E007', firstName: 'Opolot',     lastName: 'James',     position: 'Dorm Master',       department: 'Boarding',     phone: '+256 700 100 007' },
      { employeeNumber: 'E008', firstName: 'Nakamya',    lastName: 'Josephine', position: 'School Nurse',      department: 'Health',       phone: '+256 700 100 008' },
      { employeeNumber: 'E009', firstName: 'Ssali',      lastName: 'Alex',      position: 'Head of Security',  department: 'Security',     phone: '+256 700 100 009' },
      { employeeNumber: 'E010', firstName: 'Ssekandi',   lastName: 'Brian',     position: 'ECA Officer',       department: 'Co-Curricular', phone: '+256 700 100 010' },
    ];
    for (const s of staffSeed) {
      await staffRepo.save(staffRepo.create({ ...s, schoolId, isActive: true }));
    }
    console.log(`✅ ${staffSeed.length} staff members seeded`);
  } else {
    console.log(`ℹ️  Staff members already seeded (${existingStaff} found)`);
  }

  await AppDataSource.destroy();
  console.log('\n✅ Seed complete\n');
  console.log('Login credentials (password: demo1234 | Super Admin: admin9999):');
  users.forEach((u) => console.log(`  ${u.roles.padEnd(25)} → ${u.email}`));
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
