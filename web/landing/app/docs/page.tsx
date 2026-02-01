"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Github, Terminal, Code, Cpu, Globe, FlaskConical, 
  Wrench, Copy, Check, Star, Search, FileText, Zap, Package,
  ArrowRight, BookOpen, ExternalLink, Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-2 bg-green-mid border-2 border-ink hover:bg-yellow transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="card-brutal overflow-hidden">
      {title && (
        <div className="bg-ink text-cream px-4 py-2 text-sm font-bold border-b-4 border-ink">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className="bg-ink text-green-light p-4 pr-14 text-sm leading-relaxed overflow-x-auto font-mono">
          <code>{code}</code>
        </pre>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      {children}
    </motion.section>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className="card-brutal p-6">
      <div className={`inline-block p-3 ${color} border-2 border-ink mb-4`}>{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-green-dark leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseCard({ icon, title, skill, description, color }: { icon: React.ReactNode; title: string; skill: string; description: string; color: string }) {
  return (
    <div className="card-brutal p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${color} border-2 border-ink`}>{icon}</div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="text-sm font-mono bg-ink text-green-light px-2 py-0.5">{skill}</span>
        </div>
      </div>
      <p className="text-sm text-green-dark leading-relaxed">{description}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-green-light bg-gradient-garden">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 p-3 bg-cream border-4 border-ink shadow-brutal-sm hover:bg-yellow transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 pt-20 pb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image src="/logo.png" alt="Skyll" width={48} height={48} />
          <h1 className="font-mono font-extrabold text-4xl md:text-5xl">Documentation</h1>
        </div>
        <p className="text-green-dark max-w-2xl mx-auto">
          Everything you need to know about Skyll - from quick start to advanced configuration.
        </p>

        {/* Quick nav */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { href: "#why", label: "Why Skyll?" },
            { href: "#features", label: "Features" },
            { href: "#quickstart", label: "Quick Start" },
            { href: "#api", label: "API" },
            { href: "#mcp", label: "MCP Server" },
            { href: "#usecases", label: "Use Cases" },
            { href: "#contributing", label: "Contributing" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 bg-cream border-2 border-ink text-sm font-medium hover:bg-yellow transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 pb-16 max-w-4xl space-y-16">
        
        {/* Why Skyll */}
        <Section id="why">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-yellow px-3 py-1 border-4 border-ink">Why Skyll?</span>
          </h2>
          
          <div className="card-brutal p-8 space-y-6">
            <p className="text-lg leading-relaxed">
              Agent skills (<code className="bg-ink text-green-light px-2 py-0.5">SKILL.md</code> files) are a powerful way 
              to extend what AI agents can do. They&apos;re markdown files that teach agents how to complete specific tasks, 
              following the <a href="https://agentskills.io" className="underline font-bold hover:text-green-dark">Agent Skills specification</a>.
            </p>
            
            <div className="bg-pink/30 p-4 border-l-4 border-pink">
              <p className="font-bold mb-2">The Problem</p>
              <p className="text-green-dark">
                Today, skills only work with a handful of tools like <strong>Claude Code</strong> and <strong>Cursor</strong>. 
                They require manual installation before a session, which means developers need to know in advance which skills they&apos;ll need.
              </p>
            </div>

            <div className="bg-green-mid/30 p-4 border-l-4 border-green-mid">
              <p className="font-bold mb-2">The Solution</p>
              <p className="text-green-dark">
                <strong>Skyll democratizes access to skills.</strong> Any agent, framework, or tool can discover and retrieve 
                skills on demand. No pre-installation. No human intervention. Agents explore, choose based on context, 
                and use skills autonomously.
              </p>
            </div>

            <p className="text-lg leading-relaxed">
              Think of Skyll as a <strong>search engine for agent capabilities</strong>. Your agent asks &quot;How do I do X?&quot; 
              and Skyll returns the relevant skill with full instructions, ready to use.
            </p>
          </div>
        </Section>

        {/* Features */}
        <Section id="features">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-blue px-3 py-1 border-4 border-ink">Features</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<Search className="w-6 h-6" />} 
              title="Multi-Source Search" 
              description="Query skills.sh, community registry, and extensible to more sources. Results are deduplicated automatically." 
              color="bg-yellow" 
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6" />} 
              title="Full Content Retrieval" 
              description="Get complete SKILL.md content with parsed YAML frontmatter, not just metadata. Ready for context injection." 
              color="bg-pink" 
            />
            <FeatureCard 
              icon={<Star className="w-6 h-6" />} 
              title="Relevance Ranking" 
              description="Skills scored 0-100 based on content availability, query match, references, and popularity (install count)." 
              color="bg-blue" 
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />} 
              title="Aggressive Caching" 
              description="Intelligent caching respects GitHub rate limits. Configure TTL via environment variables." 
              color="bg-orange" 
            />
            <FeatureCard 
              icon={<Package className="w-6 h-6" />} 
              title="References Support" 
              description="Optionally fetch additional .md files from references/, docs/, examples/ directories." 
              color="bg-green-mid" 
            />
            <FeatureCard 
              icon={<Cpu className="w-6 h-6" />} 
              title="Dual Interface" 
              description="Use as REST API for any integration, or as MCP server for Claude Desktop, Cursor, and more." 
              color="bg-cream" 
            />
          </div>
        </Section>

        {/* Quick Start */}
        <Section id="quickstart">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Terminal className="w-8 h-8" />
            <span className="bg-green-mid px-3 py-1 border-4 border-ink">Quick Start</span>
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="bg-yellow px-2 py-0.5 border-2 border-ink text-sm">Step 1</span>
                Clone & Install
              </h3>
              <CodeBlock code={`git clone https://github.com/assafelovic/skyll.git
cd skyll
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="bg-yellow px-2 py-0.5 border-2 border-ink text-sm">Step 2</span>
                Configure (Optional but Recommended)
              </h3>
              <CodeBlock 
                title=".env"
                code={`# GitHub token for higher rate limits (5000 vs 60 requests/hour)
GITHUB_TOKEN=ghp_your_token_here

# Cache TTL in seconds (default: 3600)
CACHE_TTL=3600

# Enable community registry (default: true)
ENABLE_REGISTRY=true`} 
              />
              <p className="mt-3 text-sm text-green-dark">
                Get a GitHub token at{" "}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">
                  github.com/settings/tokens
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="bg-yellow px-2 py-0.5 border-2 border-ink text-sm">Step 3</span>
                Start the Server
              </h3>
              <CodeBlock code={`uvicorn src.main:app --port 8000`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="bg-yellow px-2 py-0.5 border-2 border-ink text-sm">Step 4</span>
                Search for Skills
              </h3>
              <CodeBlock code={`curl "http://localhost:8000/search?q=react+performance&limit=5"`} />
            </div>
          </div>
        </Section>

        {/* API Reference */}
        <Section id="api">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Code className="w-8 h-8" />
            <span className="bg-pink px-3 py-1 border-4 border-ink">API Reference</span>
          </h2>

          <div className="space-y-8">
            {/* Search endpoint */}
            <div className="card-brutal overflow-hidden">
              <div className="bg-green-mid p-4 border-b-4 border-ink flex items-center gap-3">
                <span className="bg-ink text-cream px-2 py-1 font-bold text-sm">GET</span>
                <code className="font-bold">/search</code>
              </div>
              <div className="p-6">
                <p className="mb-4">Search for skills by query. Returns ranked results with full content.</p>
                
                <h4 className="font-bold mb-2">Query Parameters</h4>
                <table className="w-full text-sm mb-6">
                  <tbody>
                    <tr className="border-b-2 border-ink/20">
                      <td className="py-2 font-mono font-bold">q</td>
                      <td className="py-2">Search query (required)</td>
                    </tr>
                    <tr className="border-b-2 border-ink/20">
                      <td className="py-2 font-mono font-bold">limit</td>
                      <td className="py-2">Max results, default 5, max 20</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono font-bold">include_references</td>
                      <td className="py-2">Fetch additional .md files (true/false)</td>
                    </tr>
                  </tbody>
                </table>

                <h4 className="font-bold mb-2">Example Response</h4>
                <CodeBlock code={`{
  "query": "react performance",
  "count": 1,
  "skills": [
    {
      "id": "react-best-practices",
      "title": "React Best Practices",
      "description": "Guidelines for building performant React apps",
      "source": "vercel/ai-skills",
      "relevance_score": 85.5,
      "install_count": 1250,
      "content": "# React Best Practices\\n\\n## Performance\\n...",
      "refs": {
        "skills_sh": "https://skills.sh/skills/react-best-practices",
        "github": "https://github.com/vercel/ai-skills"
      },
      "references": [
        {
          "name": "examples.md",
          "path": "skills/react-best-practices/examples.md",
          "content": "# Examples\\n...",
          "raw_url": "https://raw.githubusercontent.com/..."
        }
      ]
    }
  ]
}`} />
              </div>
            </div>

            {/* Get skill endpoint */}
            <div className="card-brutal overflow-hidden">
              <div className="bg-blue p-4 border-b-4 border-ink flex items-center gap-3">
                <span className="bg-ink text-cream px-2 py-1 font-bold text-sm">GET</span>
                <code className="font-bold">/skills/&#123;source&#125;/&#123;skill_id&#125;</code>
              </div>
              <div className="p-6">
                <p className="mb-4">Get a specific skill by source and ID.</p>
                <CodeBlock code={`curl "http://localhost:8000/skills/skills.sh/vercel-react-best-practices"`} />
              </div>
            </div>

            {/* Health endpoint */}
            <div className="card-brutal overflow-hidden">
              <div className="bg-yellow p-4 border-b-4 border-ink flex items-center gap-3">
                <span className="bg-ink text-cream px-2 py-1 font-bold text-sm">GET</span>
                <code className="font-bold">/health</code>
              </div>
              <div className="p-6">
                <p>Health check endpoint. Returns service status.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* MCP Server */}
        <Section id="mcp">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="w-8 h-8" />
            <span className="bg-orange px-3 py-1 border-4 border-ink">MCP Server</span>
          </h2>

          <div className="card-brutal p-6 mb-6">
            <p className="text-lg leading-relaxed">
              Skyll can run as an <strong>MCP (Model Context Protocol)</strong> server, making it available as a tool 
              for Claude Desktop, Cursor, and other MCP-compatible clients.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-3">Claude Desktop Configuration</h3>
              <CodeBlock 
                title="claude_desktop_config.json"
                code={`{
  "mcpServers": {
    "skyll": {
      "command": "/path/to/skyll/venv/bin/python",
      "args": ["-m", "src.mcp_server"],
      "cwd": "/path/to/skyll"
    }
  }
}`} 
              />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3">Standalone Mode</h3>
              <CodeBlock code={`# Stdio transport (for MCP clients)
python -m src.mcp_server

# SSE transport (for web clients)
python -m src.mcp_server --transport sse --port 8080`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3">Available MCP Tools</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card-brutal p-4">
                  <h4 className="font-bold mb-2 font-mono">search_skills</h4>
                  <p className="text-sm text-green-dark">Search for skills by query. Returns ranked results.</p>
                </div>
                <div className="card-brutal p-4">
                  <h4 className="font-bold mb-2 font-mono">get_skill</h4>
                  <p className="text-sm text-green-dark">Get a specific skill by source and ID.</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Use Cases */}
        <Section id="usecases">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-blue px-3 py-1 border-4 border-ink">Use Cases</span>
          </h2>

          <p className="text-lg mb-8 text-green-dark">
            Real examples of how agents can use Skyll to discover and apply skills dynamically.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <UseCaseCard
              icon={<Globe className="w-6 h-6" />}
              title="Web Research"
              skill="tavily-search"
              description="User asks 'Find the latest news on AI agents' → Agent searches Skyll for web search skills → Discovers tavily-search → Uses Tavily's LLM-optimized search API to fetch real-time results."
              color="bg-blue"
            />
            <UseCaseCard
              icon={<FlaskConical className="w-6 h-6" />}
              title="Deep Research"
              skill="gpt-researcher"
              description="User needs comprehensive market analysis → Agent queries Skyll → Finds gpt-researcher → Runs autonomous multi-step research with citations and detailed reports."
              color="bg-pink"
            />
            <UseCaseCard
              icon={<Code className="w-6 h-6" />}
              title="Testing Workflows"
              skill="test-driven-development"
              description="User says 'Add tests for this feature' → Agent doesn't know TDD → Searches Skyll → Retrieves test-driven-development skill → Follows TDD workflow."
              color="bg-yellow"
            />
            <UseCaseCard
              icon={<Wrench className="w-6 h-6" />}
              title="Building Integrations"
              skill="mcp-builder"
              description="User wants to connect app to external APIs → Agent needs MCP knowledge → Finds mcp-builder on Skyll → Creates Model Context Protocol servers following best practices."
              color="bg-orange"
            />
          </div>

          <div className="mt-8 card-brutal p-6 bg-cream">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Why Options Matter
            </h3>
            <p className="text-green-dark leading-relaxed">
              Skyll returns a <strong>ranked list</strong> of skills, not just one result. This gives agents the freedom to:
            </p>
            <ul className="mt-4 space-y-2 text-green-dark">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Choose based on the specific context of the user&apos;s request</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Prefer popular, well-tested skills (high install count)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Discover new skills they weren&apos;t pre-configured with</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Let developers filter/sort based on their own criteria</span>
              </li>
            </ul>
          </div>
        </Section>

        {/* Contributing */}
        <Section id="contributing">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-8 h-8" />
            <span className="bg-green-mid px-3 py-1 border-4 border-ink">Contributing</span>
          </h2>

          <div className="space-y-8">
            <div className="card-brutal p-6">
              <h3 className="font-bold text-xl mb-4">Add Your Skill to the Registry</h3>
              <p className="mb-4 text-green-dark">
                The community registry at <code className="bg-ink text-green-light px-2">registry/SKILLS.md</code> is 
                the easiest way to make your skill discoverable.
              </p>
              <CodeBlock 
                title="registry/SKILLS.md"
                code={`- your-skill-id | your-username/your-repo | path/to/skill | Short description of what it does`} 
              />
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="https://github.com/assafelovic/skyll/edit/main/registry/SKILLS.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brutal bg-green-mid"
                >
                  <Github className="inline w-5 h-5 mr-2" />
                  Add Your Skill
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </a>
                <a
                  href="https://github.com/assafelovic/skyll/blob/main/registry/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brutal bg-cream"
                >
                  <BookOpen className="inline w-5 h-5 mr-2" />
                  Contribution Guide
                </a>
              </div>
            </div>

            <div className="card-brutal p-6">
              <h3 className="font-bold text-xl mb-4">Requirements</h3>
              <ul className="space-y-3 text-green-dark">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5 text-green-mid flex-shrink-0" />
                  <span>Valid <code className="bg-ink text-green-light px-1">SKILL.md</code> following the <a href="https://agentskills.io" className="underline">Agent Skills Spec</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5 text-green-mid flex-shrink-0" />
                  <span>Public GitHub repository</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5 text-green-mid flex-shrink-0" />
                  <span>Description under 80 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 mt-0.5 text-green-mid flex-shrink-0" />
                  <span>Skill should be useful and well-documented</span>
                </li>
              </ul>
            </div>

            <div className="card-brutal p-6">
              <h3 className="font-bold text-xl mb-4">Add a New Skill Source</h3>
              <p className="text-green-dark mb-4">
                Want to add a new source beyond skills.sh and the registry? Implement the <code className="bg-ink text-green-light px-1">SkillSource</code> protocol:
              </p>
              <CodeBlock code={`from src.sources.base import SkillSource, SkillSearchResult

class MyCustomSource(SkillSource):
    @property
    def name(self) -> str:
        return "my-source"
    
    async def search(self, query: str, limit: int) -> list[SkillSearchResult]:
        # Your search logic here
        ...
    
    async def initialize(self) -> None:
        # Setup (called on startup)
        ...`} />
              <p className="mt-4 text-sm text-green-dark">
                See <a href="https://github.com/assafelovic/skyll/blob/main/docs/sources.md" className="underline">docs/sources.md</a> for full documentation.
              </p>
            </div>
          </div>
        </Section>

        {/* Links */}
        <Section id="links">
          <h2 className="text-3xl font-bold mb-6">Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <a 
              href="https://github.com/assafelovic/skyll" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card-brutal p-6 hover:bg-yellow/20 transition-colors"
            >
              <Github className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">GitHub</h3>
              <p className="text-sm text-green-dark">Source code & issues</p>
            </a>
            <a 
              href={`${API_URL}/docs`}
              target="_blank" 
              rel="noopener noreferrer"
              className="card-brutal p-6 hover:bg-yellow/20 transition-colors"
            >
              <Code className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">API Docs</h3>
              <p className="text-sm text-green-dark">OpenAPI / Swagger</p>
            </a>
            <a 
              href="https://skills.sh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card-brutal p-6 hover:bg-yellow/20 transition-colors"
            >
              <ExternalLink className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">skills.sh</h3>
              <p className="text-sm text-green-dark">Skill ecosystem</p>
            </a>
          </div>
        </Section>

      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t-4 border-ink/20 text-center">
        <p className="text-sm text-green-dark">
          Built with 🌱 for autonomous agents ·{" "}
          <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            Agent Skills Spec
          </a>
          {" · "}
          <a href="https://opensource.org/licenses/Apache-2.0" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            Apache-2.0
          </a>
        </p>
      </footer>
    </div>
  );
}
