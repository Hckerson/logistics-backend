import { Module } from '@nestjs/common';
import { LoadsModule } from '@core/loads/loads.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
    imports: [LoadsModule],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule {}
