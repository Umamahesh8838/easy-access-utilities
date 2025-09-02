import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Hash, Copy, RotateCcw } from "lucide-react";

const LetterCounter = () => {
  const [text, setText] = useState("");
  const [letterCounts, setLetterCounts] = useState<{[key: string]: number}>({});
  const [totalLetters, setTotalLetters] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    calculateLetterCounts(text);
  }, [text]);

  const calculateLetterCounts = (inputText: string) => {
    const counts: {[key: string]: number} = {};
    let total = 0;

    for (const char of inputText) {
      if (/[a-zA-Z]/.test(char)) {
        const letter = char.toLowerCase();
        counts[letter] = (counts[letter] || 0) + 1;
        total++;
      }
    }

    setLetterCounts(counts);
    setTotalLetters(total);
  };

  const copyToClipboard = async () => {
    const sortedEntries = Object.entries(letterCounts).sort(([,a], [,b]) => b - a);
    const countsText = sortedEntries
      .map(([letter, count]) => `${letter.toUpperCase()}: ${count}`)
      .join('\n');
    
    const fullText = `Letter Count Analysis\n${'='.repeat(20)}\nTotal Letters: ${totalLetters}\n\n${countsText}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      toast({
        title: "Copied!",
        description: "Letter counts copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getSortedEntries = () => {
    return Object.entries(letterCounts).sort(([,a], [,b]) => b - a);
  };

  const getPercentage = (count: number) => {
    return totalLetters > 0 ? ((count / totalLetters) * 100).toFixed(1) : "0";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-5xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Hash className="w-8 h-8" />
            Letter Counter
          </h1>
          <p className="text-muted-foreground">
            Count and analyze letter frequency in your text
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Enter your text:</label>
            <Textarea
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[400px] resize-none"
            />
            
            <div className="mt-6 text-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setText("");
                  toast({
                    title: "Cleared",
                    description: "Text has been cleared.",
                  });
                }}
                className="px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              
              {totalLetters > 0 && (
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="px-6"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Results
                </Button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-center">Letter Analysis</h3>
              <div className="text-center text-2xl font-bold text-primary mt-2">
                Total Letters: {totalLetters}
              </div>
            </div>

            {totalLetters > 0 ? (
              <div className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto border rounded-lg p-4 bg-muted/50">
                  <div className="grid grid-cols-1 gap-2">
                    {getSortedEntries().map(([letter, count]) => (
                      <div key={letter} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-bold w-8 text-center bg-primary/10 rounded px-2 py-1">
                            {letter.toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getPercentage(count)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${getPercentage(count)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="text-lg font-bold text-primary">
                      {Object.keys(letterCounts).length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Unique Letters
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="text-lg font-bold text-primary">
                      {getSortedEntries()[0]?.[0]?.toUpperCase() || '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Most Frequent
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="text-lg font-bold text-primary">
                      {getSortedEntries()[0]?.[1] || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Max Count
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-20">
                <Hash className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Enter some text to see letter frequency analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterCounter;
