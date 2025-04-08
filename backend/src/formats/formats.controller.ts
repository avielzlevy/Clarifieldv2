// src/formats/formats.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FormatsService } from './formats.service';
import staticFormats from '../data/staticFormats';
// import { addChange } from '../utils/changes';

@Controller('formats')
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get()
  async getFormats() {
    try {
      const dynamicFormats = await this.formatsService.getFormats();
      const allFormats = { ...staticFormats, ...dynamicFormats };
      return allFormats;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amount')
  async getFormatsAmount() {
    try {
      const dynamicFormats = await this.formatsService.getFormats();
      const allFormats = { ...staticFormats, ...dynamicFormats };
      return { amount: Object.keys(allFormats).length };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async addFormat(
    @Body() body: { name: string; pattern: string; description?: string },
  ) {
    const { name, pattern, description } = body;
    if (!name || !pattern) {
      throw new HttpException('Invalid format data', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.formatsService.addFormat(name, { pattern, description });
      //   await addChange({
      //     type: 'formats',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: '',
      //     after: { name, pattern, description },
      //   });
      // Return 201 Created status with the newly added format info.
      return { name, pattern };
    } catch (error) {
      if (error instanceof Error && error.message === 'Format already exists') {
        throw new HttpException('Format already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':name')
  async updateFormat(
    @Param('name') name: string,
    @Body() body: { pattern: string; description?: string },
  ) {
    const { pattern, description } = body;
    if (!name || !pattern) {
      throw new HttpException('Invalid format data', HttpStatus.BAD_REQUEST);
    }
    try {
      const dynamicFormats = await this.formatsService.getFormats();
      if (!dynamicFormats[name]) {
        if (Object.prototype.hasOwnProperty.call(staticFormats, name)) {
          throw new HttpException(
            'Cannot update static format',
            HttpStatus.FORBIDDEN,
          );
        }
        throw new HttpException('Format not found', HttpStatus.NOT_FOUND);
      }
      await this.formatsService.updateFormat(name, { pattern, description });
      //   await addChange({
      //     type: 'formats',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: dynamicFormats[name],
      //     after: { pattern, description },
      //   });
      // 204 No Content implies success with no payload.
      return { name, pattern, description };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':name')
  @HttpCode(204)
  async deleteFormat(@Param('name') name: string) {
    if (!name) {
      throw new HttpException('Invalid format data', HttpStatus.BAD_REQUEST);
    }
    try {
      const dynamicFormats = await this.formatsService.getFormats();
      if (!dynamicFormats[name]) {
        if (Object.prototype.hasOwnProperty.call(staticFormats, name)) {
          throw new HttpException(
            'Cannot delete static format',
            HttpStatus.FORBIDDEN,
          );
        }
        throw new HttpException('Format not found', HttpStatus.NOT_FOUND);
      }
      await this.formatsService.deleteFormat(name);
      //   await addChange({
      //     type: 'formats',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: dynamicFormats[name],
      //     after: '',
      //   });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
