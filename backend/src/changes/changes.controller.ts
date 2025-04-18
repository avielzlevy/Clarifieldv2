import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ChangesService } from './changes.service';
import { CreateChangeDto } from './changes.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('changes')
export class ChangesController {
  constructor(private readonly changesService: ChangesService) {}

  @Get()
  async getChanges(): Promise<Record<string, any[]>> {
    const changes = await this.changesService.getChanges();
    return changes;
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  async addChange(@Body() createChangeDto: CreateChangeDto) {
    await this.changesService.addChange(createChangeDto);
    return createChangeDto;
  }
}
