import { ArrowLeft, Github, Zap, Package, Star, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import CopyButton from "../../components/CopyButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skyll.app";

interface SkillData {
  id: string;
  title: string;
  description: string;
  source: string;
  content: string;
  install_count: number;
  relevance_score: number;
  fetch_error?: string;
  refs?: { skills_sh: string; github: string };
  references?: { name: string; path: string; content: string; raw_url: string }[];
}

async function fetchSkill(slug: string[]): Promise<SkillData | null> {
  const path = slug.map(encodeURIComponent).join("/");
  try {
    const res = await fetch(`${API_URL}/skill/${path}?include_references=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const skill = await fetchSkill(slug);
  if (!skill) return { title: "Skill Not Found - Skyll" };
  return {
    title: `${skill.title || skill.id} - Skyll`,
    description: skill.description || `Agent skill: ${skill.id}`,
  };
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const skill = await fetchSkill(slug);

  if (!skill) notFound();

  return (
    <div className="min-h-screen bg-green-light bg-gradient-garden">
      {/* Back */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 p-2.5 bg-cream border-3 border-ink shadow-brutal-sm hover:bg-yellow transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <main className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="font-mono font-extrabold text-2xl md:text-3xl mb-1">{skill.title || skill.id}</h1>
              {skill.description && (
                <p className="text-sm text-green-dark leading-relaxed">{skill.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Image src="/logo.png" alt="Skyll" width={32} height={32} />
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge bg-yellow">
              <Star className="inline w-3 h-3 mr-1" />
              {skill.relevance_score?.toFixed(1) ?? "—"}
            </span>
            <span className="badge bg-green-mid">
              <Package className="inline w-3 h-3 mr-1" />
              {(skill.install_count ?? 0).toLocaleString()} installs
            </span>
            <span className="badge bg-blue">
              <FileText className="inline w-3 h-3 mr-1" />
              {skill.source}
            </span>
          </div>

          {/* Action links */}
          <div className="flex flex-wrap gap-2">
            {skill.refs?.skills_sh && (
              <a href={skill.refs.skills_sh} target="_blank" rel="noopener noreferrer" className="btn-brutal bg-cream py-1.5 px-3 inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> skills.sh
                <ExternalLink className="w-3 h-3 opacity-40" />
              </a>
            )}
            {skill.refs?.github && (
              <a href={skill.refs.github} target="_blank" rel="noopener noreferrer" className="btn-brutal bg-cream py-1.5 px-3 inline-flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" /> GitHub
                <ExternalLink className="w-3 h-3 opacity-40" />
              </a>
            )}
          </div>
        </header>

        {/* Install snippet */}
        <div className="card-brutal p-4 mb-6">
          <p className="text-[10px] text-green-dark mb-1.5 font-medium uppercase tracking-wider">Add to your agent</p>
          <div className="relative">
            <pre className="bg-ink text-green-light p-3 pr-12 text-xs overflow-x-auto font-mono">
              <code>{`curl "https://api.skyll.app/skill/${slug.join("/")}"`}</code>
            </pre>
            <CopyButton text={`curl "https://api.skyll.app/skill/${slug.join("/")}"`} />
          </div>
        </div>

        {/* Content */}
        {skill.content && !skill.fetch_error ? (
          <div className="card-brutal overflow-hidden">
            <div className="bg-ink text-cream px-4 py-2 text-xs font-bold border-b-3 border-ink flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              SKILL.md
            </div>
            <pre className="p-5 text-xs leading-relaxed whitespace-pre-wrap break-words max-h-[70vh] overflow-y-auto bg-cream">
              {skill.content}
            </pre>
          </div>
        ) : skill.fetch_error ? (
          <div className="card-brutal p-6 text-center">
            <p className="text-sm text-green-dark italic">Content unavailable — view on GitHub for details.</p>
          </div>
        ) : null}

        {/* References */}
        {skill.references && skill.references.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="font-bold text-sm">References ({skill.references.length})</h2>
            {skill.references.map((ref, i) => (
              <div key={i} className="card-brutal overflow-hidden">
                <div className="bg-blue px-4 py-2 text-xs font-bold border-b-3 border-ink">
                  📎 {ref.name}
                </div>
                <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto bg-cream">
                  {ref.content || "Content not available"}
                </pre>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
