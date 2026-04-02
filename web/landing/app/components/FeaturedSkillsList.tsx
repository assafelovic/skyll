"use client";

import { useState } from "react";
import { ChevronDown, Star, Github, ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { type RegistrySkill, getSkillHref } from "../data/registry";

const INITIAL_COUNT = 10;
const STEP = 15;

interface SkillWithScore extends RegistrySkill {
  relevance_score: number;
  install_count: number;
}

export default function FeaturedSkillsList({ skills }: { skills: SkillWithScore[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const hasMore = visibleCount < skills.length;
  const visible = skills.slice(0, visibleCount);

  return (
    <div>
      <div className="space-y-2">
        {visible.map((skill) => (
          <Link
            key={skill.id}
            href={getSkillHref(skill)}
            className="group card-brutal p-4 flex items-center gap-3 hover:translate-y-[-2px] transition-all duration-150"
          >
            <span className="badge bg-yellow text-[9px] px-2 py-0.5 shrink-0">
              <Star className="inline w-3 h-3 mr-0.5" />
              {skill.relevance_score.toFixed(1)}
            </span>

            <span className={`badge ${skill.color} text-[8px] uppercase tracking-wider px-1.5 py-0.5 shrink-0`}>
              {skill.category}
            </span>

            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm block truncate">{skill.title}</span>
              <span className="text-[11px] text-green-dark/70 block truncate">{skill.description}</span>
            </div>

            <span className="badge bg-green-mid text-[9px] px-1.5 py-0.5 shrink-0 hidden sm:flex items-center gap-0.5">
              <Package className="w-3 h-3" />
              {skill.install_count.toLocaleString()}
            </span>

            <span className="text-[9px] text-green-dark/40 font-mono hidden md:flex items-center gap-1 shrink-0">
              <Github className="w-3 h-3" />
              {skill.source.split("/")[0]}
            </span>

            <ExternalLink className="w-3.5 h-3.5 text-green-dark/20 group-hover:text-ink transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-5">
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + STEP, skills.length))}
            className="btn-brutal bg-cream inline-flex items-center gap-2"
          >
            Show More
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {!hasMore && visibleCount > INITIAL_COUNT && (
        <p className="text-center mt-3 text-[10px] text-green-dark/40">
          All {skills.length} registry skills
        </p>
      )}
    </div>
  );
}
