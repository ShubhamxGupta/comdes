import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Play } from "lucide-react";
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
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function PracticePage() {
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

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Practice Problems</h1>
          <p className="text-muted-foreground">
            Test your skills with various grammar architectures.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search problems..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto pb-8">
        {problems.map((problem) => (
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
                  <TooltipProvider>
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
                  </TooltipProvider>
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
            <CardFooter>
              <Link href={`/solve?problemId=${problem.id}`} className="w-full">
                <Button className="w-full gap-2">
                  <Play className="h-4 w-4" /> Solve Problem
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
