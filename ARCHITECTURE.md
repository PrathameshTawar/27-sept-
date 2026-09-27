# System Architecture — AI Code Review Assistant

This document outlines the system architecture, design decisions, data pipeline, and database entity relationships for the AI-Powered Code Review Assistant.

---

## 🏛️ High-Level System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                           CLIENT LAYER (Next.js)                         |
|   Dashboard UI  |  Code Explorer  |  Review Engine  |  Context Chat      |
+-------------------------------------------------------------------------+
                                    |
                                    | REST API Calls (JWT Bearer Token)
                                    v
+-------------------------------------------------------------------------+
|                           BACKEND LAYER (NestJS)                         |
|                                                                         |
|  +--------------------+   +-------------------+   +------------------+  |
|  |    Auth Module     |   |  Projects Module  |   |  Reviews Module  |  |
|  |  (Passport + JWT)  |   | (ZIP/Git Ingestion|   | (Audit Engine)   |  |
|  +--------------------+   +-------------------+   +------------------+  |
|            |                        |                       |           |
|            v                        v                       v           |
|  +--------------------+   +-------------------+   +------------------+  |
|  |   Prisma Service   |   |    Chat Module    |   |    AiService     |  |
|  | (Postgres/SQLite)  |   | (Context Q&A)     |   | (Dynamic OpenAI) |  |
|  +--------------------+   +-------------------+   +------------------+  |
+-------------------------------------------------------------------------+
            |                                                 |
            v                                                 v
  +-------------------+                          +--------------------------+
  | Database Instance |                          |   AI Provider Endpoints  |
  |  (Postgres/SQLite)|                          | (OpenAI / LM Studio /    |
  +-------------------+                          |  Ollama / OpenRouter)    |
                                                 +--------------------------+
```

---

## ⚙️ Architectural Pillars & Design Choices

### 1. Decoupled AI Provider Factory (`AiService`)
- **Challenge**: Hardcoded API endpoints prevent running local models like LM Studio or Ollama during offline or privacy-sensitive code audits.
- **Solution**: Implemented an OpenAI SDK instantiation factory pattern that receives `baseUrl`, `apiKey`, and `modelName` dynamically per user request. Any OpenAI-compatible `/v1/chat/completions` endpoint is supported seamlessly.

### 2. Multi-Source Code Ingestion Pipeline
- **ZIP File Buffer Extraction**: Uses `adm-zip` to extract file contents directly in memory without disk pollution. Filters out binary assets (`.png`, `.exe`, `.woff2`) and vendor folders (`node_modules`, `.git`, `dist`).
- **GitHub Import**: Communicates directly with GitHub API tarball zip endpoints (`https://api.github.com/repos/{owner}/{repo}/zipball/main`) allowing zero local git dependency execution.

### 3. Structured Output & Health Scores
- All AI reviews utilize strict JSON schema enforcement with low temperature ($0.2$) to ensure reliable parsing into Summary, Health Score (0-100), and categorized Issue Findings (Line number, File path, Severity, Description, Recommendation).

---

## 🗄️ Database Schema ERD (Prisma ORM)

```
+---------------+        1:N       +---------------+
|     User      |----------------->|    Project    |
+---------------+                  +---------------+
        | 1:N                              |
        v                                  | 1:N
+---------------+                  +-------+-------+
|  AiProvider   |                  |       |       |
+---------------+                  v       v       v
                                +------+ +------+ +-------------+
                                | File | |Review| | ChatSession |
                                +------+ +------+ +-------------+
                                                         | 1:N
                                                         v
                                                  +-------------+
                                                  | ChatMessage |
                                                  +-------------+
```

- **Users**: Authentication & profile data.
- **Projects**: Code repository containers.
- **Files**: Individual source files extracted from ZIP/GitHub imports.
- **AiProviders**: Runtime LLM configurations (`baseUrl`, `apiKey`, `modelName`, `isDefault`).
- **Reviews**: Persisted audit outputs with JSON-serialized issue findings and scores.
- **ChatSessions & ChatMessages**: Contextual Q&A conversation logs.
