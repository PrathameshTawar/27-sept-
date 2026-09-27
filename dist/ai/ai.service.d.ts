import { PrismaService } from '../prisma/prisma.service';
export interface ReviewPromptParams {
    type: 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY' | 'TECH_DEBT';
    files: {
        path: string;
        content: string;
        language: string;
    }[];
    providerId?: string;
}
export interface ReviewResult {
    summary: string;
    score: number;
    issues: {
        id?: string;
        file: string;
        line?: number;
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
        title: string;
        description: string;
        recommendation: string;
        originalCode?: string;
        fixedCode?: string;
    }[];
}
export declare class AiService {
    private prisma;
    constructor(prisma: PrismaService);
    private createOpenAIClient;
    getUserProviders(userId: string): Promise<{
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
    createProvider(userId: string, data: {
        name: string;
        baseUrl: string;
        apiKey?: string;
        modelName: string;
        isDefault?: boolean;
    }): Promise<{
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
    updateProvider(userId: string, providerId: string, data: Partial<{
        name: string;
        baseUrl: string;
        apiKey: string;
        modelName: string;
        isDefault: boolean;
    }>): Promise<{
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
    deleteProvider(userId: string, providerId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getActiveProvider(userId: string, providerId?: string): Promise<{
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
    generateCodeReview(userId: string, params: ReviewPromptParams): Promise<ReviewResult>;
    answerCodeQuestion(userId: string, codeFiles: {
        path: string;
        content: string;
    }[], userQuestion: string, conversationHistory: {
        role: string;
        content: string;
    }[], providerId?: string): Promise<string>;
    generateDocumentation(userId: string, codeFiles: {
        path: string;
        content: string;
    }[], providerId?: string): Promise<string>;
}
