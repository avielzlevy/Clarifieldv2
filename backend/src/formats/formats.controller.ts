// src/formats/formats.controller.ts
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

@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get()
  async getFormats() {
    const formats = await this.formatsService.getFormats();
    return formats;
  }

  @Get('amount')
  async getFormatsAmount() {
    const formats = await this.formatsService.getFormats();
    return { amount: Object.keys(formats).length };
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  async addFormat(
    @Body() body: CreateFormatDto,
  ): Promise<{ name: string; pattern: string; description?: string } | null> {
    const { name, pattern, description } = body;
    await this.formatsService.addFormat(name, { pattern, description });
    return { name, pattern };
  }
  @Put(':name')
  @UseGuards(JwtAuthGuard)
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
  @HttpCode(204)
  async deleteFormat(@Param() params: FormatNameDto): Promise<void> {
    const { name } = params;
    await this.formatsService.deleteFormat(name);
  }
}
