import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    createProject(userId: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
    }>;
    getUserProjects(userId: string): Promise<({
        _count: {
            files: number;
            reviews: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
    })[]>;
    getProjectById(userId: string, projectId: string): Promise<{
        files: {
            name: string;
            id: string;
            createdAt: Date;
            content: string;
            projectId: string;
            path: string;
            size: number;
            language: string;
        }[];
        reviews: {
            id: string;
            createdAt: Date;
            issues: string;
            summary: string;
            score: number | null;
            projectId: string;
            type: string;
        }[];
        chatSessions: {
            id: string;
            createdAt: Date;
            projectId: string;
            title: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
    }>;
    deleteProject(userId: string, projectId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
    }>;
    uploadZip(userId: string, projectId: string, fileBuffer: Buffer): Promise<{
        message: string;
        count: number;
    }>;
    uploadFiles(userId: string, projectId: string, files: {
        path: string;
        content: string;
    }[]): Promise<{
        message: string;
        count: number;
    }>;
    importGithubRepo(userId: string, projectId: string, repoUrl: string): Promise<{
        message: string;
        count: number;
    }>;
    private mapExtensionToLanguage;
}
