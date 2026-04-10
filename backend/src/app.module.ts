import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Load .env into process.env and make ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Serve the 35 frontend HTML portals at /portals/*
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend_claude_artifacts'),
      serveRoot: '/portals',
      serveStaticOptions: { index: false },
    }),

    // Database connection — config values come from .env via ConfigService
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
        synchronize: false,   // never auto-alter schema in any environment
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class AppModule {}
