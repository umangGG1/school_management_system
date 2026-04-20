import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { redisStore } from 'cache-manager-redis-yet';

import { AppCacheModule }  from './common/cache/cache.module';
import { QueuesModule }    from './common/queues/queues.module';
import { GatewaysModule }  from './common/gateways/gateways.module';
import { StorageModule }   from './common/storage/storage.module';
import { SmsModule }       from './common/sms/sms.module';
import { EmailModule }     from './common/email/email.module';
import { PdfModule }       from './common/pdf/pdf.module';
import { PaymentsModule }  from './common/payments/payments.module';
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

// ── Phase 4 Modules ───────────────────────────────────────────────────────────
import { PayrollModule }    from './payroll/payroll.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { UniformModule }    from './uniform/uniform.module';
import { StoreModule }      from './store/store.module';
import { SenModule }        from './sen/sen.module';
import { GateModule }       from './gate/gate.module';
import { EcaModule }        from './eca/eca.module';
import { ParentsModule }    from './parents/parents.module';
import { HealthController } from './health.controller';
import {
  getDatabaseConfigFromEnv,
  getRedisConfigFromEnv,
} from './common/config/runtime-config';


@Module({
  controllers: [HealthController],
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
      useFactory: (config: ConfigService) => {
        const database = getDatabaseConfigFromEnv();

        return {
          type: 'postgres',
          url: database.url,
          host: database.url ? undefined : database.host,
          port: database.url ? undefined : database.port,
          database: database.url ? undefined : database.database,
          username: database.url ? undefined : database.username,
          password: database.url ? undefined : database.password,
          ssl: database.ssl,
          entities: [__dirname + '/**/*.entity{.ts,.js}', __dirname + '/**/*.entities{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          // synchronize only in dev — set DB_SYNC=true in .env during development
          synchronize:
            config.get<string>('NODE_ENV') === 'development' &&
            config.get<string>('DB_SYNC') === 'true',
          logging: config.get<string>('NODE_ENV') === 'development',
          // Connection pool — prevents exhaustion under load
          extra: {
            max: config.get<number>('DB_POOL_MAX', 20),
            min: config.get<number>('DB_POOL_MIN', 2),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          },
        };
      },
    }),

    // ── Redis Cache (global — AppCacheService injectable everywhere) ──────────
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (_config: ConfigService) => ({
        store: await redisStore(getRedisConfigFromEnv()),
        ttl: 300_000, // 5 min default TTL in milliseconds
      }),
    }),
    AppCacheModule,
    QueuesModule,
    GatewaysModule,
    StorageModule,
    SmsModule,
    EmailModule,
    PdfModule,
    PaymentsModule,

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

    // ── Phase 4 Feature Modules ────────────────────────────────────────────────
    PayrollModule,
    FacilitiesModule,
    UniformModule,
    StoreModule,
    SenModule,
    GateModule,
    EcaModule,
    ParentsModule,

    // ── Dashboard (depends on all above) ─────────────────────────────────────
    DashboardModule,
  ],
})
export class AppModule {}
