"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ChatService = class ChatService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async createSession(userId, projectId, title) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.prisma.chatSession.create({
            data: {
                projectId,
                title: title || 'Code Context Chat',
            },
        });
    }
    async getSessions(userId, projectId) {
        return this.prisma.chatSession.findMany({
            where: { projectId, project: { userId } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMessages(userId, sessionId) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { project: true, messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!session || session.project.userId !== userId) {
            throw new common_1.NotFoundException('Chat session not found');
        }
        return session.messages;
    }
    async sendMessage(userId, sessionId, question, providerId) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                project: { include: { files: true } },
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!session || session.project.userId !== userId) {
            throw new common_1.NotFoundException('Chat session not found');
        }
        await this.prisma.chatMessage.create({
            data: {
                chatSessionId: sessionId,
                role: 'user',
                content: question,
            },
        });
        const answer = await this.aiService.answerCodeQuestion(userId, session.project.files.map((f) => ({ path: f.path, content: f.content })), question, session.messages.map((m) => ({ role: m.role, content: m.content })), providerId);
        const assistantMessage = await this.prisma.chatMessage.create({
            data: {
                chatSessionId: sessionId,
                role: 'assistant',
                content: answer,
            },
        });
        return assistantMessage;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ChatService);
//# sourceMappingURL=chat.service.js.map