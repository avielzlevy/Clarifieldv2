import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AffectedService } from './affected.service';
import { AffectedDto } from './affected.dto';

@Controller('affected')
export class AffectedController {
  constructor(private readonly affectedService: AffectedService) {}

  @Get()
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
