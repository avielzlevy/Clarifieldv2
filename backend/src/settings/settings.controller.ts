import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('settings')
@ApiTags('Settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch all settings',
    description: 'Returns the current settings of the application.',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings fetched successfully',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found',
  })
  async getSettings() {
    return await this.settingsService.getSettings();
  }
  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update settings',
    description: 'Updates the application settings.',
  })
  @ApiBody({
    description: 'Settings data to update',
    type: UpdateSettingsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: Object,
  })
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return await this.settingsService.updateSettings(updateSettingsDto);
  }
}
