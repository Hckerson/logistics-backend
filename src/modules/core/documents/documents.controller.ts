import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@core/auth/decorators/current-user.decorator';
import { ApiEnvelope } from '@common/decorators/api-envelope.decorator';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '@core/auth/types/auth.types';
import {
    DocumentDto,
    DownloadLinkDto,
    UploadRequestDto,
    UploadTicketDto,
} from './dto';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DocumentsController {
    constructor(private readonly documents: DocumentsService) {}

    @Get('loads/:loadId/documents')
    @ApiOperation({ summary: 'Documents attached to a load' })
    @ApiEnvelope(DocumentDto, { isArray: true })
    list(@CurrentUser() user: AuthUser, @Param('loadId') loadId: string) {
        return this.documents.list(user, loadId);
    }

    @Post('loads/:loadId/documents')
    @ApiOperation({
        summary: 'Reserve a document and get a presigned upload URL',
    })
    @ApiEnvelope(UploadTicketDto, { status: 201 })
    @ApiResponse({ status: 503, description: 'Storage not configured' })
    requestUpload(
        @CurrentUser() user: AuthUser,
        @Param('loadId') loadId: string,
        @Body() dto: UploadRequestDto,
    ) {
        return this.documents.requestUpload(user, loadId, dto);
    }

    @Post('documents/:documentId/complete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Confirm the upload reached storage; queues the scan',
    })
    @ApiEnvelope(DocumentDto)
    @ApiResponse({ status: 422, description: 'Stored file does not match' })
    complete(
        @CurrentUser() user: AuthUser,
        @Param('documentId') documentId: string,
    ) {
        return this.documents.complete(user, documentId);
    }

    @Get('documents/:documentId/download')
    @ApiOperation({ summary: 'Signed download URL, valid five minutes' })
    @ApiEnvelope(DownloadLinkDto)
    @ApiResponse({ status: 409, description: 'Still being checked' })
    download(
        @CurrentUser() user: AuthUser,
        @Param('documentId') documentId: string,
    ) {
        return this.documents.download(user, documentId);
    }
}
