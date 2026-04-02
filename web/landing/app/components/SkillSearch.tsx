"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, FileText, Package, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import Link from "next/link";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skyll.app";

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
      <div className="p-4 flex flex-wrap justify-between items-start gap-3">
        <h3 className="font-bold text-base">{skill.title || skill.id}</h3>
        <div className="flex flex-wrap items-center gap-2">
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
        <p className="px-4 pb-3 text-green-dark text-xs leading-relaxed">
          {skill.description}
        </p>
      )}

      <div className="px-4 mb-3 flex flex-wrap items-center gap-2">
        {hasContent && (
          <button
            onClick={() => setShowContent(!showContent)}
            className="btn-brutal bg-orange py-1.5 px-3"
          >
            <FileText className="inline w-4 h-4 mr-2" />
            {showContent ? "Hide" : "Show"} Content
            {showContent ? <ChevronUp className="inline w-4 h-4 ml-2" /> : <ChevronDown className="inline w-4 h-4 ml-2" />}
          </button>
        )}

        {hasRefs && (
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="btn-brutal bg-pink py-1.5 px-3"
          >
            📎 {showRefs ? "Hide" : "Show"} {skill.references!.length} References
            {showRefs ? <ChevronUp className="inline w-4 h-4 ml-2" /> : <ChevronDown className="inline w-4 h-4 ml-2" />}
          </button>
        )}

        <Link href={`/skill/${skill.id}`} target="_blank" rel="noopener noreferrer" className="btn-brutal bg-green-mid py-1.5 px-3 inline-flex items-center gap-1 text-xs">
          <ExternalLink className="w-3.5 h-3.5" /> View Page
        </Link>
      </div>

      {hasContent && (
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
      )}

      {skill.fetch_error && (
        <p className="px-4 pb-3 text-amber-700 text-xs italic">
          Content unavailable — view on GitHub for details
        </p>
      )}

      {hasRefs && (
        <>
          <AnimatePresence>
            {showRefs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2">
                  {skill.references!.map((ref, i) => (
                    <ReferenceItem key={i} reference={ref} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

    </motion.div>
  );
}

export default function SkillSearch() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSearchTime(null);

    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString(), include_references: "true" });

      const start = performance.now();
      const response = await fetch(`${API_URL}/search?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data: SearchResponse = await response.json();
      setSearchTime(Math.round(performance.now() - start));
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card-brutal p-5 md:p-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search skills... (e.g., react performance, testing)"
            className="flex-1 font-mono text-sm p-3 border-3 border-ink bg-cream placeholder:text-gray-500"
            autoFocus
          />
          <button onClick={handleSearch} disabled={loading} className="btn-brutal bg-green-mid flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-xs">
            Limit:
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
              min={1}
              max={20}
              className="w-14 p-1.5 border-2 border-ink text-center font-mono text-xs"
            />
          </label>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 p-3 bg-yellow border-2 border-ink animate-pulse text-sm">
              🔍 Discovering skills...
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 p-3 bg-pink border-2 border-ink text-sm">
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {results && (
        <div className="mt-8 max-w-3xl mx-auto w-full">
          {results.skills.length > 0 ? (
            <div className="space-y-6">
              <p className="text-xs text-green-dark/60 text-right">
                {results.count} {results.count === 1 ? "result" : "results"}{searchTime !== null && <> in {searchTime}ms</>}
              </p>
              {results.skills.map((skill, index) => (
                <SkillCard key={`${skill.id}-${skill.source}`} skill={skill} index={index} />
              ))}
            </div>
          ) : (
            <div className="card-brutal p-8 text-center">
              <p className="text-sm">No skills found for &quot;{results.query}&quot;</p>
              <p className="mt-1 text-green-dark text-xs">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
