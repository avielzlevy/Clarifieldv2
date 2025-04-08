// src/definitions/definitions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpCode,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { DefinitionsService } from './definitions.service';
import { FormatsService } from '../formats/formats.service';
// import { addChange } from '../utils/changes';

@Controller('definitions')
export class DefinitionsController {
  constructor(
    private readonly definitionsService: DefinitionsService,
    private readonly formatsService: FormatsService,
  ) {}

  @Get()
  async getDefinitions() {
    const definitions = await this.definitionsService.getDefinitions();
    return definitions;
  }

  @Get('amount')
  async getDefinitionsAmount() {
    try {
      const definitions = await this.definitionsService.getDefinitions();
      const definitionsAmount = Object.keys(definitions).length;
      return { amount: definitionsAmount };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  @Get(':name')
  async getDefinition(@Param('name') name: string) {
    if (!name) {
      throw new BadRequestException('Invalid definition name');
    }
    try {
      const definition = await this.definitionsService.getDefinition(name);
      if (!definition) {
        throw new NotFoundException('Definition not found');
      }
      return definition;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException('Definition not found');
      }
      throw new InternalServerErrorException();
    }
  }

  @Post()
  async addDefinition(
    @Body() body: { name: string; format: string; description?: string },
  ) {
    const { name, format, description } = body;
    if (!name || !format) {
      throw new BadRequestException('Invalid definition data');
    }
    try {
      if (!(await this.formatsService.formatExists(name))) {
        throw new NotAcceptableException('Format does not exist');
      }
      await this.definitionsService.addDefinition(name, {
        format,
        description: description || '',
      });
      //   await addChange({
      //     type: 'definitions',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: '',
      //     after: { name, format, description },
      //   });
      // Return 201 Created with the added definition info
      return { name, format, description };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  @Put(':name')
  async updateDefinition(
    @Param('name') name: string,
    @Body() body: { format: string; description?: string },
  ) {
    if (!name) {
      throw new BadRequestException('Invalid definition name');
    }
    const { format, description } = body;
    if (!format) {
      throw new BadRequestException('Invalid definition data');
    }
    try {
      const existingDefinition =
        await this.definitionsService.getDefinition(name);
      if (!existingDefinition) {
        throw new NotFoundException('Definition not found');
      }
      if (!(await this.formatsService.formatExists(name))) {
        throw new NotAcceptableException('Format does not exist');
      }
      await this.definitionsService.updateDefinition(name, {
        format,
        description: description || '',
      });
      // await addChange({
      //   type: 'definitions',
      //   name,
      //   timestamp: new Date().toISOString(),
      //   before: existingDefinition,
      //   after: { name, format, description },
      // });
      return { name, format, description };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  @Delete(':name')
  @HttpCode(204)
  async deleteDefinition(@Param('name') name: string) {
    if (!name) {
      throw new BadRequestException('Invalid definition name');
    }
    try {
      const definition = await this.definitionsService.getDefinition(name);
      if (!definition) {
        throw new NotFoundException('Definition not found');
      }
      await this.definitionsService.deleteDefinition(name);
      //   await addChange({
      //     type: 'definitions',
      //     name,
      //     timestamp: new Date().toISOString(),
      //     before: definition,
      //     after: '',
      //   });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
