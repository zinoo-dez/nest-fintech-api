import { Controller, Post, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async runSeed() {
    return this.seedService.seedAllEntities();
  }

  @Get('summary')
  async getSummary() {
    return this.seedService.getDatabaseSummary();
  }
}
