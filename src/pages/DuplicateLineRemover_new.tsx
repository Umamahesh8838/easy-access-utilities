import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Copy, RotateCcw, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const DuplicateLineRemover = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const [keepFirstOccurrence, setKeepFirstOccurrence] = useState(true);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Processed text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const removeDuplicates = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    let lines = inputText.split('\n');
    const originalCount = lines.length;
    const seen = new Set<string>();
    const result: string[] = [];

    if (!keepFirstOccurrence) {
      // For last occurrence, process in reverse
      lines = lines.reverse();
    }

    lines.forEach((line) => {
      let processedLine = line;
      
      if (trimWhitespace) {
        processedLine = processedLine.trim();
      }
      
      if (removeEmptyLines && processedLine === '') {
        return;
      }
      
      const comparisonKey = caseSensitive ? processedLine : processedLine.toLowerCase();
      
      if (!seen.has(comparisonKey)) {
        seen.add(comparisonKey);
        result.push(trimWhitespace ? processedLine : line);
      }
    });

    if (!keepFirstOccurrence) {
      result.reverse();
    }

    setOutputText(result.join('\n'));
    
    const duplicatesRemoved = originalCount - result.length;
    toast({
      title: "Duplicates removed!",
      description: `Removed ${duplicatesRemoved} duplicate lines.`,
    });
  };

  const getStats = () => {
    const inputLines = inputText ? inputText.split('\n').length : 0;
    const outputLines = outputText ? outputText.split('\n').length : 0;
    const duplicatesFound = inputLines - outputLines;
    
    return { inputLines, outputLines, duplicatesFound };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-5xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8" />
            Duplicate Line Remover
          </h1>
          <p className="text-muted-foreground">
            Remove duplicate lines from your text with advanced options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2">Enter your text:</label>
            <Textarea
              placeholder="Enter your text here, one line at a time..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[300px] resize-none font-mono text-sm"
            />
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" />
                Options
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caseSensitive"
                    checked={caseSensitive}
                    onCheckedChange={(checked) => setCaseSensitive(checked === true)}
                  />
                  <label htmlFor="caseSensitive" className="text-sm font-medium">
                    Case sensitive
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trimWhitespace"
                    checked={trimWhitespace}
                    onCheckedChange={(checked) => setTrimWhitespace(checked === true)}
                  />
                  <label htmlFor="trimWhitespace" className="text-sm font-medium">
                    Trim whitespace
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="removeEmptyLines"
                    checked={removeEmptyLines}
                    onCheckedChange={(checked) => setRemoveEmptyLines(checked === true)}
                  />
                  <label htmlFor="removeEmptyLines" className="text-sm font-medium">
                    Remove empty lines
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keepFirstOccurrence"
                    checked={keepFirstOccurrence}
                    onCheckedChange={(checked) => setKeepFirstOccurrence(checked === true)}
                  />
                  <label htmlFor="keepFirstOccurrence" className="text-sm font-medium">
                    Keep first occurrence
                  </label>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={removeDuplicates}
                  disabled={!inputText.trim()}
                  className="px-8"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Remove Duplicates
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Processed Text:</label>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Processed text will appear here..."
              className="min-h-[300px] resize-none bg-muted font-mono text-sm"
            />
            
            {outputText && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="px-8"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInputText("");
                      setOutputText("");
                      toast({
                        title: "Cleared",
                        description: "All text has been cleared.",
                      });
                    }}
                    className="px-6"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Input lines:</span> {stats.inputLines}</div>
                    <div><span className="font-medium">Output lines:</span> {stats.outputLines}</div>
                    <div className="text-primary"><span className="font-medium">Duplicates removed:</span> {stats.duplicatesFound}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateLineRemover;
