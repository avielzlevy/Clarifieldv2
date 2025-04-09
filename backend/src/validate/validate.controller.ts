import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidateService } from './validate.service';

@Controller('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  async validate(@Body() data: any) {
    const errors = await this.validateService.validateData(data);
    if (errors.length > 0) {
      throw new HttpException({ errors }, HttpStatus.BAD_REQUEST);
    }
    return { message: 'All values are valid' };
  }
}
