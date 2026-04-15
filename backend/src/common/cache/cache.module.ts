import { Global, Module } from '@nestjs/common';
import { AppCacheService } from './cache.service';

/**
 * @Global so AppCacheService is injectable everywhere without
 * re-importing this module in every feature module.
 * Import once in AppModule.
 */
@Global()
@Module({
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
