import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async createProject(@Request() req, @Body() body: { name: string; description?: string }) {
    return this.projectsService.createProject(req.user.id, body);
  }

  @Get()
  async getUserProjects(@Request() req) {
    return this.projectsService.getUserProjects(req.user.id);
  }

  @Get(':id')
  async getProjectById(@Request() req, @Param('id') id: string) {
    return this.projectsService.getProjectById(req.user.id, id);
  }

  @Delete(':id')
  async deleteProject(@Request() req, @Param('id') id: string) {
    return this.projectsService.deleteProject(req.user.id, id);
  }

  @Post(':id/upload-zip')
  @UseInterceptors(FileInterceptor('file'))
  async uploadZip(@Request() req, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.projectsService.uploadZip(req.user.id, id, file.buffer);
  }

  @Post(':id/upload-files')
  async uploadFiles(@Request() req, @Param('id') id: string, @Body() body: { files: { path: string; content: string }[] }) {
    return this.projectsService.uploadFiles(req.user.id, id, body.files);
  }

  @Post(':id/import-github')
  async importGithub(@Request() req, @Param('id') id: string, @Body() body: { repoUrl: string }) {
    return this.projectsService.importGithubRepo(req.user.id, id, body.repoUrl);
  }
}
