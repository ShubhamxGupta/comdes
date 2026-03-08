import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://comdes.vercel.app"),
  title: "Comdes | Interactive Compiler Learning",
  description:
    "Interactive Compiler Design Learning Platform. Build context-free grammars, compute FIRST & FOLLOW sets, and simulate LL(1) and LR parsing trees step-by-step.",
  keywords: [
    "Compiler Design",
    "Parsing",
    "LL(1)",
    "LR(0)",
    "SLR(1)",
    "CLR(1)",
    "LALR(1)",
    "Context Free Grammar",
    "Automata",
    "Parser Engine",
    "Computer Science",
    "Syntax Analysis",
  ],
  authors: [{ name: "Student Sandbox" }],
  creator: "Comdes Team",
  publisher: "Comdes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Comdes | Interactive Compiler Learning",
    description:
      "Interactive Compiler Design Learning Platform. Explore parsing algorithms interactively.",
    type: "website",
    siteName: "Comdes",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comdes",
    description:
      "Interactive Compiler Design Learning Platform. Build and simulate grammars.",
  },
  robots: "index, follow",
  verification: {
    google: "kZLsm8vZ527s-_V4Tcjwn85lMqHQH7HgS8vLbfg0vmE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster richColors closeButton position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
