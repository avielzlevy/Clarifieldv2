import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return await this.settingsService.getSettings();
  }
  @UseGuards(JwtAuthGuard)
  @Put()
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return await this.settingsService.updateSettings(updateSettingsDto);
  }
}
