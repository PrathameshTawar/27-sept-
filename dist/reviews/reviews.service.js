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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ReviewsService = class ReviewsService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async createReview(userId, data) {
        const project = await this.prisma.project.findFirst({
            where: { id: data.projectId, userId },
            include: { files: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const selectedFiles = data.fileIds && data.fileIds.length > 0
            ? project.files.filter((f) => data.fileIds.includes(f.id))
            : project.files;
        if (selectedFiles.length === 0) {
            throw new common_1.NotFoundException('No code files selected for review');
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
    async getProjectReviews(userId, projectId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
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
    async getReviewById(userId, reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
            include: { project: true },
        });
        if (!review || review.project.userId !== userId) {
            throw new common_1.NotFoundException('Review not found');
        }
        return {
            ...review,
            issues: JSON.parse(review.issues || '[]'),
        };
    }
    async updateIssueStatus(userId, reviewId, issueId, status) {
        const reviewData = await this.getReviewById(userId, reviewId);
        const updatedIssues = reviewData.issues.map((issue) => {
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map