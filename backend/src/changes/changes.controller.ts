import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ChangesService } from './changes.service';
import { CreateChangeDto } from './changes.dto';

@Controller('changes')
export class ChangesController {
  constructor(private readonly changesService: ChangesService) {}

  @Get()
  async getChanges(): Promise<Record<string, any[]>> {
    const changes = await this.changesService.getChanges();
    return changes;
  }

  @Post()
  @HttpCode(201)
  async addChange(@Body() createChangeDto: CreateChangeDto) {
    await this.changesService.addChange(createChangeDto);
    return createChangeDto;
  }
}
