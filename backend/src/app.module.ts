import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { StudentsModule } from './students/students.module';
import { AcademicModule } from './academic/academic.module';
import { StaffModule } from './staff/staff.module';
import { FinanceModule } from './finance/finance.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityModule } from './activity/activity.module';
import { DashboardModule } from './dashboard/dashboard.module';

// ── New modules ───────────────────────────────────────────────────────────────
import { AnnouncementsModule } from './announcements/announcements.module';
import { CalendarModule } from './calendar/calendar.module';
import { BoardingModule } from './boarding/boarding.module';
import { MedicalModule } from './medical/medical.module';
import { SecurityModule } from './security/security.module';
import { HodModule } from './hod/hod.module';
import { MessagingModule } from './messaging/messaging.module';
import { ExamModule } from './exam/exam.module';
import { CounselingModule } from './counseling/counseling.module';
import { AdminModule }   from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend_claude_artifacts'),
      serveRoot: '/portals',
      serveStaticOptions: { index: false },
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get<string>('DB_NAME', 'smissi'),
        username: config.get<string>('DB_USER', 'smissi'),
        password: config.get<string>('DB_PASSWORD', 'smissi_dev'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        // synchronize only in dev — set DB_SYNC=true in .env during development
        synchronize:
          config.get<string>('NODE_ENV') === 'development' &&
          config.get<string>('DB_SYNC') === 'true',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // ── Core Modules ─────────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    AcademicModule,
    StaffModule,
    FinanceModule,
    ApprovalsModule,
    NotificationsModule,
    ActivityModule,

    // ── New Feature Modules ───────────────────────────────────────────────────
    AnnouncementsModule,
    CalendarModule,
    BoardingModule,
    MedicalModule,
    SecurityModule,
    HodModule,
    MessagingModule,
    ExamModule,
    CounselingModule,

    // ── Admin Portal ─────────────────────────────────────────────────────────
    AdminModule,

    // ── Reports ───────────────────────────────────────────────────────────────
    ReportsModule,

    // ── Dashboard (depends on all above) ─────────────────────────────────────
    DashboardModule,
  ],
})
export class AppModule {}
