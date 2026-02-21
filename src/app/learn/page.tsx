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
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 h-full overflow-y-auto">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 via-background to-background border rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5 dark:opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <Badge variant="secondary" className="mb-4">
            Curriculum 1.0
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Master Compiler Design
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            A visual, interactive approach to learning syntax analysis. Start
            from the basic definitions and scale up to production-grade
            algorithms.
          </p>
          <Link href="/learn/grammar">
            <Button size="lg" className="rounded-full shadow-lg gap-2">
              <PlayCircle className="w-5 h-5" /> Start Learning
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
                  className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                >
                  <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary group-hover:-translate-y-1 bg-gradient-to-br from-background to-muted/20">
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
