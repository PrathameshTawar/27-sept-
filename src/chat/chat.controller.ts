import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('sessions')
  async createSession(@Request() req, @Body() body: { projectId: string; title?: string }) {
    return this.chatService.createSession(req.user.id, body.projectId, body.title);
  }

  @Get('sessions/project/:projectId')
  async getSessions(@Request() req, @Param('projectId') projectId: string) {
    return this.chatService.getSessions(req.user.id, projectId);
  }

  @Get('messages/:sessionId')
  async getMessages(@Request() req, @Param('sessionId') sessionId: string) {
    return this.chatService.getMessages(req.user.id, sessionId);
  }

  @Post('send')
  async sendMessage(@Request() req, @Body() body: { sessionId: string; question: string; providerId?: string }) {
    return this.chatService.sendMessage(req.user.id, body.sessionId, body.question, body.providerId);
  }
}
