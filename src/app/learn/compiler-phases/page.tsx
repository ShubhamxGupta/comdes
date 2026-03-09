import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Play,
  Layers,
  Code2,
  Settings2,
  FileText,
  Blocks,
  Braces,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompilerPhasesPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      <div className="mb-6">
        <Link href="/learn">
          <Button variant="ghost" className="gap-2 -ml-4">
            <ArrowLeft className="w-4 h-4" /> Back to Learning Resources
          </Button>
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Introduction to Compilation
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Learn how source code is transformed into executable machine code
          through the sequential phases of a compiler. Understand the
          foundational role of Lexical Analysis.
        </p>

        {/* The Phases of a Compiler */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Layers className="h-8 w-8 text-blue-500" />
            Structure and Phases of a Compiler
          </h2>
          <p className="text-muted-foreground mb-8">
            A compiler translates a high-level source language into a low-level
            target language. This process is typically split into two main
            parts: the <strong>Analysis</strong> (Front-end) and the{" "}
            <strong>Synthesis</strong> (Back-end).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {/* Phase 1 */}
            <Card className="border-blue-500/20 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 text-xs font-bold">
                    1
                  </span>
                  Lexical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Reads characters and groups them into meaningful sequences
                  called <strong>Lexemes</strong>.
                </p>
                <p>
                  Outputs a stream of <strong>Tokens</strong> representing these
                  lexemes.
                </p>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="border-emerald-500/20 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">
                    2
                  </span>
                  Syntax Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Also known as Parsing. Uses the token stream to construct a{" "}
                  <strong>Parse Tree</strong> or Syntax Tree.
                </p>
                <p>Validates the grammatical structure.</p>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card className="border-purple-500/20 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-600 text-xs font-bold">
                    3
                  </span>
                  Semantic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Checks for semantic consistency (e.g., type checking, variable
                  declaration).
                </p>
                <p>
                  Uses the syntax tree and the <strong>Symbol Table</strong>.
                </p>
              </CardContent>
            </Card>

            {/* Phase 4 */}
            <Card className="border-orange-500/20 shadow-sm relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full pointer-events-none group-hover:bg-orange-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-orange-600 text-xs font-bold">
                    4
                  </span>
                  Intermediate Code Gen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Generates an explicit low-level or machine-independent
                  intermediate representation.
                </p>
                <p>
                  Often takes the form of{" "}
                  <strong>Three-Address Code (TAC)</strong>.
                </p>
              </CardContent>
            </Card>

            {/* Phase 5 */}
            <Card className="border-pink-500/20 shadow-sm relative overflow-hidden group hover:border-pink-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-bl-full pointer-events-none group-hover:bg-pink-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/20 text-pink-600 text-xs font-bold">
                    5
                  </span>
                  Code Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Improves the intermediate code to result in faster-running or
                  shorter machine code.
                </p>
                <p>
                  Includes loop unrolling, constant folding, and dead code
                  elimination.
                </p>
              </CardContent>
            </Card>

            {/* Phase 6 */}
            <Card className="border-red-500/20 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full pointer-events-none group-hover:bg-red-500/20 transition-colors" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-600 text-xs font-bold">
                    6
                  </span>
                  Code Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Maps the optimized intermediate representation to the target
                  machine language.
                </p>
                <p>
                  Involves <strong>Register Allocation</strong> and instruction
                  selection.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 flex bg-muted/30 p-4 rounded-xl text-sm border">
            <div className="font-semibold px-4 border-r mr-4 flex items-center shrink-0">
              Symbol Table Manager
            </div>
            <p className="text-muted-foreground">
              A data structure used by <em>all</em> phases to store identifiers
              (variable names, functions) along with their types, scope, and
              memory locations.
            </p>
          </div>
        </div>

        {/* Lexical Analysis Fundamentals */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Braces className="h-8 w-8 text-primary" />
            Tokens, Lexemes, and Attributes
          </h2>
          <Card className="mb-6 border-l-4 border-l-primary shadow-sm bg-primary/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Code2 className="h-5 w-5" /> Lexemes
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A sequence of characters in the source program that matches
                    the pattern for a token. It is the actual "string" found in
                    the code.
                    <br />
                    <br />
                    <em>Example:</em>{" "}
                    <code className="text-foreground">count</code>,{" "}
                    <code className="text-foreground">=</code>,{" "}
                    <code className="text-foreground">100</code>
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Blocks className="h-5 w-5" /> Tokens
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A pair consisting of a <strong>Token Name</strong> and an
                    optional Attribute Value. The token name is an abstract
                    symbol representing a lexical unit.
                    <br />
                    <br />
                    <em>Example:</em> <code>&#12296;id, ...&#12297;</code>,{" "}
                    <code>&#12296;assign, ...&#12297;</code>,{" "}
                    <code>&#12296;number, ...&#12297;</code>
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Attributes
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Additional information about the matched lexeme. For an
                    identifier, this might be a pointer to the Symbol Table
                    entry.
                    <br />
                    <br />
                    <em>Example:</em>{" "}
                    <code>&#12296;id, ptr-to-"count"&#12297;</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-background border rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Interactive Lexical Analyzer
              </h3>
              <p className="text-muted-foreground text-sm">
                Write some C-style code and watch as the Lexer breaks it down
                into individual tokens, identifies lexemes, and builds a symbol
                table in real-time.
              </p>
            </div>
            <Link href="/lexer" className="shrink-0">
              <Button
                size="lg"
                className="rounded-xl shadow-lg gap-2 h-14 px-8 text-base font-medium hover:scale-[1.02] transition-transform"
              >
                <Play className="w-5 h-5" /> Try the Lexer
              </Button>
            </Link>
          </div>
        </div>

        {/* Modern Tools: LLVM and Lex */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-indigo-500" />
            Modern Compilation: LLVM & Lex
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">
                Lex: A Lexical Analyzer Generator
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Writing a scanner by hand can be tedious. <strong>Lex</strong>{" "}
                (or Flex) is a tool that takes a set of regular expressions
                (patterns) and automatically generates C code for a
                deterministic finite automaton (DFA) that recognizes those
                patterns.
              </p>
              <p className="text-muted-foreground leading-relaxed flex items-start gap-2 bg-muted/20 p-3 rounded-lg border text-sm">
                <Braces className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  You specify the pattern (e.g. <code>[a-zA-Z]+</code>) and the
                  action (e.g. <code>return ID;</code>). Lex handles the state
                  machine transitions.
                </span>
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2">
                Introduction to LLVM
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                <strong>LLVM</strong> (Low Level Virtual Machine) is a modern,
                modular compiler infrastructure project. Unlike monolithic
                legacy compilers, LLVM strictly divides compilation using a
                universal Intermediate Representation (IR).
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-sm">
                <li>
                  <strong>Front-ends</strong> (like Clang for C/C++) compile
                  source code into LLVM IR.
                </li>
                <li>
                  <strong>Optimizers</strong> apply transformations directly to
                  the IR.
                </li>
                <li>
                  <strong>Back-ends</strong> compile the optimized IR into
                  target-specific machine code (x86, ARM, etc).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
