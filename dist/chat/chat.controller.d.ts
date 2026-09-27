import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    createSession(req: any, body: {
        projectId: string;
        title?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        title: string;
    }>;
    getSessions(req: any, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        title: string;
    }[]>;
    getMessages(req: any, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        chatSessionId: string;
        role: string;
    }[]>;
    sendMessage(req: any, body: {
        sessionId: string;
        question: string;
        providerId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        chatSessionId: string;
        role: string;
    }>;
}
