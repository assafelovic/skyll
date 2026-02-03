"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Github, BookOpen, Zap, Package, Star, FileText, 
  ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";

// Copyable code block component
function CopyableCode({ code, className = "text-sm" }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <pre className={`bg-ink text-green-light p-4 ${className} overflow-x-auto pr-12`}>
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-green-dark/50 hover:bg-green-dark text-green-light rounded transition-colors"
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// Discord logo SVG component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SkillReference {
  name: string;
  path: string;
  content: string;
  raw_url: string;
}

interface Skill {
  id: string;
  title: string;
  description: string;
  source: string;
  content: string;
  install_count: number;
  relevance_score: number;
  fetch_error?: string;
  refs?: {
    skills_sh: string;
    github: string;
  };
  references?: SkillReference[];
}

interface SearchResponse {
  query: string;
  count: number;
  skills: Skill[];
}

function TopIcons() {
  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1.5 md:gap-2 z-10">
      <Link
        href="/docs"
        className="p-1.5 md:p-2 bg-cream/90 border-2 border-ink hover:bg-orange transition-colors"
        style={{ boxShadow: '2px 2px 0 #1a1a1a' }}
        title="Documentation"
      >
        <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </Link>
      <a
        href="https://github.com/assafelovic/skyll"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 md:p-2 bg-cream/90 border-2 border-ink hover:bg-ink hover:text-cream transition-colors"
        style={{ boxShadow: '2px 2px 0 #1a1a1a' }}
        title="GitHub"
      >
        <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </a>
      <a
        href="https://discord.gg/CxdMdfZS"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 md:p-2 bg-cream/90 border-2 border-ink hover:bg-discord hover:text-white transition-colors"
        style={{ boxShadow: '2px 2px 0 #1a1a1a' }}
        title="Discord"
      >
        <DiscordIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </a>
    </div>
  );
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [showContent, setShowContent] = useState(false);
  const [showRefs, setShowRefs] = useState(false);
  
  const hasContent = skill.content && !skill.fetch_error;
  const hasRefs = skill.references && skill.references.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-brutal transition-all duration-200"
    >
      <div className="p-6 flex flex-wrap justify-between items-start gap-4">
        <h3 className="font-bold text-xl">{skill.title || skill.id}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-yellow">
            <Star className="inline w-3 h-3 mr-1" />
            {skill.relevance_score.toFixed(1)}
          </span>
          <span className="badge bg-green-mid">
            <Package className="inline w-3 h-3 mr-1" />
            {skill.install_count.toLocaleString()}
          </span>
          <span className="badge bg-blue">
            <FileText className="inline w-3 h-3 mr-1" />
            {skill.source}
          </span>
          {hasRefs && (
            <span className="badge bg-pink">📎 {skill.references!.length}</span>
          )}
        </div>
      </div>

      {skill.description && (
        <p className="px-6 pb-4 text-green-dark text-sm leading-relaxed">
          {skill.description}
        </p>
      )}

      {hasContent && (
        <>
          <button
            onClick={() => setShowContent(!showContent)}
            className="mx-6 mb-4 btn-brutal bg-orange text-sm py-2 px-4"
          >
            <FileText className="inline w-4 h-4 mr-2" />
            {showContent ? "Hide" : "Show"} Content
            {showContent ? <ChevronUp className="inline w-4 h-4 ml-2" /> : <ChevronDown className="inline w-4 h-4 ml-2" />}
          </button>
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <pre className="bg-ink text-green-light p-6 text-sm leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap break-words">
                  {skill.content}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {skill.fetch_error && (
        <p className="px-6 pb-4 text-amber-700 text-sm italic">
          Content unavailable — view on GitHub for details
        </p>
      )}

      {hasRefs && (
        <>
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="mx-6 mb-4 btn-brutal bg-pink text-sm py-2 px-4"
          >
            📎 {showRefs ? "Hide" : "Show"} {skill.references!.length} References
            {showRefs ? <ChevronUp className="inline w-4 h-4 ml-2" /> : <ChevronDown className="inline w-4 h-4 ml-2" />}
          </button>
          <AnimatePresence>
            {showRefs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-3">
                  {skill.references!.map((ref, i) => (
                    <ReferenceItem key={i} reference={ref} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="p-4 border-t-4 border-ink bg-green-light flex flex-wrap gap-3">
        {skill.refs?.skills_sh && (
          <a href={skill.refs.skills_sh} target="_blank" rel="noopener noreferrer" className="btn-brutal bg-cream text-sm py-2 px-4">
            <Zap className="inline w-4 h-4 mr-2" />skills.sh
          </a>
        )}
        {skill.refs?.github && (
          <a href={skill.refs.github} target="_blank" rel="noopener noreferrer" className="btn-brutal bg-cream text-sm py-2 px-4">
            <Github className="inline w-4 h-4 mr-2" />GitHub
          </a>
        )}
      </div>
    </motion.div>
  );
}

function ReferenceItem({ reference }: { reference: SkillReference }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-ink bg-cream">
      <div className="flex justify-between items-center p-3 bg-blue border-b-2 border-ink">
        <span className="font-semibold text-sm">📎 {reference.name}</span>
        <button onClick={() => setExpanded(!expanded)} className="btn-brutal bg-yellow text-xs py-1 px-2">
          {expanded ? "Hide" : "Show"}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.pre
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-ink text-green-light p-4 text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap break-words"
          >
            {reference.content || "Content not loaded"}
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [includeRefs, setIncludeRefs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString() });
      if (includeRefs) params.append("include_references", "true");

      const response = await fetch(`${API_URL}/search?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-light bg-gradient-garden flex flex-col">
      <TopIcons />

      {/* Main Content - Centered, fills viewport */}
      <main className="flex-1 container mx-auto px-4 pt-16 md:pt-12 py-12 flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Image src="/logo.png" alt="Skyll" width={64} height={64} className="drop-shadow-lg" />
            </motion.div>
            <h1 className="font-mono font-extrabold text-5xl md:text-6xl tracking-tight">skyll</h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <p className="bg-yellow border-4 border-ink px-6 py-3 font-bold text-lg shadow-brutal-sm">
              Skill discovery for AI agents
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 max-w-xl mx-auto text-green-dark leading-relaxed"
          >
            Give any AI agent the power to discover and use new skills on demand. Search, retrieve, inject into context.
          </motion.p>
        </motion.header>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-brutal p-6 md:p-8 max-w-3xl mx-auto w-full"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search skills... (e.g., react performance, testing)"
              className="flex-1 font-mono text-lg p-4 border-4 border-ink bg-cream placeholder:text-gray-500"
              autoFocus
            />
            <button onClick={handleSearch} disabled={loading} className="btn-brutal bg-green-mid flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              Limit:
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                min={1}
                max={20}
                className="w-16 p-2 border-2 border-ink text-center font-mono"
              />
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={includeRefs} onChange={(e) => setIncludeRefs(e.target.checked)} className="w-5 h-5 accent-green-mid" />
              Include references
            </label>
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 p-4 bg-yellow border-2 border-ink animate-pulse">
                🔍 Discovering skills...
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 p-4 bg-pink border-2 border-ink">
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 max-w-3xl mx-auto w-full">
            {results.skills.length > 0 ? (
              <div className="space-y-6">
                {results.skills.map((skill, index) => (
                  <SkillCard key={skill.id} skill={skill} index={index} />
                ))}
              </div>
            ) : (
              <div className="card-brutal p-12 text-center">
                <div className="text-6xl mb-4">🌿</div>
                <p className="text-lg">No skills found for &quot;{results.query}&quot;</p>
                <p className="mt-2 text-green-dark">Try a different search term</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Quick Start Section */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-mono font-bold text-3xl mb-3">Get Started</h2>
          <p className="text-green-dark max-w-2xl mx-auto">
            Agents can dynamically discover and learn skills at runtime. Instead of humans pre-loading skills, agents can search autonomously and inject into context.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Skills.sh */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-brutal p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-green-mid px-3 py-1 border-2 border-ink font-bold text-sm">skills.sh</span>
            </div>
            <p className="text-xs text-green-dark mb-4">
              Add as a skill so agents can discover other skills on demand
            </p>
            <CopyableCode code="npx skills add assafelovic/skyll" />
            <p className="mt-4 text-xs text-green-dark">
              View on{" "}
              <a href="https://skills.sh/assafelovic/skyll/skyll" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                skills.sh
              </a>
            </p>
          </motion.div>

          {/* Python */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-brutal p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-orange px-3 py-1 border-2 border-ink font-bold text-sm">Python</span>
            </div>
            <p className="text-xs text-green-dark mb-4">
              Use the client library for programmatic access
            </p>
            <CopyableCode code="pip install skyll" className="text-sm mb-4" />
            <CopyableCode 
              code={`from skyll import Skyll

async with Skyll() as client:
    skills = await client.search("react")`}
              className="text-xs"
            />
          </motion.div>
        </div>

        {/* Scoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-brutal p-6 bg-yellow/30"
        >
          <div className="flex items-start gap-4">
            <Star className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">How Scoring Works</h3>
              <p className="text-sm text-green-dark leading-relaxed mb-2">
                Skills are fetched in realtime from top sources like <strong>skills.sh</strong>, so results are always fresh. 
                Each skill is ranked 0-100 based on four signals: <strong>content availability</strong> (40 pts), 
                <strong> query match</strong> (30 pts), <strong>popularity</strong> (15 pts), and <strong>references</strong> (15 pts).
              </p>
              <p className="text-xs text-green-dark/70 italic">
                Semantic search with embeddings coming soon.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/docs" className="btn-brutal bg-green-mid inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Read the Docs
          </Link>
        </motion.div>
      </section>

      {/* Spacer to push footer below viewport */}
      <div className="flex-1 min-h-[10vh]" />

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t-4 border-ink/20 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Skyll" width={28} height={28} />
            <span className="font-bold text-lg">skyll</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="https://github.com/assafelovic/skyll" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink transition-colors text-green-dark">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <Link href="/docs" className="flex items-center gap-2 hover:text-ink transition-colors text-green-dark">
              <BookOpen className="w-4 h-4" /> Docs
            </Link>
            <a href="https://discord.gg/CxdMdfZS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink transition-colors text-green-dark">
              <DiscordIcon className="w-4 h-4" /> Discord
            </a>
          </div>
        </div>
        
        <p className="text-center mt-6 text-xs text-green-dark">
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
