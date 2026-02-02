"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Github, Terminal, Code, Cpu, Globe, FlaskConical, 
  Wrench, Copy, Check, Star, Search, FileText, Zap, Package,
  ArrowRight, BookOpen, ExternalLink, Users, MessageCircle
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
            { href: "#install", label: "Installation" },
            { href: "#why", label: "Why Skyll?" },
            { href: "#features", label: "Features" },
            { href: "#python", label: "Python Client" },
            { href: "#api", label: "REST API" },
            { href: "#selfhosted", label: "Self-Hosted" },
            { href: "#mcp", label: "MCP Server" },
            { href: "#usecases", label: "Use Cases" },
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

        {/* Installation */}
        <Section id="install">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Package className="w-8 h-8" />
            <span className="bg-green-mid px-3 py-1 border-4 border-ink">Installation</span>
          </h2>

          <div className="card-brutal p-8">
            <p className="text-lg mb-6">
              Install the Python package to search and retrieve skills in your agents:
            </p>
            <CodeBlock code="pip install skyll" />
            
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-mid/20 border-2 border-ink">
                <h4 className="font-bold mb-2">Client Only (Default)</h4>
                <p className="text-sm text-green-dark">Lightweight client that uses the hosted API at api.skyll.app</p>
                <code className="block mt-2 text-sm bg-ink text-green-light px-2 py-1">pip install skyll</code>
              </div>
              <div className="p-4 bg-blue/20 border-2 border-ink">
                <h4 className="font-bold mb-2">With Server</h4>
                <p className="text-sm text-green-dark">Full server for self-hosting your own Skyll instance</p>
                <code className="block mt-2 text-sm bg-ink text-green-light px-2 py-1">pip install skyll[server]</code>
              </div>
            </div>
          </div>
        </Section>
        
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

        {/* Python Client */}
        <Section id="python">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Code className="w-8 h-8" />
            <span className="bg-yellow px-3 py-1 border-4 border-ink">Python Client</span>
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-3">Basic Usage</h3>
              <CodeBlock code={`from skyll import Skyll

async with Skyll() as client:
    # Search for skills
    skills = await client.search("react performance", limit=5)
    
    for skill in skills:
        print(f"📦 {skill.title}")
        print(f"   Source: {skill.source}")
        print(f"   Installs: {skill.install_count:,}")
        
        if skill.content:
            print(f"   Content: {len(skill.content):,} chars")`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3">One-liner Helper</h3>
              <CodeBlock code={`from skyll import search_skills

# Simple function for quick searches
skills = await search_skills("python testing")`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3">Get a Specific Skill</h3>
              <CodeBlock code={`async with Skyll() as client:
    skill = await client.get("anthropics/skills", "skill-creator")
    if skill:
        print(skill.content)`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3">Include References</h3>
              <p className="text-green-dark mb-3">Some skills have additional documentation in <code className="bg-ink text-green-light px-1">references/</code> directories:</p>
              <CodeBlock code={`async with Skyll() as client:
    skills = await client.search("react", include_references=True)
    
    for skill in skills:
        for ref in skill.references:
            print(f"📎 {ref.name}: {len(ref.content)} chars")`} />
            </div>

            <div className="card-brutal p-6 bg-cream">
              <h3 className="font-bold text-xl mb-4">Client Methods</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b-2 border-ink/20">
                    <td className="py-3 font-mono font-bold">search(query, limit=10)</td>
                    <td className="py-3">Search for skills matching a query</td>
                  </tr>
                  <tr className="border-b-2 border-ink/20">
                    <td className="py-3 font-mono font-bold">get(source, skill_id)</td>
                    <td className="py-3">Get a specific skill by source and ID</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono font-bold">health()</td>
                    <td className="py-3">Check API health status</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card-brutal p-6 bg-cream">
              <h3 className="font-bold text-xl mb-4">Skill Properties</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <code className="font-bold">skill.id</code> - Skill identifier<br/>
                  <code className="font-bold">skill.title</code> - Display name<br/>
                  <code className="font-bold">skill.description</code> - What it does<br/>
                  <code className="font-bold">skill.source</code> - GitHub owner/repo<br/>
                </div>
                <div>
                  <code className="font-bold">skill.content</code> - Full SKILL.md<br/>
                  <code className="font-bold">skill.install_count</code> - Popularity<br/>
                  <code className="font-bold">skill.relevance_score</code> - Ranking (0-100)<br/>
                  <code className="font-bold">skill.references</code> - Reference files<br/>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Self-Hosted */}
        <Section id="selfhosted">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Terminal className="w-8 h-8" />
            <span className="bg-orange px-3 py-1 border-4 border-ink">Self-Hosted</span>
          </h2>

          <div className="card-brutal p-6 mb-6">
            <p className="text-lg leading-relaxed">
              Run your own Skyll server for full control, higher rate limits, or private deployments.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="bg-yellow px-2 py-0.5 border-2 border-ink text-sm">Step 1</span>
                Install with Server
              </h3>
              <CodeBlock code={`pip install skyll[server]

# Or from source
git clone https://github.com/assafelovic/skyll.git
cd skyll
pip install -e ".[server]"`} />
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="bg-yellow px-2 py-0.5 border-2 border-ink text-sm">Step 2</span>
                Configure (Recommended)
              </h3>
              <CodeBlock 
                title=".env"
                code={`# GitHub token for 5000 req/hr (vs 60 unauthenticated)
GITHUB_TOKEN=ghp_your_token_here

# Cache TTL in seconds (default: 86400 = 24 hours)
CACHE_TTL=86400`} 
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
                Point Client to Your Server
              </h3>
              <CodeBlock code={`from skyll import Skyll

# Use your self-hosted instance
async with Skyll(base_url="http://localhost:8000") as client:
    skills = await client.search("testing")`} />
            </div>
          </div>
        </Section>

        {/* API Reference */}
        <Section id="api">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Globe className="w-8 h-8" />
            <span className="bg-pink px-3 py-1 border-4 border-ink">REST API</span>
          </h2>

          <div className="card-brutal p-6 mb-6">
            <p className="text-lg leading-relaxed">
              The hosted API is available at <code className="bg-ink text-green-light px-2 py-1">https://api.skyll.app</code>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="https://api.skyll.app/docs" target="_blank" rel="noopener noreferrer" className="btn-brutal bg-green-mid text-sm">
                Interactive Docs <ExternalLink className="inline w-4 h-4 ml-1" />
              </a>
              <a href="https://api.skyll.app/health" target="_blank" rel="noopener noreferrer" className="btn-brutal bg-cream text-sm">
                Health Check <ExternalLink className="inline w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

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
                      <td className="py-2">Max results, default 10, max 50</td>
                    </tr>
                    <tr className="border-b-2 border-ink/20">
                      <td className="py-2 font-mono font-bold">include_content</td>
                      <td className="py-2">Fetch full SKILL.md (default: true)</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono font-bold">include_references</td>
                      <td className="py-2">Fetch reference files (default: false)</td>
                    </tr>
                  </tbody>
                </table>

                <h4 className="font-bold mb-2">Example</h4>
                <CodeBlock code={`curl "https://api.skyll.app/search?q=react+performance&limit=3"`} />
                
                <h4 className="font-bold mb-2 mt-6">Response</h4>
                <CodeBlock code={`{
  "query": "react performance",
  "count": 1,
  "skills": [
    {
      "id": "vercel-react-best-practices",
      "title": "React Best Practices",
      "description": "Performance optimization guidelines from Vercel",
      "source": "vercel-labs/agent-skills",
      "relevance_score": 85.5,
      "install_count": 83000,
      "content": "# React Best Practices\\n\\n## Performance\\n...",
      "refs": {
        "skills_sh": "https://skills.sh/vercel-labs/agent-skills/...",
        "github": "https://github.com/vercel-labs/agent-skills/..."
      }
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
                <CodeBlock code={`curl "https://api.skyll.app/skills/anthropics/skills/skill-creator"`} />
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

        {/* Ranking Algorithm */}
        <Section id="ranking">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Star className="w-8 h-8" />
            <span className="bg-orange px-3 py-1 border-4 border-ink">Ranking Algorithm</span>
          </h2>

          <div className="card-brutal p-6 mb-6">
            <p className="text-lg leading-relaxed">
              Skyll uses a <strong>multi-signal ranking algorithm</strong> to order search results by relevance. 
              Each skill receives a score from <strong>0-100</strong> based on four weighted factors.
            </p>
          </div>

          <div className="space-y-8">
            {/* Scoring Formula */}
            <div className="card-brutal overflow-hidden">
              <div className="bg-ink text-cream px-4 py-3 font-bold">
                Scoring Formula
              </div>
              <div className="p-6">
                <code className="block bg-green-mid/30 p-4 font-mono text-lg border-2 border-ink">
                  score = content + references + query_match + popularity
                </code>
              </div>
            </div>

            {/* Signals Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Content */}
              <div className="card-brutal p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-mid p-2 border-2 border-ink">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Content Availability</h3>
                    <span className="text-sm font-mono bg-ink text-green-light px-2">40 pts max</span>
                  </div>
                </div>
                <p className="text-green-dark mb-4">
                  Skills with successfully fetched SKILL.md content receive 40 points. 
                  This ensures skills with actual content rank above those that failed to fetch.
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">Has content</td>
                      <td className="py-2 text-right font-bold text-green-dark">+40</td>
                    </tr>
                    <tr>
                      <td className="py-2">No content (fetch failed)</td>
                      <td className="py-2 text-right font-bold">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Query Match */}
              <div className="card-brutal p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow p-2 border-2 border-ink">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Query Match</h3>
                    <span className="text-sm font-mono bg-ink text-green-light px-2">30 pts max</span>
                  </div>
                </div>
                <p className="text-green-dark mb-4">
                  How well the skill ID matches the search query.
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">Exact ID match</td>
                      <td className="py-2 text-right font-bold text-green-dark">+30</td>
                    </tr>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">All query terms in ID</td>
                      <td className="py-2 text-right font-bold text-green-dark">+27</td>
                    </tr>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">All ID terms in query</td>
                      <td className="py-2 text-right font-bold">+25.5</td>
                    </tr>
                    <tr>
                      <td className="py-2">Partial matches</td>
                      <td className="py-2 text-right font-bold">0-15</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* References */}
              <div className="card-brutal p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-pink p-2 border-2 border-ink">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">References</h3>
                    <span className="text-sm font-mono bg-ink text-green-light px-2">15 pts max</span>
                  </div>
                </div>
                <p className="text-green-dark mb-4">
                  When <code className="bg-ink text-green-light px-1">include_references=true</code>, skills with 
                  additional .md files receive a boost.
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">Has references (when requested)</td>
                      <td className="py-2 text-right font-bold text-green-dark">+15</td>
                    </tr>
                    <tr>
                      <td className="py-2">No references</td>
                      <td className="py-2 text-right font-bold">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Popularity */}
              <div className="card-brutal p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue p-2 border-2 border-ink">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Popularity</h3>
                    <span className="text-sm font-mono bg-ink text-green-light px-2">15 pts max</span>
                  </div>
                </div>
                <p className="text-green-dark mb-4">
                  Install count from skills.sh, using <strong>logarithmic scaling</strong> to prevent 
                  extremely popular skills from dominating.
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">10,000+ installs</td>
                      <td className="py-2 text-right font-bold text-green-dark">+15</td>
                    </tr>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">1,000 installs</td>
                      <td className="py-2 text-right font-bold">+11.25</td>
                    </tr>
                    <tr className="border-b border-ink/20">
                      <td className="py-2">100 installs</td>
                      <td className="py-2 text-right font-bold">+7.5</td>
                    </tr>
                    <tr>
                      <td className="py-2">0 installs</td>
                      <td className="py-2 text-right font-bold">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example Scores Table */}
            <div className="card-brutal overflow-hidden">
              <div className="bg-yellow px-4 py-3 border-b-4 border-ink font-bold">
                Example Scores
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream">
                      <th className="text-left p-3 border-b-2 border-ink">Skill</th>
                      <th className="text-center p-3 border-b-2 border-ink">Content</th>
                      <th className="text-center p-3 border-b-2 border-ink">Refs</th>
                      <th className="text-center p-3 border-b-2 border-ink">Query</th>
                      <th className="text-center p-3 border-b-2 border-ink">Pop.</th>
                      <th className="text-center p-3 border-b-2 border-ink font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-ink/20">
                      <td className="p-3">Exact match, popular, with content</td>
                      <td className="text-center p-3">40</td>
                      <td className="text-center p-3">15</td>
                      <td className="text-center p-3">30</td>
                      <td className="text-center p-3">15</td>
                      <td className="text-center p-3 font-bold bg-green-mid/30">100</td>
                    </tr>
                    <tr className="border-b border-ink/20">
                      <td className="p-3">Good match, popular, with content</td>
                      <td className="text-center p-3">40</td>
                      <td className="text-center p-3">0</td>
                      <td className="text-center p-3">25</td>
                      <td className="text-center p-3">12</td>
                      <td className="text-center p-3 font-bold bg-green-mid/20">77</td>
                    </tr>
                    <tr className="border-b border-ink/20">
                      <td className="p-3">Partial match, new skill</td>
                      <td className="text-center p-3">40</td>
                      <td className="text-center p-3">0</td>
                      <td className="text-center p-3">15</td>
                      <td className="text-center p-3">0</td>
                      <td className="text-center p-3 font-bold">55</td>
                    </tr>
                    <tr>
                      <td className="p-3">No content (fetch failed)</td>
                      <td className="text-center p-3">0</td>
                      <td className="text-center p-3">0</td>
                      <td className="text-center p-3">30</td>
                      <td className="text-center p-3">15</td>
                      <td className="text-center p-3 font-bold text-pink">45</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Design Rationale */}
            <div className="card-brutal p-6 bg-cream">
              <h3 className="font-bold text-xl mb-4">Design Rationale</h3>
              <div className="space-y-4 text-green-dark">
                <div className="flex items-start gap-3">
                  <span className="bg-green-mid px-2 py-0.5 border-2 border-ink text-sm font-bold shrink-0">1</span>
                  <p><strong>Content is king.</strong> Skills without content are not useful, so content availability dominates the score.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-mid px-2 py-0.5 border-2 border-ink text-sm font-bold shrink-0">2</span>
                  <p><strong>Query relevance matters.</strong> Exact matches should rank above partial matches, regardless of popularity.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-mid px-2 py-0.5 border-2 border-ink text-sm font-bold shrink-0">3</span>
                  <p><strong>Popularity is a signal, not the answer.</strong> Log scaling prevents extremely popular skills from dominating. A skill with 100 installs and good query match can outrank a skill with 10,000 installs and poor match.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-mid px-2 py-0.5 border-2 border-ink text-sm font-bold shrink-0">4</span>
                  <p><strong>References add value.</strong> When users request references, skills that provide them are more valuable.</p>
                </div>
              </div>
            </div>

            {/* Custom Ranker */}
            <div>
              <h3 className="font-bold text-xl mb-4">Create a Custom Ranker</h3>
              <p className="text-green-dark mb-4">
                The ranking algorithm is modular. Implement the <code className="bg-ink text-green-light px-1">Ranker</code> protocol to create your own:
              </p>
              <CodeBlock code={`from src.ranking.base import Ranker

class MyCustomRanker(Ranker):
    def rank(self, skills, query="", include_references=False):
        for skill in skills:
            # Your scoring logic
            skill.relevance_score = ...
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)

# Register in src/core/service.py:
self._ranker = MyCustomRanker()`} />
            </div>

            {/* Future Enhancements */}
            <div className="card-brutal p-6 border-l-4 border-l-blue">
              <h3 className="font-bold text-xl mb-4">Future Enhancements</h3>
              <p className="text-green-dark mb-4">
                The ranking system is designed for extension. We welcome community contributions:
              </p>
              <ul className="space-y-2 text-green-dark">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <strong>Semantic search:</strong> Use embeddings to match query intent, not just keywords
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <strong>Recency:</strong> Boost recently updated skills
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <strong>Quality signals:</strong> Factor in documentation completeness, test coverage
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <strong>User feedback:</strong> Learn from click-through rates
                </li>
              </ul>
              <p className="mt-4 text-sm">
                Open an <a href="https://github.com/assafelovic/skyll/issues" className="underline font-bold">issue</a> or <a href="https://github.com/assafelovic/skyll/pulls" className="underline font-bold">PR</a> to discuss!
              </p>
            </div>
          </div>
        </Section>

        {/* MCP Server */}
        <Section id="mcp">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="w-8 h-8" />
            <span className="bg-pink px-3 py-1 border-4 border-ink">MCP Server</span>
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
          
          <div className="grid md:grid-cols-4 gap-4">
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
              href="https://discord.gg/CxdMdfZS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card-brutal p-6 hover:bg-yellow/20 transition-colors"
            >
              <MessageCircle className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Discord</h3>
              <p className="text-sm text-green-dark">Community & support</p>
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
          Built with ❤️ for autonomous agents ·{" "}
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
