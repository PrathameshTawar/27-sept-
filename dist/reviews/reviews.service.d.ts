import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class ReviewsService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AiService);
    createReview(userId: string, data: {
        projectId: string;
        type: 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY' | 'TECH_DEBT';
        fileIds?: string[];
        providerId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        issues: string;
        summary: string;
        score: number | null;
        projectId: string;
        type: string;
    }>;
    getProjectReviews(userId: string, projectId: string): Promise<{
        issues: any;
        id: string;
        createdAt: Date;
        summary: string;
        score: number | null;
        projectId: string;
        type: string;
    }[]>;
    getReviewById(userId: string, reviewId: string): Promise<{
        issues: any;
        project: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
        };
        id: string;
        createdAt: Date;
        summary: string;
        score: number | null;
        projectId: string;
        type: string;
    }>;
    updateIssueStatus(userId: string, reviewId: string, issueId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'): Promise<{
        issues: any;
        id: string;
        createdAt: Date;
        summary: string;
        score: number | null;
        projectId: string;
        type: string;
    }>;
}
