import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FormatsController } from './formats/formats.controller';
import { FormatsService } from './formats/formats.service';
import { DefinitionsController } from './definitions/definitions.controller';
import { DefinitionsService } from './definitions/definitions.service';

@Module({
  imports: [],
  controllers: [FormatsController, DefinitionsController],
  providers: [PrismaService, FormatsService, DefinitionsService],
})
export class AppModule {}
