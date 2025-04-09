// src/entities/entities.controller.ts
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
import { EntitiesService } from './entities.service';
import {
  CreateEntityDto,
  EntityNameDto,
  UpdateEntityDto,
} from './entities.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  async getEntities() {
    const entities = await this.entitiesService.getEntities();
    return entities;
  }

  @Get('amount')
  async getEntitiesAmount() {
    const entities = await this.entitiesService.getEntities();
    const amount = Object.keys(entities).length;
    return { amount };
  }

  @Get(':name')
  async getEntity(@Param() params: EntityNameDto) {
    const { name } = params;
    const entity = await this.entitiesService.getEntity(name);
    return entity;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addEntity(@Body() body: CreateEntityDto) {
    const { label, fields } = body;
    await this.entitiesService.addEntity(label, { label, fields });
    return { label, fields };
  }

  @Put(':name')
  @UseGuards(JwtAuthGuard)
  async updateEntity(
    @Param() params: EntityNameDto,
    @Body() body: UpdateEntityDto,
  ) {
    const { name } = params;
    const { fields } = body;
    await this.entitiesService.updateEntity(name, {
      label: name,
      fields: fields,
    });
    return { label: name, fields: body.fields };
  }

  @Delete(':label')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteEntity(@Param('label') label: string) {
    await this.entitiesService.deleteEntity(label);
  }
}
