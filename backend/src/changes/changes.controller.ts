import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ChangesService } from './changes.service';
import { CreateChangeDto } from './changes.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
@Controller('changes')
@ApiTags('changes')
export class ChangesController {
  constructor(private readonly changesService: ChangesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all changes' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved changes.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getChanges(): Promise<Record<string, any[]>> {
    const changes = await this.changesService.getChanges();
    return changes;
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new change' })
  @ApiResponse({ status: 201, description: 'Change successfully added.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: CreateChangeDto })
  async addChange(@Body() createChangeDto: CreateChangeDto) {
    await this.changesService.addChange(createChangeDto);
    return createChangeDto;
  }
}
