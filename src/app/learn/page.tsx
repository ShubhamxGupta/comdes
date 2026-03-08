import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Code2,
  GitBranch,
  PlayCircle,
  GraduationCap,
  Network,
  SplitSquareHorizontal,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const curriculum = [
  {
    category: "Fundamentals",
    description:
      "Start here to understand the core building blocks of compiler terminology.",
    items: [
      {
        title: "Grammar Basics",
        description:
          "Learn about Context-Free Grammars, Terminals, and Non-Terminals.",
        icon: BookOpen,
        href: "/learn/grammar",
        difficulty: "Beginner",
        time: "5 min read",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        title: "Direct Method",
        description:
          "Understand how to generate Parse Trees directly from grammar rules.",
        icon: Network,
        href: "/learn/direct-method",
        difficulty: "Beginner",
        time: "8 min read",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      },
    ],
  },
  {
    category: "Parsing Algorithms",
    description:
      "Deep dive into exactly how the Comdes Engine evaluates syntax trees.",
    items: [
      {
        title: "LL(1) Parsing",
        description:
          "Explore Top-Down predictive parsing using FIRST and FOLLOW sets.",
        icon: Code2,
        href: "/learn/ll1",
        difficulty: "Intermediate",
        time: "10 min read",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        title: "LR Parsing",
        description:
          "Master Bottom-Up parsing tiers: LR(0), SLR(1), CLR(1), and LALR(1).",
        icon: GitBranch,
        href: "/learn/lr",
        difficulty: "Advanced",
        time: "15 min read",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
      {
        title: "Shift-Reduce Parsing",
        description:
          "Learn the fundamental bottom-up actions: Shift, Reduce, Accept, Error.",
        icon: SplitSquareHorizontal,
        href: "/learn/shift-reduce",
        difficulty: "Intermediate",
        time: "12 min read",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
      },
      {
        title: "Operator Precedence",
        description:
          "Construct parsers specifically for evaluating mathematical expressions without state machines.",
        icon: Calculator,
        href: "/learn/operator-precedence",
        difficulty: "Intermediate",
        time: "10 min read",
        color: "text-teal-500",
        bg: "bg-teal-500/10",
      },
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-background border rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-bl-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-tr-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 opacity-[0.03] dark:opacity-5 pointer-events-none">
          <GraduationCap className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-sm border px-4 py-1.5 text-sm font-semibold shadow-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Curriculum 2.0
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground leading-tight">
            Master Compiler Design
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A visual, interactive approach to learning syntax analysis. Start
            from the basic definitions and scale up to production-grade
            algorithms.
          </p>
          <Link href="/learn/grammar">
            <Button
              size="lg"
              className="rounded-xl shadow-lg gap-2 h-14 px-8 text-base font-medium hover:scale-[1.02] transition-transform"
            >
              <PlayCircle className="w-5 h-5" /> Start Learning Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Curriculum Mapping */}
      <div className="space-y-12">
        {curriculum.map((section, idx) => (
          <div key={idx} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {section.category}
              </h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((topic) => (
                <Link
                  key={topic.title}
                  href={topic.href}
                  className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl outline-none"
                >
                  <Card className="h-full flex flex-col hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-border/50 hover:border-primary/30 group-hover:-translate-y-1.5 bg-card overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-xl ${topic.bg} ${topic.color}`}
                        >
                          <topic.icon className="h-6 w-6" />
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {topic.time}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {topic.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-4">
                      <Badge
                        variant="secondary"
                        className={
                          topic.difficulty === "Beginner"
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : topic.difficulty === "Intermediate"
                              ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                              : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        }
                      >
                        {topic.difficulty}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
