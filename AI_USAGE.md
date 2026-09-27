# AI Usage & Engineering Decision Report — ReviewPulse

This document details the usage of AI tools, engineering rationale, system prompts, generated code vs. manual modifications, and architectural decisions behind ReviewPulse.

---

## 🤖 1. AI Tools & Models

- **Gemini 3.6 Flash / Claude 3.5 Sonnet**: Used for 3-panel workspace layout architecture, Prisma schema expansion, and Tailwind CSS design token system.
- **OpenAI `gpt-4o-mini`**: Production LLM for review output generation, code diff patch creation, and context Q&A.
- **LM Studio (`qwen2.5-coder-7b-instruct`)**: Local offline endpoint testing.

---

## 💡 2. Key Developer-First Engineering Decisions

1. **3-Panel Unified IDE Workspace**:
   - Instead of forcing developers to jump across separate code explorer and review pages, Panel 1 (Tree), Panel 2 (Code), and Panel 3 (Findings & AI) are unified into a single IDE screen.
2. **Actionable Code Diff Patching (`Show Fix`)**:
   - AI response schema was expanded to return `originalCode` and `fixedCode` snippets so developers get concrete code diffs (`-` vs `+`) with copyable fixes.
3. **Finding Lifecycle Tracking**:
   - Implemented finding status toggling (`🔴 Open` &rarr; `🟢 Resolved`) persisted via API endpoints.

---

## 📝 3. Prompts & System Instruction Strategies

### Code Review & Fix Diff Prompt
```text
System: You are a Principal Software Architect & Security Auditor. Return JSON format with summary, score, and issues containing:
{ id, file, line, severity, status, title, description, recommendation, originalCode, fixedCode }
```

---

## 🛠️ 4. Manual Refinements & Code Breakdown

| Component | Generated % | Manually Refined % | Refinement Rationale |
| :--- | :--- | :--- | :--- |
| **3-Panel Workspace UI** | 70% | 30% | Added inline line-highlighting banners, active finding selection, and tab state management. |
| **Review Engine & Fix Diffs** | 75% | 25% | Implemented fallback diff patch generation when LLMs return non-standard code fences. |
| **Tailwind Color Token System** | 60% | 40% | Created dark theme palette (`#070B14`, `#0D1321`, `#111827`, `#1E293B`) to eliminate scattered utility colors. |
