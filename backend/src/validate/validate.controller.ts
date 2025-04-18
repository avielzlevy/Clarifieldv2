import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValidateService } from './validate.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('validate')
@ApiTags('validate')
export class ValidateController {
  constructor(private readonly validateService: ValidateService) {}

  @Post()
  @ApiOperation({
    summary: 'Validate data against predefined rules',
    description: 'Validates the provided data against predefined rules.',
  })
  @ApiBody({
    description: 'Data to validate',
    type: Object,
  })
  @ApiResponse({
    status: 200,
    description: 'Validation successful',
    schema: {
      example: {
        message: 'All values are valid',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      example: {
        errors: [
          {
            field: 'fieldName',
            message: 'Error message for the field',
          },
        ],
      },
    },
  })
  async validate(@Body() data: any) {
    const errors = await this.validateService.validateData(data);
    if (errors.length > 0) {
      throw new HttpException({ errors }, HttpStatus.BAD_REQUEST);
    }
    return { message: 'All values are valid' };
  }
}
