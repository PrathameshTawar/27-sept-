import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Request() req, @Body() body: { projectId: string; type: 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY' | 'TECH_DEBT'; fileIds?: string[]; providerId?: string }) {
    return this.reviewsService.createReview(req.user.id, body);
  }

  @Get('project/:projectId')
  async getProjectReviews(@Request() req, @Param('projectId') projectId: string) {
    return this.reviewsService.getProjectReviews(req.user.id, projectId);
  }

  @Get(':id')
  async getReviewById(@Request() req, @Param('id') id: string) {
    return this.reviewsService.getReviewById(req.user.id, id);
  }

  @Patch(':id/issues/:issueId/status')
  async updateIssueStatus(
    @Request() req,
    @Param('id') id: string,
    @Param('issueId') issueId: string,
    @Body() body: { status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' },
  ) {
    return this.reviewsService.updateIssueStatus(req.user.id, id, issueId, body.status);
  }
}
