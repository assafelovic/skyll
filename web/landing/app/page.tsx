import { BookOpen, Github, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SkillSearch from "./components/SkillSearch";
import CopyBlock from "./components/CopyBlock";
import FeaturedSkillsList from "./components/FeaturedSkillsList";
import { FadeDown, FadeUp, FadeIn, SpringIn, ScrollReveal } from "./components/AnimatedSection";
import { REGISTRY_SKILLS, type RegistrySkill } from "./data/registry";
import scoresData from "./data/scores.json";

export interface SkillWithScore extends RegistrySkill {
  relevance_score: number;
  install_count: number;
}

function getSkillsWithScores(): SkillWithScore[] {
  const scores = scoresData as Record<string, { relevance_score: number; install_count: number }>;
  return REGISTRY_SKILLS
    .map((skill) => ({
      ...skill,
      relevance_score: scores[skill.id]?.relevance_score ?? 0,
      install_count: scores[skill.id]?.install_count ?? 0,
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score);
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function Home() {
  const skillsWithScores = getSkillsWithScores();

  return (
    <div className="min-h-screen bg-green-light bg-gradient-garden flex flex-col">
      {/* Top Navigation */}
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-14 md:pt-10 py-10 flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Hero */}
        <FadeDown>
          <header className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <SpringIn>
                <Image src="/logo.png" alt="Skyll" width={52} height={52} className="drop-shadow-lg" />
              </SpringIn>
              <h1 className="font-mono font-extrabold text-4xl md:text-5xl tracking-tight">skyll</h1>
            </div>

            <FadeIn delay={0.2} className="inline-block">
              <p data-speakable="tagline" className="bg-yellow border-3 border-ink px-5 py-2.5 font-bold text-base shadow-brutal-sm">
                Skill discovery for AI agents
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p data-speakable="description" className="mt-5 max-w-lg mx-auto text-green-dark leading-relaxed text-sm">
                Give any AI agent the power to discover and use new skills on demand. Search, retrieve, inject into context.
              </p>
            </FadeIn>
          </header>
        </FadeDown>

        {/* Interactive Search - Client component */}
        <FadeUp delay={0.4}>
          <SkillSearch />
        </FadeUp>
      </main>

      {/* Skill Registry */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <ScrollReveal className="text-center mb-6">
          <h2 className="font-mono font-bold text-2xl mb-2">Skill Registry</h2>
          <p className="text-green-dark max-w-xl mx-auto text-sm">
            A curated collection of verified, security-audited agent skills maintained by trusted open-source authors.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <FeaturedSkillsList skills={skillsWithScores} />
        </ScrollReveal>
      </section>

      {/* Get Started Section */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <ScrollReveal className="text-center mb-8">
          <h2 className="font-mono font-bold text-2xl mb-2">Get Started</h2>
          <p className="text-green-dark max-w-xl mx-auto text-sm">
            Skyll aggregates skills from multiple sources, ranks them by relevance, and returns the best matches.
            Agents discover and learn skills autonomously.
          </p>
        </ScrollReveal>

        <div className="space-y-4 mb-8">
          {/* MCP */}
          <ScrollReveal><div className="card-brutal p-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="md:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-pink px-2.5 py-0.5 border-2 border-ink font-bold text-xs">MCP Server</span>
                  <span className="text-[10px] text-green-dark">Recommended</span>
                </div>
                <h3 className="font-bold text-base mb-1.5">Hosted MCP</h3>
                <p className="text-xs text-green-dark leading-relaxed">
                  Add Skyll to any MCP-compatible client, or install as a skill for agents
                  that support it. Your agent can search, discover, and learn skills on demand.
                </p>
              </div>
              <div className="md:w-1/2 space-y-2">
                <div>
                  <p className="text-[10px] text-green-dark mb-1.5 font-medium">Add to your MCP config:</p>
                  <CopyBlock
                    code={`{
  "mcpServers": {
    "skyll": {
      "url": "https://api.skyll.app/mcp"
    }
  }
}`}
                    className="text-xs"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-green-dark mb-1 font-medium">Or add as a skill:</p>
                  <CopyBlock code="npx skills add assafelovic/skyll" className="text-xs" />
                </div>
              </div>
            </div>
          </div></ScrollReveal>

          {/* Python */}
          <ScrollReveal><div className="card-brutal p-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="md:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue px-2.5 py-0.5 border-2 border-ink font-bold text-xs">Python</span>
                </div>
                <h3 className="font-bold text-base mb-1.5">Client Library</h3>
                <p className="text-xs text-green-dark leading-relaxed">
                  Use the Python client for typed, async access. Perfect for custom agents
                  where context engineering matters.
                </p>
              </div>
              <div className="md:w-1/2 space-y-2">
                <div>
                  <p className="text-[10px] text-green-dark mb-1 font-medium">Install:</p>
                  <CopyBlock code="pip install skyll" className="text-xs" />
                </div>
                <CopyBlock
                  code={`from skyll import Skyll

async with Skyll() as client:
    skills = await client.search("react")`}
                  className="text-xs"
                />
              </div>
            </div>
          </div></ScrollReveal>

          {/* REST API */}
          <ScrollReveal><div className="card-brutal p-5">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="md:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-orange px-2.5 py-0.5 border-2 border-ink font-bold text-xs">REST API</span>
                </div>
                <h3 className="font-bold text-base mb-1.5">Direct API Access</h3>
                <p className="text-xs text-green-dark leading-relaxed">
                  Call the API from any language or framework. Fetch the latest version of any skill
                  by name, or search across all sources with a single request.
                </p>
              </div>
              <div className="md:w-1/2 space-y-2">
                <div>
                  <p className="text-[10px] text-green-dark mb-1 font-medium">Get a specific skill:</p>
                  <CopyBlock code={`curl "https://api.skyll.app/skill/tavily-ai/skills/search"`} className="text-xs" />
                </div>
                <div>
                  <p className="text-[10px] text-green-dark mb-1 font-medium">Search for skills:</p>
                  <CopyBlock code={`curl "https://api.skyll.app/search?q=testing&limit=5"`} className="text-xs" />
                </div>
              </div>
            </div>
          </div></ScrollReveal>
        </div>

        {/* Scoring */}
        <ScrollReveal><div className="card-brutal p-5 bg-yellow/30">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1.5">How Scoring Works</h3>
              <p className="text-xs text-green-dark leading-relaxed mb-2">
                Skills are gathered in realtime from multiple sources (skills.sh, curated registry, and more),
                so results are always fresh. Each skill is ranked <strong>0-100</strong> based on: <strong>content
                availability</strong> (40 pts), <strong>query match</strong> (30 pts), <strong>popularity</strong> (15 pts),
                and <strong>references</strong> (15 pts).
              </p>
              <p className="text-xs text-green-dark leading-relaxed mb-1">
                Skills from the community-curated registry get a small boost (up to 8 pts) scaled by how relevant
                they are to your query. The boost helps surface trusted skills while preserving real
                popularity and relevance signals.
              </p>
              <p className="text-[10px] text-green-dark/70 italic">
                Semantic search with embeddings coming soon.
              </p>
            </div>
          </div>
        </div></ScrollReveal>

        {/* CTA */}
        <ScrollReveal className="text-center mt-8">
          <Link href="/docs" className="btn-brutal bg-green-mid inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Read the Docs
          </Link>
        </ScrollReveal>
      </section>

      <div className="flex-1 min-h-[6vh]" />

      {/* Footer - Server rendered */}
      <footer className="container mx-auto px-4 py-6 border-t-3 border-ink/20 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Skyll" width={22} height={22} />
            <span className="font-bold text-sm">skyll</span>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-xs">
            <a href="https://github.com/assafelovic/skyll" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-ink transition-colors text-green-dark">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
            <Link href="/docs" className="flex items-center gap-1.5 hover:text-ink transition-colors text-green-dark">
              <BookOpen className="w-3.5 h-3.5" /> Docs
            </Link>
            <a href="https://discord.gg/CxdMdfZS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-ink transition-colors text-green-dark">
              <DiscordIcon className="w-3.5 h-3.5" /> Discord
            </a>
          </div>
        </div>

        <p className="text-center mt-4 text-[10px] text-green-dark">
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
