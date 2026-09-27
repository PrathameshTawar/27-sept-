import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    createProject(req: any, body: {
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
    getUserProjects(req: any): Promise<({
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
    getProjectById(req: any, id: string): Promise<{
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
    deleteProject(req: any, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
    }>;
    uploadZip(req: any, id: string, file: Express.Multer.File): Promise<{
        message: string;
        count: number;
    }>;
    uploadFiles(req: any, id: string, body: {
        files: {
            path: string;
            content: string;
        }[];
    }): Promise<{
        message: string;
        count: number;
    }>;
    importGithub(req: any, id: string, body: {
        repoUrl: string;
    }): Promise<{
        message: string;
        count: number;
    }>;
}
