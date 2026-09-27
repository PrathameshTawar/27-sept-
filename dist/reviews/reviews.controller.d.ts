import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(req: any, body: {
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
    getProjectReviews(req: any, projectId: string): Promise<{
        issues: any;
        id: string;
        createdAt: Date;
        summary: string;
        score: number | null;
        projectId: string;
        type: string;
    }[]>;
    getReviewById(req: any, id: string): Promise<{
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
    updateIssueStatus(req: any, id: string, issueId: string, body: {
        status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    }): Promise<{
        issues: any;
        id: string;
        createdAt: Date;
        summary: string;
        score: number | null;
        projectId: string;
        type: string;
    }>;
}
