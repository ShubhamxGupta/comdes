"use client";

import { Save, Trash2, ExternalLink } from "lucide-react";
import { useSavedGrammars } from "@/hooks/useSavedGrammars";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useGrammarStore } from "@/store/useGrammarStore";
import { useRouter } from "next/navigation";

export default function SavedPage() {
  const { savedGrammars, deleteGrammar } = useSavedGrammars();
  const router = useRouter();
  const { setRawInput, setTestInput, parse } = useGrammarStore();

  const handleLoad = (grammarStr: string, testStr: string) => {
    setRawInput(grammarStr);
    setTestInput(testStr);
    setTimeout(() => {
      parse();
    }, 50);
    router.push("/solve");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-2">Saved Work</h1>
      <p className="text-muted-foreground mb-8">
        Access your previously saved language definitions.
      </p>

      {savedGrammars.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border rounded-lg border-dashed bg-muted/50">
          <div className="flex flex-col items-center text-center p-8">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Save className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No saved problems</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              When you solve a grammar problem, you can save it here for future
              reference.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto pb-8">
          {savedGrammars.map((saved) => (
            <Card key={saved.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{saved.name}</CardTitle>
                <CardDescription>
                  Saved on {new Date(saved.savedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="bg-muted rounded-md p-3 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  {saved.grammar}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteGrammar(saved.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleLoad(saved.grammar, saved.testInput)}
                  className="gap-2"
                >
                  Load <ExternalLink className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
