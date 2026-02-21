"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Dna,
  Save,
  Settings,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Solve Problem", href: "/solve", icon: Code2 },
  { name: "Practice Mode", href: "/practice", icon: Dna },
  { name: "Learning Mode", href: "/learn", icon: BookOpen },
  { name: "Cheatsheets", href: "/cheatsheets", icon: FileJson },
  { name: "Saved Work", href: "/saved", icon: Save },
  { name: "Settings", href: "/settings", icon: Settings },
];

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="w-full h-full md:w-64 border-r bg-muted/10 flex flex-col">
      <div className="p-6 border-b hidden md:block">
        <div className="flex items-center gap-2 px-2 shadow-sm pb-4 mb-4">
          <Image
            src="/logo.png"
            alt="Comdes Logo"
            width={32}
            height={32}
            className="rounded-md"
          />
          <h2 className="text-xl font-bold tracking-tight">Comdes</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">v1.0.0 Stable</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t flex flex-col gap-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <p className="text-xs font-medium mb-2">Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            Use &quot;Step-by-Step&quot; mode to understand how the parser
            constructs the tree.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent />
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
              <SidebarContent onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Comdes
          </h1>
        </div>
      </div>
    </>
  );
}
