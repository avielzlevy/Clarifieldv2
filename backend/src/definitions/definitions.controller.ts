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
  UseGuards,
} from '@nestjs/common';
import { DefinitionsService, DefinitionData } from './definitions.service';
import {
  DefinitionNameDto,
  CreateDefinitionDto,
  UpdateDefinitionDto,
} from './definitions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';

@Controller('definitions')
@ApiTags('Definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all definitions',
    description: 'Returns all available definitions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all definitions.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async getDefinitions(): Promise<{ [name: string]: DefinitionData }> {
    const definitions = await this.definitionsService.getDefinitions();
    return definitions;
  }

  @Get('amount')
  @ApiOperation({
    summary: 'Get total number of definitions',
    description: 'Returns the count of available definitions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the count of available definitions.',
    schema: { example: { amount: 5 } },
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async getDefinitionsAmount() {
    const definitions = await this.definitionsService.getDefinitions();
    const definitionsAmount = Object.keys(definitions).length;
    return { amount: definitionsAmount };
  }

  @Get(':name')
  @ApiOperation({
    summary: 'Get a specific definition by name',
    description: 'Returns the details of a specific definition.',
  })
  @ApiParam({
    name: 'name',
    description: 'Name of the definition to retrieve',
    example: 'pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the definition.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async getDefinition(@Param() params: DefinitionNameDto) {
    const definition = await this.definitionsService.getDefinition(params.name);
    return definition;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add a new definition',
    description: 'Creates a new definition with the provided details.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new definition.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Details of the definition to be created',
    type: CreateDefinitionDto,
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async addDefinition(@Body() body: CreateDefinitionDto) {
    const { name, format, description } = body;
    await this.definitionsService.addDefinition(name, {
      format,
      description: description || '',
    });
    return { name, format, description };
  }

  @Put(':name')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update an existing definition',
    description: 'Updates the details of an existing definition by name.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the definition.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Definition not found.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'name',
    description: 'Name of the definition to update',
    example: 'pdf',
  })
  @ApiBody({
    description: 'Details of the definition to be updated',
    type: UpdateDefinitionDto,
  })
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(':name')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a definition',
    description: 'Deletes a specific definition by name.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 204,
    description: 'Successfully deleted the definition.',
  })
  @ApiResponse({
    status: 404,
    description: 'Definition not found.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'name',
    description: 'Name of the definition to delete',
    example: 'pdf',
  })
  async deleteDefinition(@Param() params: DefinitionNameDto) {
    const { name } = params;
    await this.definitionsService.deleteDefinition(name);
  }
}
