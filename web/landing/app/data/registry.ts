export interface RegistrySkill {
  id: string;
  source: string;
  path: string;
  title: string;
  description: string;
  category: string;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Research: "bg-blue",
  Development: "bg-orange",
  Creative: "bg-pink",
  Writing: "bg-yellow",
  Integration: "bg-green-mid",
  Productivity: "bg-cream",
  Security: "bg-pink",
  Business: "bg-yellow",
  Documents: "bg-blue",
};

export const REGISTRY_SKILLS: RegistrySkill[] = [
  // Research & Analysis
  { id: "tavily-search", source: "tavily-ai/skills", path: "search", title: "Tavily Search", description: "Search the web using Tavily's LLM-optimized search API", category: "Research", color: CATEGORY_COLORS.Research },
  { id: "gpt-researcher", source: "assafelovic/gpt-researcher", path: "", title: "GPT Researcher", description: "Autonomous deep research agent with web search and detailed reports", category: "Research", color: CATEGORY_COLORS.Research },
  { id: "mcp-builder", source: "anthropics/skills", path: "skills/mcp-builder", title: "MCP Builder", description: "Create Model Context Protocol servers for LLM integrations", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "connect-apps", source: "ComposioHQ/awesome-claude-skills", path: "connect", title: "Connect Apps", description: "Connect Claude to 500+ apps like Gmail, Slack, GitHub, Notion", category: "Integration", color: CATEGORY_COLORS.Integration },
  { id: "playwright-automation", source: "lackeyjb/playwright-skill", path: "", title: "Playwright", description: "Automate browser testing with Playwright for web applications", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "test-driven-development", source: "obra/superpowers", path: "skills/test-driven-development", title: "Test-Driven Dev", description: "Implement features using TDD workflow with tests before code", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "skill-creator", source: "anthropics/skills", path: "skills/skill-creator", title: "Skill Creator", description: "Design and create effective Claude Skills with proper structure", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "content-writer", source: "anthropics/skills", path: "skills/content-research-writer", title: "Content Writer", description: "Write researched content with citations and section feedback", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "canvas-design", source: "anthropics/skills", path: "skills/canvas-design", title: "Canvas Design", description: "Create visual art and designs in PNG and PDF formats", category: "Creative", color: CATEGORY_COLORS.Creative },
  { id: "tavily-extract", source: "tavily-ai/skills", path: "extract", title: "Tavily Extract", description: "Extract and parse content from web pages using Tavily", category: "Research", color: CATEGORY_COLORS.Research },
  { id: "artifacts-builder", source: "anthropics/skills", path: "skills/web-artifacts-builder", title: "Artifacts Builder", description: "Build multi-component HTML artifacts with React, Tailwind, and shadcn/ui", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "aws-skills", source: "zxkane/aws-skills", path: "", title: "AWS Skills", description: "AWS development with CDK best practices and serverless architecture", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "tavily-crawl", source: "tavily-ai/skills", path: "crawl", title: "Tavily Crawl", description: "Crawl websites and discover pages using Tavily", category: "Research", color: CATEGORY_COLORS.Research },
  { id: "file-organizer", source: "anthropics/skills", path: "skills/file-organizer", title: "File Organizer", description: "Organize files intelligently by context with duplicate detection", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "webapp-testing", source: "anthropics/skills", path: "skills/webapp-testing", title: "Webapp Testing", description: "Test web applications with Playwright for frontend verification", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "software-architecture", source: "NeoLabHQ/context-engineering-kit", path: "plugins/ddd/skills/software-architecture", title: "Software Architecture", description: "Clean Architecture, SOLID principles, and design patterns", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "d3-visualization", source: "chrisvoncsefalvay/claude-d3js-skill", path: "", title: "D3 Visualization", description: "Create D3.js charts and interactive data visualizations", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "prompt-engineering", source: "NeoLabHQ/context-engineering-kit", path: "plugins/customaize-agent/skills/prompt-engineering", title: "Prompt Engineering", description: "Prompt engineering techniques and Anthropic best practices", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "pdf", source: "anthropics/skills", path: "skills/pdf", title: "PDF Processing", description: "Extract text, tables, and metadata from PDFs; merge and annotate", category: "Documents", color: CATEGORY_COLORS.Documents },
  { id: "resume-generator", source: "anthropics/skills", path: "skills/tailored-resume-generator", title: "Resume Generator", description: "Generate tailored resumes matched to job descriptions", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "brainstorming", source: "obra/superpowers", path: "skills/brainstorming", title: "Brainstorming", description: "Transform rough ideas into structured designs through questioning", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "root-cause-tracing", source: "obra/superpowers", path: "skills/root-cause-tracing", title: "Root Cause Tracing", description: "Trace errors back through execution to find the original cause", category: "Research", color: CATEGORY_COLORS.Research },
  { id: "docx", source: "anthropics/skills", path: "skills/docx", title: "Word Documents", description: "Create and edit Word documents with formatting, comments, and tracked changes", category: "Documents", color: CATEGORY_COLORS.Documents },
  { id: "xlsx", source: "anthropics/skills", path: "skills/xlsx", title: "Excel Spreadsheets", description: "Manipulate Excel spreadsheets with formulas, charts, and data transforms", category: "Documents", color: CATEGORY_COLORS.Documents },
  { id: "threat-hunting", source: "jthack/threat-hunting-with-sigma-rules-skill", path: "", title: "Threat Hunting", description: "Hunt for threats using Sigma detection rules", category: "Security", color: CATEGORY_COLORS.Security },
  { id: "subagent-development", source: "NeoLabHQ/context-engineering-kit", path: "plugins/sadd/skills/subagent-driven-development", title: "Subagent Dev", description: "Dispatch independent subagents for parallel development tasks", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "lead-research", source: "anthropics/skills", path: "skills/lead-research-assistant", title: "Lead Research", description: "Identify and qualify leads for sales outreach", category: "Business", color: CATEGORY_COLORS.Business },
  { id: "pptx", source: "anthropics/skills", path: "skills/pptx", title: "PowerPoint", description: "Generate and modify PowerPoint slides, layouts, and templates", category: "Documents", color: CATEGORY_COLORS.Documents },
  { id: "changelog-generator", source: "ComposioHQ/awesome-claude-skills", path: "changelog-generator", title: "Changelog Generator", description: "Generate user-facing changelogs from git commits automatically", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "git-worktrees", source: "obra/superpowers", path: "skills/using-git-worktrees", title: "Git Worktrees", description: "Create isolated git worktrees with smart directory selection", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "brand-guidelines", source: "anthropics/skills", path: "skills/brand-guidelines", title: "Brand Guidelines", description: "Apply brand colors and typography to documents and artifacts", category: "Business", color: CATEGORY_COLORS.Business },
  { id: "article-extractor", source: "michalparkola/tapestry-skills-for-claude-code", path: "article-extractor", title: "Article Extractor", description: "Extract full article text and metadata from web pages", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "youtube-transcript", source: "michalparkola/tapestry-skills-for-claude-code", path: "youtube-transcript", title: "YouTube Transcript", description: "Fetch and summarize transcripts from YouTube videos", category: "Creative", color: CATEGORY_COLORS.Creative },
  { id: "n8n-skills", source: "haunchen/n8n-skills", path: "", title: "n8n Workflows", description: "Understand and operate n8n automation workflows", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "video-downloader", source: "anthropics/skills", path: "skills/video-downloader", title: "Video Downloader", description: "Download videos from YouTube and other platforms", category: "Creative", color: CATEGORY_COLORS.Creative },
  { id: "twitter-optimizer", source: "anthropics/skills", path: "skills/twitter-algorithm-optimizer", title: "Twitter Optimizer", description: "Optimize tweets for reach using Twitter's algorithm insights", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "csv-summarizer", source: "coffeefuelbump/csv-data-summarizer-claude-skill", path: "", title: "CSV Summarizer", description: "Analyze CSV files and generate insights with automatic visualizations", category: "Research", color: CATEGORY_COLORS.Research },
  { id: "finishing-branch", source: "obra/superpowers", path: "skills/finishing-a-development-branch", title: "Finishing Branch", description: "Guide completion of development branches with clear options", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "meeting-analyzer", source: "ComposioHQ/awesome-claude-skills", path: "meeting-insights-analyzer", title: "Meeting Analyzer", description: "Analyze meeting transcripts for behavioral patterns and insights", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "invoice-organizer", source: "anthropics/skills", path: "skills/invoice-organizer", title: "Invoice Organizer", description: "Sort invoices and receipts for tax preparation and accounting", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "domain-brainstormer", source: "anthropics/skills", path: "skills/domain-name-brainstormer", title: "Domain Brainstormer", description: "Generate domain name ideas and check availability", category: "Business", color: CATEGORY_COLORS.Business },
  { id: "tapestry", source: "michalparkola/tapestry-skills-for-claude-code", path: "tapestry", title: "Tapestry", description: "Interlink and summarize related documents into knowledge graphs", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "kaizen", source: "NeoLabHQ/context-engineering-kit", path: "plugins/kaizen/skills/kaizen", title: "Kaizen", description: "Apply continuous improvement with Kaizen and Lean methodology", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "image-enhancer", source: "ComposioHQ/awesome-claude-skills", path: "image-enhancer", title: "Image Enhancer", description: "Improve image quality with enhanced resolution and sharpness", category: "Creative", color: CATEGORY_COLORS.Creative },
  { id: "competitive-ads", source: "ComposioHQ/awesome-claude-skills", path: "competitive-ads-extractor", title: "Competitive Ads", description: "Extract and analyze competitors' ads from ad libraries", category: "Business", color: CATEGORY_COLORS.Business },
  { id: "markdown-epub", source: "smerchek/claude-epub-skill", path: "", title: "Markdown to EPUB", description: "Convert markdown documents into professional EPUB ebook files", category: "Documents", color: CATEGORY_COLORS.Documents },
  { id: "notebooklm", source: "PleasePrompto/notebooklm-skill", path: "", title: "NotebookLM", description: "Chat with NotebookLM for source-grounded answers", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "theme-factory", source: "ComposioHQ/awesome-claude-skills", path: "theme-factory", title: "Theme Factory", description: "Apply professional font and color themes to artifacts", category: "Creative", color: CATEGORY_COLORS.Creative },
  { id: "ffuf-fuzzing", source: "jthack/ffuf_claude_skill", path: "", title: "FFUF Fuzzing", description: "Run web fuzzing with ffuf for security vulnerability analysis", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "internal-comms", source: "ComposioHQ/awesome-claude-skills", path: "internal-comms", title: "Internal Comms", description: "Write internal communications, newsletters, and status reports", category: "Business", color: CATEGORY_COLORS.Business },
  { id: "computer-forensics", source: "mhattingpete/claude-skills-marketplace", path: "computer-forensics-skills/skills/computer-forensics", title: "Computer Forensics", description: "Digital forensics analysis and investigation techniques", category: "Security", color: CATEGORY_COLORS.Security },
  { id: "skill-seekers", source: "yusufkaraaslan/Skill_Seekers", path: "", title: "Skill Seekers", description: "Convert any documentation website into a Claude skill", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "ios-simulator", source: "conorluddy/ios-simulator-skill", path: "", title: "iOS Simulator", description: "Interact with iOS Simulator for mobile app testing and debugging", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "git-pushing", source: "mhattingpete/claude-skills-marketplace", path: "engineering-workflow-plugin/skills/git-pushing", title: "Git Pushing", description: "Automate git operations and repository interactions", category: "Integration", color: CATEGORY_COLORS.Integration },
  { id: "slack-gif-creator", source: "ComposioHQ/awesome-claude-skills", path: "slack-gif-creator", title: "Slack GIF Creator", description: "Create animated GIFs optimized for Slack with size validators", category: "Creative", color: CATEGORY_COLORS.Creative },
  { id: "family-history", source: "emaynard/claude-family-history-research-skill", path: "", title: "Family History", description: "Assist with genealogy and family history research projects", category: "Writing", color: CATEGORY_COLORS.Writing },
  { id: "langsmith-fetch", source: "ComposioHQ/awesome-claude-skills", path: "langsmith-fetch", title: "LangSmith Fetch", description: "Debug LangChain agents by fetching traces from LangSmith Studio", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "ship-learn-next", source: "michalparkola/tapestry-skills-for-claude-code", path: "ship-learn-next", title: "Ship Learn Next", description: "Iterate on what to build or learn next based on feedback loops", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "review-implementing", source: "mhattingpete/claude-skills-marketplace", path: "engineering-workflow-plugin/skills/review-implementing", title: "Review Implementing", description: "Evaluate code implementation plans and align with specs", category: "Integration", color: CATEGORY_COLORS.Integration },
  { id: "test-fixing", source: "mhattingpete/claude-skills-marketplace", path: "engineering-workflow-plugin/skills/test-fixing", title: "Test Fixing", description: "Detect failing tests and propose patches or fixes", category: "Integration", color: CATEGORY_COLORS.Integration },
  { id: "reddit-fetch", source: "ykdojo/claude-code-tips", path: "skills/reddit-fetch", title: "Reddit Fetch", description: "Fetch Reddit content via Gemini CLI when WebFetch is blocked", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "pypict", source: "omkamal/pypict-claude-skill", path: "", title: "PyPICT", description: "Design comprehensive test cases using PICT pairwise testing", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "move-code-quality", source: "1NickPappas/move-code-quality-skill", path: "", title: "Move Code Quality", description: "Analyze Move language packages for code quality compliance", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "raffle-picker", source: "ComposioHQ/awesome-claude-skills", path: "raffle-winner-picker", title: "Raffle Picker", description: "Randomly select winners from lists with secure randomness", category: "Productivity", color: CATEGORY_COLORS.Productivity },
  { id: "claude-terminal-title", source: "bluzername/claude-code-terminal-title", path: "", title: "Terminal Title", description: "Dynamic terminal window titles describing current work", category: "Development", color: CATEGORY_COLORS.Development },
  { id: "file-deletion", source: "mhattingpete/claude-skills-marketplace", path: "computer-forensics-skills/skills/file-deletion", title: "Secure File Deletion", description: "Secure file deletion and data sanitization methods", category: "Security", color: CATEGORY_COLORS.Security },
  { id: "metadata-extraction", source: "mhattingpete/claude-skills-marketplace", path: "computer-forensics-skills/skills/metadata-extraction", title: "Metadata Extraction", description: "Extract and analyze file metadata for forensic purposes", category: "Security", color: CATEGORY_COLORS.Security },
];

export function getSkillHref(skill: RegistrySkill): string {
  return `/skill/${skill.id}`;
}
