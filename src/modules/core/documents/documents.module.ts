import { Module } from '@nestjs/common';
import { LoadsModule } from '@core/loads/loads.module';
import { StorageService } from './storage.service';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
    imports: [LoadsModule],
    controllers: [DocumentsController],
    providers: [DocumentsService, StorageService],
})
export class DocumentsModule {}
