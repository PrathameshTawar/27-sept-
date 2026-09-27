import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('providers')
  async getProviders(@Request() req) {
    return this.aiService.getUserProviders(req.user.id);
  }

  @Post('providers')
  async createProvider(@Request() req, @Body() body: any) {
    return this.aiService.createProvider(req.user.id, body);
  }

  @Patch('providers/:id')
  async updateProvider(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.aiService.updateProvider(req.user.id, id, body);
  }

  @Delete('providers/:id')
  async deleteProvider(@Request() req, @Param('id') id: string) {
    return this.aiService.deleteProvider(req.user.id, id);
  }

  @Post('review')
  async triggerReview(@Request() req, @Body() body: any) {
    return this.aiService.generateCodeReview(req.user.id, body);
  }

  @Post('generate-docs')
  async generateDocs(@Request() req, @Body() body: { files: { path: string; content: string }[]; providerId?: string }) {
    return this.aiService.generateDocumentation(req.user.id, body.files, body.providerId);
  }
}
