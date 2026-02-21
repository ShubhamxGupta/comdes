import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, BookOpen, Code2, Dna } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-muted/30 p-8 md:p-12 mb-8 border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 pointer-events-none" />
        <div className="relative flex flex-col gap-4 max-w-2xl">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            v1.0.0 Stable Release
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            Master Compiler Design
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Explore parsing algorithms interactively. Build context-free
            grammars, compute FIRST & FOLLOW sets, and simulate LL(1) and LR
            parsing trees step-by-step.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-500" />
              Solver
            </CardTitle>
            <CardDescription>Solve grammars step-by-step</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/solve">
              <Button className="w-full gap-2">
                Start Solving <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-green-500" />
              Practice
            </CardTitle>
            <CardDescription>Test your knowledge with problems</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/practice">
              <Button variant="outline" className="w-full gap-2">
                Go to Practice <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Learn
            </CardTitle>
            <CardDescription>Read theory and examples</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/learn">
              <Button variant="outline" className="w-full gap-2">
                Open Material <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
