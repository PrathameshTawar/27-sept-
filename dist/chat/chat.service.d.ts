import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class ChatService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AiService);
    createSession(userId: string, projectId: string, title?: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        title: string;
    }>;
    getSessions(userId: string, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        title: string;
    }[]>;
    getMessages(userId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        chatSessionId: string;
        role: string;
    }[]>;
    sendMessage(userId: string, sessionId: string, question: string, providerId?: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        chatSessionId: string;
        role: string;
    }>;
}
