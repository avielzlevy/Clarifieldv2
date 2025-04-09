import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return await this.settingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return await this.settingsService.updateSettings(updateSettingsDto);
  }
}
