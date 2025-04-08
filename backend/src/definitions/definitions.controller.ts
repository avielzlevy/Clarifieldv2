// src/definitions/definitions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import { DefinitionsService, DefinitionData } from './definitions.service';
import {
  DefinitionNameDto,
  CreateDefinitionDto,
  UpdateDefinitionDto,
} from './definitions.dto';
// import { addChange } from '../utils/changes';

@Controller('definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Get()
  async getDefinitions(): Promise<{ [name: string]: DefinitionData }> {
    const definitions = await this.definitionsService.getDefinitions();
    return definitions;
  }

  @Get('amount')
  async getDefinitionsAmount() {
    const definitions = await this.definitionsService.getDefinitions();
    const definitionsAmount = Object.keys(definitions).length;
    return { amount: definitionsAmount };
  }

  @Get(':name')
  async getDefinition(@Param() params: DefinitionNameDto) {
    const definition = await this.definitionsService.getDefinition(params.name);
    return definition;
  }

  @Post()
  async addDefinition(@Body() body: CreateDefinitionDto) {
    const { name, format, description } = body;
    await this.definitionsService.addDefinition(name, {
      format,
      description: description || '',
    });
    return { name, format, description };
  }

  @Put(':name')
  async updateDefinition(
    @Param() params: DefinitionNameDto,
    @Body() body: UpdateDefinitionDto,
  ) {
    const { name } = params;
    const { format, description } = body;
    await this.definitionsService.updateDefinition(name, {
      format,
      description: description || '',
    });
    return { name, format, description };
  }

  @Delete(':name')
  @HttpCode(204)
  async deleteDefinition(@Param() params: DefinitionNameDto) {
    const { name } = params;
    await this.definitionsService.deleteDefinition(name);
  }
}
