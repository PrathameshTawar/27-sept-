# ReviewPulse — Developer-First AI Code Review Platform

ReviewPulse is an AI-powered code auditing & review platform designed specifically for developers.

**Developer Workflow**:
`Import Repo` &rarr; `Health Score Overview` &rarr; `3-Panel IDE Inspector` &rarr; `Explain & Show AI Fix Diff` &rarr; `Resolve & Re-Audit`

---

## 🌟 Key Developer Features

1. **Developer Health Dashboard**:
   - Displays project health scores (0-100), framework tags (`TypeScript · Node`), last review timestamps, and severity breakdown pills (`🔴 2 Critical`, `🟠 4 High`, `🟡 7 Medium`).
2. **3-Panel IDE Workspace**:
   - **Panel 1**: Expandable file tree hierarchy with file search filter.
   - **Panel 2**: Syntax-highlighted code editor with line numbers and inline finding banners on problematic lines.
   - **Panel 3**: Contextual findings & AI assistant hub.
3. **Actionable Fix Workflow (`Show Fix`)**:
   - View inline code diff patch suggestions (`- original_code` vs `+ fixed_code`).
   - One-click `Copy Fix` button.
   - Mark finding lifecycle status (`🔴 Open` &rarr; `🟢 Resolved`).
4. **Context-Aware AI Assistant**:
   - AI assistant automatically binds to active file path, line number, and security vulnerability context.
5. **Decoupled AI Provider Management**:
   - Supports **OpenAI API**, **LM Studio Local LLMs** (`http://localhost:1234/v1`), **Ollama** (`http://localhost:11434/v1`), and **OpenRouter** at runtime.
6. **Multi-Source Code Ingestion**:
   - 📦 ZIP File Extraction.
   - 📂 Drag & Drop Files.
   - 🐙 GitHub Repository Import URL.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Lucide Icons, TypeScript |
| **Backend** | NestJS, Prisma ORM, Passport JWT, Multer, Adm-Zip |
| **Database** | SQLite (`file:./dev.db`) / PostgreSQL |
| **AI Integration** | Decoupled OpenAI SDK Factory (OpenAI, LM Studio, Ollama) |

---

## 🚀 Quick Start Instructions

```bash
# 1. Start Backend (NestJS)
cd backend
npm install
npx prisma db push
npm run start:dev   # Runs on http://localhost:4000

# 2. Start Frontend (Next.js)
cd frontend
npm install
npm run dev         # Runs on http://localhost:3000
```
