/**
 * SMISSI — Database Seed Script
 * ─────────────────────────────
 * Creates the initial Super Admin account + default school,
 * so you can log into the admin portal immediately after setup.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/database/seed.ts
 *
 * Or add to package.json:
 *   "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts"
 *
 * Prerequisites:
 *   - .env file must exist and DB must be running
 *   - DB_SYNC=true OR migrations already applied
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type:        'postgres',
  host:        process.env.DB_HOST     ?? 'localhost',
  port:        parseInt(process.env.DB_PORT ?? '5432', 10),
  database:    process.env.DB_NAME     ?? 'smissi',
  username:    process.env.DB_USER     ?? 'smissi',
  password:    process.env.DB_PASSWORD ?? 'smissi_dev',
  entities:    [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true,
  logging:     false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅  Connected to database');

  const schoolRepo = AppDataSource.getRepository('schools');
  const userRepo   = AppDataSource.getRepository('users');

  // ── 1. Upsert default school ─────────────────────────────────────
  let school = await schoolRepo.findOne({ where: { code: 'SMISSI-001' } } as any);
  if (!school) {
    school = schoolRepo.create({
      name:     'SMISSI Secondary School',
      code:     'SMISSI-001',
      district: 'Ngara',
      address:  'P.O. Box 47, Ngara Sub-county',
      phone:    '+256 772 123 456',
      email:    'admin@smissi.ac.ug',
    });
    school = await schoolRepo.save(school);
    console.log(`✅  School created: ${school.name} (${school.id})`);
  } else {
    console.log(`ℹ️   School already exists: ${school.name}`);
  }

  // ── 2. Seed users ─────────────────────────────────────────────────
  const usersToSeed = [
    {
      firstName: 'Super',
      lastName:  'Admin',
      email:     'admin@smissi.ac.ug',
      password:  'Admin@1234',
      roles:     ['SUPER_ADMIN'],
      staffNo:   'ADM-001',
      phone:     '+256 772 000 001',
    },
    {
      firstName: 'Julius',
      lastName:  'Ssemanda',
      email:     'j.ssemanda@smissi.ac.ug',
      password:  'HT@smissi1',
      roles:     ['HEAD_TEACHER'],
      staffNo:   'STF-001',
      phone:     '+256 772 123 456',
    },
    {
      firstName: 'Emmanuel',
      lastName:  'Kato',
      email:     'e.kato@smissi.ac.ug',
      password:  'Bursar@1234',
      roles:     ['FINANCE_OFFICER'],
      staffNo:   'STF-002',
      phone:     '+256 772 234 567',
    },
    {
      firstName: 'Mary',
      lastName:  'Nakakande',
      email:     'm.nakakande@smissi.ac.ug',
      password:  'Teacher@1234',
      roles:     ['TEACHER'],
      staffNo:   'STF-003',
      phone:     '+256 772 345 678',
    },
    {
      firstName: 'Brian',
      lastName:  'Ssali',
      email:     'b.ssali@smissi.ac.ug',
      password:  'ECA@smissi1',
      roles:     ['ECA_OFFICER'],
      staffNo:   'STF-004',
      phone:     '+256 772 890 123',
    },
    {
      firstName: 'Joyce',
      lastName:  'Namukasa',
      email:     'j.namukasa@smissi.ac.ug',
      password:  'Counsel@1234',
      roles:     ['SCHOOL_COUNSELOR'],
      staffNo:   'STF-005',
      phone:     '+256 772 901 234',
    },
    {
      firstName: 'Rose',
      lastName:  'Nakamya',
      email:     'r.nakamya@smissi.ac.ug',
      password:  'Nurse@smissi1',
      roles:     ['NURSE'],
      staffNo:   'STF-006',
      phone:     '+256 772 678 901',
    },
  ];

  for (const u of usersToSeed) {
    const exists = await userRepo.findOne({ where: { email: u.email } } as any);
    if (exists) {
      console.log(`ℹ️   User already exists: ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = userRepo.create({
      ...u,
      passwordHash,
      schoolId: school.id,
      isActive:  true,
    });
    await userRepo.save(user);
    console.log(`✅  Created user: ${u.email}  (role: ${u.roles.join(', ')})  password: ${u.password}`);
  }

  await AppDataSource.destroy();
  console.log('\n🎉  Seed complete! You can now log in:');
  console.log('   Admin:      admin@smissi.ac.ug       / Admin@1234');
  console.log('   Head Teacher: j.ssemanda@smissi.ac.ug / HT@smissi1');
  console.log('   Bursar:     e.kato@smissi.ac.ug      / Bursar@1234');
  console.log('   Teacher:    m.nakakande@smissi.ac.ug / Teacher@1234');
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
