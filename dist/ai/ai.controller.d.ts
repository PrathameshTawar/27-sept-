import { AiService } from './ai.service';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    getProviders(req: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        baseUrl: string;
        apiKey: string | null;
        modelName: string;
        isDefault: boolean;
    }[]>;
    createProvider(req: any, body: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        baseUrl: string;
        apiKey: string | null;
        modelName: string;
        isDefault: boolean;
    }>;
    updateProvider(req: any, id: string, body: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        baseUrl: string;
        apiKey: string | null;
        modelName: string;
        isDefault: boolean;
    }>;
    deleteProvider(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    triggerReview(req: any, body: any): Promise<import("./ai.service").ReviewResult>;
    generateDocs(req: any, body: {
        files: {
            path: string;
            content: string;
        }[];
        providerId?: string;
    }): Promise<string>;
}
