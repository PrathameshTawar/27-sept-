import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createReview(userId: string, data: { projectId: string; type: 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY' | 'TECH_DEBT'; fileIds?: string[]; providerId?: string }) {
    const project = await this.prisma.project.findFirst({
      where: { id: data.projectId, userId },
      include: { files: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const selectedFiles = data.fileIds && data.fileIds.length > 0
      ? project.files.filter((f) => data.fileIds.includes(f.id))
      : project.files;

    if (selectedFiles.length === 0) {
      throw new NotFoundException('No code files selected for review');
    }

    const reviewResult = await this.aiService.generateCodeReview(userId, {
      type: data.type,
      files: selectedFiles.map((f) => ({ path: f.path, content: f.content, language: f.language })),
      providerId: data.providerId,
    });

    return this.prisma.review.create({
      data: {
        projectId: data.projectId,
        type: data.type,
        summary: reviewResult.summary,
        score: reviewResult.score,
        issues: JSON.stringify(reviewResult.issues),
      },
    });
  }

  async getProjectReviews(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      ...r,
      issues: JSON.parse(r.issues || '[]'),
    }));
  }

  async getReviewById(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { project: true },
    });
    if (!review || review.project.userId !== userId) {
      throw new NotFoundException('Review not found');
    }

    return {
      ...review,
      issues: JSON.parse(review.issues || '[]'),
    };
  }

  async updateIssueStatus(userId: string, reviewId: string, issueId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
    const reviewData = await this.getReviewById(userId, reviewId);
    const updatedIssues = reviewData.issues.map((issue: any) => {
      if (issue.id === issueId || issue.title === issueId) {
        return { ...issue, status };
      }
      return issue;
    });

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { issues: JSON.stringify(updatedIssues) },
    });

    return {
      ...updated,
      issues: updatedIssues,
    };
  }
}
