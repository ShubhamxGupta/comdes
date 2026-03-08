"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { problems, PracticeProblem } from "@/data/problems";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Easy" | "Medium" | "Hard"
  >("All");

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty =
        activeFilter === "All" || p.difficulty === activeFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, activeFilter]);

  const getDifficultyColor = (diff: PracticeProblem["difficulty"]) => {
    switch (diff) {
      case "Easy":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "Hard":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    }
  };

  const difficulties = ["All", "Easy", "Medium", "Hard"] as const;

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Practice Problems
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Test your skills with carefully curated grammars. Solve them using
            the Syntax Engine or the Semantic Translation Engine.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-muted/30 p-0.5 rounded-lg border">
          {difficulties.map((diff) => (
            <Button
              key={diff}
              variant={activeFilter === diff ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(diff)}
              className="h-8 text-xs font-medium"
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto pb-8">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <Card
              key={problem.id}
              className="flex flex-col hover:shadow-md transition-all border-l-4 border-l-primary/0 hover:border-l-primary"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {problem.difficulty === "Easy" &&
                          "A straightforward grammar to practice basic concepts."}
                        {problem.difficulty === "Medium" &&
                          "Introduces moderate complexities like left-recursion or basic ambiguities."}
                        {problem.difficulty === "Hard" &&
                          "A complex grammar requiring advanced parsing techniques like LALR(1)."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <CardDescription className="pt-2">
                  {problem.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="bg-muted rounded-md p-3 font-mono text-sm overflow-x-auto">
                  <pre>{problem.grammar}</pre>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm font-medium text-muted-foreground">
                  <span className="mr-1 mb-1">Concepts:</span>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {problem.recommendedSolver === "Semantic" ? (
                  <Link
                    href={`/semantic?g=${btoa(problem.grammar)}&t=${btoa(problem.testInput)}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    >
                      <Play className="h-4 w-4" /> Open in Semantic Engine
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href={`/solve?problemId=${problem.id}`}
                    className="w-full"
                  >
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
                      <Play className="h-4 w-4" /> Open in Syntax Engine
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mb-4 opacity-20" />
            <p className="font-medium">No problems match your search.</p>
            <p className="text-sm mt-1">
              Try a different search term or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
