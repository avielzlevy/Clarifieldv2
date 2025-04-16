import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { FormatsService } from './formats.service';
import { FormatNameDto, CreateFormatDto, UpdateFormatDto } from './formats.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Formats')
@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all formats' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all formats.',
    schema: {
      example: {
        pdf: { pattern: '\\.pdf$', description: 'PDF format' },
        custom: { pattern: '^.*$', description: 'Custom format' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFormats() {
    const formats = await this.formatsService.getFormats();
    return formats;
  }

  @Get('amount')
  @ApiOperation({ summary: 'Get total number of formats' })
  @ApiResponse({
    status: 200,
    description: 'Returns the count of available formats.',
    schema: { example: { amount: 5 } },
  })
  async getFormatsAmount() {
    const formats = await this.formatsService.getFormats();
    return { amount: Object.keys(formats).length };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new format' })
  @ApiBody({ type: CreateFormatDto })
  @ApiResponse({
    status: 201,
    description: 'Format successfully created.',
    schema: {
      example: {
        name: 'custom',
        pattern: '^.*$',
        description: 'Custom format',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Format already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addFormat(
    @Body() body: CreateFormatDto,
  ): Promise<{ name: string; pattern: string; description?: string } | null> {
    const { name, pattern, description } = body;
    await this.formatsService.addFormat(name, { pattern, description });
    return { name, pattern };
  }

  @Put(':name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a format by name' })
  @ApiParam({ name: 'name', type: 'string' })
  @ApiBody({ type: UpdateFormatDto })
  @ApiResponse({
    status: 200,
    description: 'Format successfully updated.',
    schema: {
      example: {
        name: 'custom',
        pattern: '^updated$',
        description: 'Updated format description',
      },
    },
  })
  @ApiResponse({ status: 406, description: 'Cannot update static format' })
  @ApiResponse({ status: 404, description: 'Format not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateFormat(
    @Param() params: FormatNameDto,
    @Body() body: UpdateFormatDto,
  ): Promise<{ name: string; pattern: string; description?: string } | null> {
    const { name } = params;
    const { pattern, description } = body;
    await this.formatsService.updateFormat(name, { pattern, description });
    return { name, pattern, description };
  }

  @Delete(':name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a format by name' })
  @ApiParam({ name: 'name', type: 'string' })
  @ApiResponse({ status: 204, description: 'Format successfully deleted.' })
  @ApiResponse({ status: 406, description: 'Cannot delete static format' })
  @ApiResponse({ status: 404, description: 'Format not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(204)
  async deleteFormat(@Param() params: FormatNameDto): Promise<void> {
    const { name } = params;
    await this.formatsService.deleteFormat(name);
  }
}
