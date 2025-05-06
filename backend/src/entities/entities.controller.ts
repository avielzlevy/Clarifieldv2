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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { EntitiesService } from './entities.service';
import {
  CreateEntityDto,
  EntityNameDto,
  UpdateEntityDto,
} from './entities.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Entities')
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Entities fetched successfully' })
  @ApiResponse({ status: 500, description: 'Failed to fetch entities' })
  async getEntities() {
    const entities = await this.entitiesService.getEntities();
    return entities;
  }

  @Get('amount')
  @ApiOperation({ summary: 'Get count of all entities' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Entity count fetched successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to fetch entity count' })
  async getEntitiesAmount() {
    const entities = await this.entitiesService.getEntities();
    const amount = Object.keys(entities).length;
    return { amount };
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get an entity by name' })
  @ApiParam({ name: 'name', description: 'Entity name' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({ status: 200, description: 'Entity fetched successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({ status: 500, description: 'Failed to fetch entity' })
  async getEntity(@Param() params: EntityNameDto) {
    const { name } = params;
    const entity = await this.entitiesService.getEntity(name);
    return entity;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new entity' })
  @ApiBody({ type: CreateEntityDto })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 409, description: 'Entity already exists' })
  @ApiResponse({
    status: 406,
    description: 'Invalid field format or reference',
  })
  @ApiResponse({ status: 500, description: 'Failed to add entity' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async addEntity(@Body() body: CreateEntityDto) {
    const { label, fields } = body;
    await this.entitiesService.addEntity(label, { fields });
    return { fields };
  }

  @Put(':name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an entity' })
  @ApiParam({ name: 'name', description: 'Entity name' })
  @ApiBody({ type: UpdateEntityDto })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({
    status: 406,
    description: 'Invalid field format or reference',
  })
  @ApiResponse({ status: 500, description: 'Failed to update entity' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async updateEntity(
    @Param() params: EntityNameDto,
    @Body() body: UpdateEntityDto,
  ) {
    const { name } = params;
    const { fields } = body;
    await this.entitiesService.updateEntity(name, {
      fields: fields,
    });
    return { label: name, fields: body.fields };
  }

  @Delete(':label')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an entity' })
  @ApiParam({ name: 'label', description: 'Entity label to delete' })
  @ApiResponse({ status: 204, description: 'Entity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete entity' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async deleteEntity(@Param('label') label: string) {
    await this.entitiesService.deleteEntity(label);
  }
}
