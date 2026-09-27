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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const AdmZip = require("adm-zip");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProject(userId, data) {
        return this.prisma.project.create({
            data: {
                userId,
                name: data.name,
                description: data.description || '',
            },
        });
    }
    async getUserProjects(userId) {
        return this.prisma.project.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { files: true, reviews: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getProjectById(userId, projectId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, userId },
            include: {
                files: true,
                reviews: { orderBy: { createdAt: 'desc' } },
                chatSessions: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async deleteProject(userId, projectId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.prisma.project.delete({
            where: { id: projectId },
        });
    }
    async uploadZip(userId, projectId, fileBuffer) {
        await this.getProjectById(userId, projectId);
        const zip = new AdmZip(fileBuffer);
        const zipEntries = zip.getEntries();
        const filesToCreate = [];
        const ignoredPrefixes = ['node_modules/', '.git/', 'dist/', 'build/', '.next/', '__pycache__/'];
        const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.exe', '.dll', '.so', '.woff', '.woff2'];
        for (const entry of zipEntries) {
            if (entry.isDirectory)
                continue;
            const entryName = entry.entryName;
            if (ignoredPrefixes.some((p) => entryName.includes(p)))
                continue;
            if (binaryExtensions.some((ext) => entryName.toLowerCase().endsWith(ext)))
                continue;
            try {
                const textContent = entry.getData().toString('utf8');
                const fileName = entryName.split('/').pop() || entryName;
                const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || 'text' : 'text';
                filesToCreate.push({
                    path: entryName,
                    name: fileName,
                    content: textContent,
                    size: entry.header.size,
                    language: this.mapExtensionToLanguage(ext),
                });
            }
            catch (err) {
                continue;
            }
        }
        if (filesToCreate.length === 0) {
            throw new common_1.BadRequestException('No valid text/code files found in ZIP archive');
        }
        await this.prisma.file.deleteMany({ where: { projectId } });
        await this.prisma.file.createMany({
            data: filesToCreate.map((f) => ({
                projectId,
                ...f,
            })),
        });
        return { message: `Successfully extracted ${filesToCreate.length} files from ZIP`, count: filesToCreate.length };
    }
    async uploadFiles(userId, projectId, files) {
        await this.getProjectById(userId, projectId);
        const preparedFiles = files.map((f) => {
            const fileName = f.path.split('/').pop() || f.path;
            const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || 'text' : 'text';
            return {
                projectId,
                path: f.path,
                name: fileName,
                content: f.content,
                size: Buffer.byteLength(f.content, 'utf8'),
                language: this.mapExtensionToLanguage(ext),
            };
        });
        await this.prisma.file.deleteMany({ where: { projectId } });
        await this.prisma.file.createMany({ data: preparedFiles });
        return { message: `Uploaded ${files.length} files`, count: files.length };
    }
    async importGithubRepo(userId, projectId, repoUrl) {
        await this.getProjectById(userId, projectId);
        const cleanUrl = repoUrl.replace('https://github.com/', '').replace('.git', '').trim();
        const parts = cleanUrl.split('/');
        if (parts.length < 2) {
            throw new common_1.BadRequestException('Invalid GitHub Repository URL format. Expected: https://github.com/owner/repo');
        }
        const owner = parts[0];
        const repo = parts[1];
        const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/main`;
        try {
            const response = await fetch(zipUrl, {
                headers: { 'User-Agent': 'NestJS-Code-Review-App' },
            });
            if (!response.ok) {
                throw new Error(`GitHub returned status ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return this.uploadZip(userId, projectId, buffer);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Failed to import GitHub repository: ${err.message}`);
        }
    }
    mapExtensionToLanguage(ext) {
        const map = {
            ts: 'typescript',
            tsx: 'typescript',
            js: 'javascript',
            jsx: 'javascript',
            py: 'python',
            java: 'java',
            go: 'go',
            rs: 'rust',
            cpp: 'cpp',
            c: 'c',
            cs: 'csharp',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
            sql: 'sql',
            sh: 'shell',
            yaml: 'yaml',
            yml: 'yaml',
        };
        return map[ext] || 'text';
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map