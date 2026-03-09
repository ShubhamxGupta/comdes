import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Dna,
  CheckCircle2,
  Braces,
  FileCode2,
  ScanLine,
  Zap,
  Share2,
  Keyboard,
  Sparkles,
} from "lucide-react";

const PHASE_CARDS = [
  {
    title: "Lexical Analyzer",
    desc: "Tokenize source code into lexemes and build a complete symbol table.",
    icon: ScanLine,
    color: "teal",
    features: [
      "Keyword & identifier recognition",
      "Colored token stream visualization",
      "Symbol table with occurrences",
      "Multi-language token support",
    ],
    href: "/lexer",
    label: "Open Lexer",
  },
  {
    title: "Syntax Solver",
    desc: "Step-by-step engine for context-free grammars with five parsing algorithms.",
    icon: Code2,
    color: "blue",
    features: [
      "Compute FIRST & FOLLOW sets",
      "Generate LL(1) / LR parsing tables",
      "Visualize parse trees & automata",
      "Share grammars via URL",
    ],
    href: "/solve",
    label: "Open Solver",
  },
  {
    title: "Semantic Solver",
    desc: "Evaluate syntax-directed translations with annotated parse trees.",
    icon: Braces,
    color: "violet",
    features: [
      "Define semantic actions inline",
      "S-attributed / L-attributed SDTs",
      "Annotated parse tree visualization",
      "Step-by-step evaluation trace",
    ],
    href: "/semantic",
    label: "Open Semantic",
  },
  {
    title: "ICG Solver",
    desc: "Generate intermediate three-address code, quadruples, triples, and indirect triples.",
    icon: FileCode2,
    color: "amber",
    features: [
      "Three-Address Code generation",
      "Quadruples & Triples tables",
      "Indirect triples with pointers",
      "Arithmetic expression support",
    ],
    href: "/icg",
    label: "Open ICG",
  },
];

const COLOR_MAP: Record<
  string,
  { border: string; bg: string; text: string; hoverBg: string }
> = {
  teal: {
    border: "hover:border-teal-500/40",
    bg: "bg-teal-500/10",
    text: "text-teal-500",
    hoverBg: "group-hover:bg-teal-600 group-hover:text-white",
  },
  blue: {
    border: "hover:border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    hoverBg: "group-hover:bg-blue-600 group-hover:text-white",
  },
  violet: {
    border: "hover:border-violet-500/40",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    hoverBg: "group-hover:bg-violet-600 group-hover:text-white",
  },
  amber: {
    border: "hover:border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    hoverBg: "group-hover:bg-amber-600 group-hover:text-white",
  },
  green: {
    border: "hover:border-green-500/40",
    bg: "bg-green-500/10",
    text: "text-green-500",
    hoverBg: "group-hover:bg-green-600 group-hover:text-white",
  },
};

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 pb-16">
      {/* --- Hero --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/[0.06] via-card to-blue-500/[0.04] p-8 md:p-14 border border-border/40 shadow-sm mt-2">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-blue-500/[0.06] blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <div className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm text-muted-foreground">
              <Sparkles className="h-3 w-3 mr-2 text-primary" />
              Interactive Compiler Design Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground/70 leading-[1.1]">
              Master Compiler Design
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Explore every phase of compilation interactively — from lexical
              analysis to intermediate code generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
              <Link href="/lexer" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-xl text-sm h-11 px-7 shadow-sm font-semibold hover:scale-[1.02] transition-transform"
                >
                  Start Building <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/learn" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 rounded-xl text-sm h-11 px-7 font-semibold"
                >
                  Explore Theory <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Graphic */}
          <div className="flex-1 hidden lg:flex justify-center items-center relative w-full h-full max-w-lg mt-6 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 blur-3xl rounded-full mix-blend-screen opacity-60"></div>
            <Image
              src="/hero.png"
              alt="Compiler Pipeline 3D Abstract"
              width={500}
              height={500}
              className="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl object-cover hover:scale-[1.02] transition-transform duration-500"
              priority
            />
          </div>
        </div>
      </div>

      {/* --- Stats --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Compiler Phases", value: "4", icon: Zap },
          { label: "Parsing Algorithms", value: "5", icon: Code2 },
          { label: "Shareable URLs", value: "∞", icon: Share2 },
          { label: "Keyboard Shortcuts", value: "?", icon: Keyboard },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 rounded-xl border bg-card/80 hover:bg-card transition-colors group"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors shrink-0">
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Compiler Phase Cards --- */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-1 w-1 rounded-full bg-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Compiler Phases
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {PHASE_CARDS.map((card) => {
            const c = COLOR_MAP[card.color];
            return (
              <Card
                key={card.href}
                className={`group relative overflow-hidden bg-card border ${c.border} hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col h-full`}
              >
                <div
                  className={`absolute top-0 right-0 w-28 h-28 ${c.bg} rounded-bl-full -mr-14 -mt-14 transition-transform duration-500 group-hover:scale-150 opacity-60`}
                />
                <CardHeader className="relative pb-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${c.bg} flex items-center justify-center mb-3 ${c.text}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 leading-relaxed">
                    {card.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative flex-grow pt-0">
                  <ul className="space-y-2">
                    {card.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-3 relative border-t border-border/40">
                  <Link href={card.href} className="w-full">
                    <Button
                      className={`w-full gap-2 rounded-xl transition-colors font-semibold text-[13px] ${c.hoverBg}`}
                      variant="outline"
                      size="sm"
                    >
                      {card.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* --- Practice Card --- */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="h-1 w-1 rounded-full bg-green-500" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Practice & Learn
          </h2>
        </div>
        <Card className="group relative overflow-hidden bg-card border hover:border-green-500/40 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150 opacity-60" />
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3 text-green-500">
                <Dna className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold mb-1.5">Practice & Learn</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Curated problem sets and interactive theory lessons to solidify
                your understanding of compiler construction.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Curated grammar problems",
                  "Multiple difficulty levels",
                  "Interactive theory lessons",
                  "Algorithm deep-dives",
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-[13px] text-muted-foreground"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500/60 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-stretch gap-3 p-6 md:pl-0 md:items-end md:justify-end">
              <Link href="/practice">
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 group-hover:border-green-500 group-hover:text-green-500 transition-colors font-semibold text-[13px]"
                  size="sm"
                >
                  Practice
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/learn">
                <Button
                  variant="outline"
                  className="rounded-xl gap-2 group-hover:border-green-500 group-hover:text-green-500 transition-colors font-semibold text-[13px]"
                  size="sm"
                >
                  Learn
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* --- Footer --- */}
      <div className="border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/70">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground/50">Comdes</span>
          <span className="opacity-40">•</span>
          <span>Built with Next.js, React, and Zustand</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">
              ?
            </kbd>{" "}
            for shortcuts
          </span>
          <span className="opacity-40">•</span>
          <span>LL(1) • SLR(1) • CLR(1) • LALR(1)</span>
        </div>
      </div>
    </div>
  );
}
