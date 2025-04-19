import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AffectedService } from './affected.service';
import { AffectedDto } from './affected.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('affected')
@ApiTags('Affected')
export class AffectedController {
  constructor(private readonly affectedService: AffectedService) {}

  @Get()
  @ApiOperation({ summary: 'Get affected entities' })
  @ApiQuery({
    name: 'query',
    type: AffectedDto,
    description: 'Query parameters for affected entities',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved affected entities',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAffected(@Query() query: AffectedDto) {
    try {
      return await this.affectedService.getAffected(query);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
