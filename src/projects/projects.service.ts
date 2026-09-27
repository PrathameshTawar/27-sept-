import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as AdmZip from 'adm-zip';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: string, data: { name: string; description?: string }) {
    return this.prisma.project.create({
      data: {
        userId,
        name: data.name,
        description: data.description || '',
      },
    });
  }

  async getUserProjects(userId: string) {
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

  async getProjectById(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        files: true,
        reviews: { orderBy: { createdAt: 'desc' } },
        chatSessions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  // Upload Option A: ZIP Archive Buffer Extraction
  async uploadZip(userId: string, projectId: string, fileBuffer: Buffer) {
    await this.getProjectById(userId, projectId);

    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();
    const filesToCreate: { path: string; name: string; content: string; size: number; language: string }[] = [];

    const ignoredPrefixes = ['node_modules/', '.git/', 'dist/', 'build/', '.next/', '__pycache__/'];
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.exe', '.dll', '.so', '.woff', '.woff2'];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      const entryName = entry.entryName;

      if (ignoredPrefixes.some((p) => entryName.includes(p))) continue;
      if (binaryExtensions.some((ext) => entryName.toLowerCase().endsWith(ext))) continue;

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
      } catch (err) {
        // Skip unparseable non-UTF8 files
        continue;
      }
    }

    if (filesToCreate.length === 0) {
      throw new BadRequestException('No valid text/code files found in ZIP archive');
    }

    // Clear existing files for project or append
    await this.prisma.file.deleteMany({ where: { projectId } });

    await this.prisma.file.createMany({
      data: filesToCreate.map((f) => ({
        projectId,
        ...f,
      })),
    });

    return { message: `Successfully extracted ${filesToCreate.length} files from ZIP`, count: filesToCreate.length };
  }

  // Upload Option B: Direct Drag & Drop Raw Files
  async uploadFiles(userId: string, projectId: string, files: { path: string; content: string }[]) {
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

  // Upload Option C: GitHub Repository URL Import
  async importGithubRepo(userId: string, projectId: string, repoUrl: string) {
    await this.getProjectById(userId, projectId);

    // Format: https://github.com/owner/repo or owner/repo
    const cleanUrl = repoUrl.replace('https://github.com/', '').replace('.git', '').trim();
    const parts = cleanUrl.split('/');
    if (parts.length < 2) {
      throw new BadRequestException('Invalid GitHub Repository URL format. Expected: https://github.com/owner/repo');
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
    } catch (err) {
      throw new BadRequestException(`Failed to import GitHub repository: ${err.message}`);
    }
  }

  private mapExtensionToLanguage(ext: string): string {
    const map: Record<string, string> = {
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
}
