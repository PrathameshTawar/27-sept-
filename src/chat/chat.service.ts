import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createSession(userId: string, projectId: string, title?: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.chatSession.create({
      data: {
        projectId,
        title: title || 'Code Context Chat',
      },
    });
  }

  async getSessions(userId: string, projectId: string) {
    return this.prisma.chatSession.findMany({
      where: { projectId, project: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMessages(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { project: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session || session.project.userId !== userId) {
      throw new NotFoundException('Chat session not found');
    }
    return session.messages;
  }

  async sendMessage(userId: string, sessionId: string, question: string, providerId?: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        project: { include: { files: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!session || session.project.userId !== userId) {
      throw new NotFoundException('Chat session not found');
    }

    // Persist user question
    await this.prisma.chatMessage.create({
      data: {
        chatSessionId: sessionId,
        role: 'user',
        content: question,
      },
    });

    // Generate answer with context
    const answer = await this.aiService.answerCodeQuestion(
      userId,
      session.project.files.map((f) => ({ path: f.path, content: f.content })),
      question,
      session.messages.map((m) => ({ role: m.role, content: m.content })),
      providerId,
    );

    // Persist AI answer
    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        chatSessionId: sessionId,
        role: 'assistant',
        content: answer,
      },
    });

    return assistantMessage;
  }
}
