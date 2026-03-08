"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Dna,
  Settings,
  Braces,
  FileCode2,
  ScanLine,
  Menu,
  Keyboard,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Home",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Compiler Phases",
    items: [
      { name: "Lexical Analyzer", href: "/lexer", icon: ScanLine },
      { name: "Syntax Solver", href: "/solve", icon: Code2 },
      { name: "Semantic Solver", href: "/semantic", icon: Braces },
      { name: "ICG Solver", href: "/icg", icon: FileCode2 },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Practice Mode", href: "/practice", icon: Dna },
      { name: "Learning Mode", href: "/learn", icon: BookOpen },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function SidebarContent({
  onClose,
  onOpenShortcuts,
}: {
  onClose?: () => void;
  onOpenShortcuts?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full h-full md:w-64 border-r bg-muted/20 flex flex-col shadow-sm">
      <div className="p-6 border-b flex flex-col justify-center bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg overflow-hidden shadow-sm border bg-background flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Comdes Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent">
              Comdes
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              v1.0.0 Stable
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto w-full">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="block w-full"
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-10 px-3 transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary font-medium hover:bg-primary/20 shadow-sm ring-1 ring-primary/20"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3.5 border-t bg-background/60 backdrop-blur-sm flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground/50 font-medium">
          © 2026 Comdes
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground/60 hover:text-foreground"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span className="sr-only">Keyboard shortcuts</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Listen for global keyboard shortcuts event
  useEffect(() => {
    const handler = () => setShortcutsOpen(true);
    window.addEventListener("open-shortcuts", handler);
    return () => window.removeEventListener("open-shortcuts", handler);
  }, []);

  // Listen for ? key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;
      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent onOpenShortcuts={() => setShortcutsOpen(true)} />
      </div>

      {/* Mobile Top Header containing the trigger */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 border-r w-64 bg-background z-[100]"
            >
              <div className="p-6 border-b">
                <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Comdes
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  v1.0.0 Stable
                </SheetDescription>
              </div>
              <SidebarContent
                onClose={() => setOpen(false)}
                onOpenShortcuts={() => setShortcutsOpen(true)}
              />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Comdes
          </h1>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      {shortcutsOpen && (
        <KeyboardShortcutsDialog onClose={() => setShortcutsOpen(false)} />
      )}
    </>
  );
}

function KeyboardShortcutsDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const shortcuts = [
    { keys: ["Ctrl", "Enter"], description: "Solve / Evaluate grammar" },
    { keys: ["?"], description: "Open this shortcuts panel" },
    { keys: ["Esc"], description: "Close dialogs & panels" },
  ];

  const quickRef = [
    {
      title: "FIRST Set",
      rules: [
        "FIRST(terminal) = {terminal}",
        "If X → ε exists, add ε to FIRST(X)",
        "If X → Y₁Y₂...Yₖ, add non-ε of FIRST(Y₁); if ε ∈ FIRST(Y₁), check Y₂, etc.",
      ],
    },
    {
      title: "FOLLOW Set",
      rules: [
        "Add $ to FOLLOW(start symbol)",
        "If A → αBβ, add FIRST(β)\\{ε} to FOLLOW(B)",
        "If A → αB or ε ∈ FIRST(β), add FOLLOW(A) to FOLLOW(B)",
      ],
    },
    {
      title: "LR Parsers",
      rules: [
        "SLR(1): LR(0) items + FOLLOW for reductions",
        "CLR(1): LR(1) items with exact lookaheads",
        "LALR(1): Merged CLR(1) states by core",
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Quick Reference
                </h2>
                <p className="text-xs text-muted-foreground">
                  Shortcuts & formulas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono bg-muted/50 px-2 py-1 rounded-md border"
            >
              ESC
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {shortcuts.map((sc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-sm text-foreground/80">
                    {sc.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((key, j) => (
                      <span key={j}>
                        <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold bg-muted border border-border/60 rounded-md shadow-sm text-foreground/70">
                          {key}
                        </kbd>
                        {j < sc.keys.length - 1 && (
                          <span className="mx-0.5 text-muted-foreground/40 text-xs">
                            +
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t" />

          {/* Quick Reference */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Parsing Rules Quick Reference
            </h3>
            <div className="space-y-4">
              {quickRef.map((section, i) => (
                <div key={i}>
                  <h4 className="text-sm font-semibold text-primary mb-1.5">
                    {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.rules.map((rule, j) => (
                      <li
                        key={j}
                        className="text-xs text-muted-foreground leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50"
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/20 flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">
              ?
            </kbd>{" "}
            anytime to open
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            Comdes v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
