import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Type, Copy, RotateCcw, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const TextFormatter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [keepFirstOccurrence, setKeepFirstOccurrence] = useState(true);
  const { toast } = useToast();

  const formatText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to format.",
        variant: "destructive",
      });
      return;
    }

    let lines = inputText.split('\n');
    
    // Remove empty lines if requested
    if (removeEmptyLines) {
      lines = lines.filter(line => line.trim() !== '');
    }

    // Trim whitespace if requested
    if (trimWhitespace) {
      lines = lines.map(line => line.trim());
    }

    // Remove duplicates if requested
    if (removeDuplicates) {
      if (caseSensitive) {
        lines = [...new Set(lines)];
      } else {
        const seen = new Set();
        lines = lines.filter(line => {
          const lowerLine = line.toLowerCase();
          if (seen.has(lowerLine)) {
            return false;
          }
          seen.add(lowerLine);
          return true;
        });
      }
    }

    // Join lines and normalize multiple spaces
    let formatted = lines.join('\n');
    
    // Replace multiple spaces with single space (but preserve line structure)
    formatted = formatted.replace(/ +/g, ' ');

    setOutputText(formatted);

    toast({
      title: "Formatted!",
      description: "Text has been formatted successfully.",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Formatted text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    toast({
      title: "Cleared",
      description: "All content has been cleared.",
    });
  };

  const getStats = () => {
    const inputLines = inputText ? inputText.split('\n').filter(line => removeEmptyLines ? line.trim() !== '' : true).length : 0;
    const outputLines = outputText ? outputText.split('\n').length : 0;
    
    return { inputLines, outputLines };
  };

  const stats = getStats();

  const loadSampleText = (type: string) => {
    const samples = {
      'mixed-case': `THIS is A Sample TEXT with Mixed CASE letters\nsome UPPERCASE and some lowercase\nPerfect for Testing CASE conversion`,
      'whitespace': `  This    text   has    extra    spaces   \n\n\n   Multiple   line   breaks   \n   And   inconsistent   formatting   `,
      'duplicates': `Apple\nBanana\nApple\nCherry\nbanana\nDuplicates everywhere\nApple\nCherry`,
      'messy': `  THIS is REALLY   messy   TEXT!!!   \n\n\n   With MIXED case,    extra spaces   \n   Duplicate lines below:\nHello World\nHello World\n   HELLO WORLD   \nAnd more formatting issues...   `,
      'structured': `Name: John Doe\nEmail: john@example.com\nPhone: (555) 123-4567\nAddress: 123 Main St\nCity: Anytown\nState: CA\nZip: 12345`,
      'list': `Item 1\nItem 2\nItem 3\n\nItem 4\nItem 1\nItem 5\n\nItem 6`,
      'paragraph': `This is a sample paragraph that demonstrates various formatting issues. It contains multiple spaces between words, inconsistent line breaks, and other formatting problems that need to be cleaned up for better readability and presentation.`
    };

    setInputText(samples[type as keyof typeof samples] || '');
    toast({
      title: "Sample Loaded!",
      description: `Loaded ${type.replace('-', ' ')} sample text for testing.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="max-w-7xl w-full">
        {/* Quick Presets Section */}
        <div className="mb-6">
          <Card className="bg-accent/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sample Text</CardTitle>
              <CardDescription>
                Load sample text to test formatting features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('mixed-case')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">Mixed Case</div>
                    <div className="text-xs text-muted-foreground">Test case conversion</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('whitespace')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">Extra Spaces</div>
                    <div className="text-xs text-muted-foreground">Test whitespace cleanup</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('duplicates')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">Duplicates</div>
                    <div className="text-xs text-muted-foreground">Test duplicate removal</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('messy')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">Messy Text</div>
                    <div className="text-xs text-muted-foreground">Multiple issues</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('structured')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">Structured</div>
                    <div className="text-xs text-muted-foreground">Contact info format</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('list')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">List Items</div>
                    <div className="text-xs text-muted-foreground">Clean list format</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('paragraph')}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">Paragraph</div>
                    <div className="text-xs text-muted-foreground">Text cleanup</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tool Section */}
        <div className="bg-card border border-border rounded-2xl shadow-glow w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Type className="w-8 h-8" />
            Text Formatter
          </h1>
          <p className="text-muted-foreground">
            Format and clean up your text
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>
                Enter the text you want to format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] resize-none"
              />
              
              <div className="mt-4 flex gap-2">
                <Button onClick={formatText} disabled={!inputText.trim()}>
                  <Type className="w-4 h-4 mr-2" />
                  Format Text
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caseSensitive"
                    checked={caseSensitive}
                    onCheckedChange={(checked) => setCaseSensitive(checked === true)}
                  />
                  <Label htmlFor="caseSensitive" className="text-sm">
                    Case sensitive
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trimWhitespace"
                    checked={trimWhitespace}
                    onCheckedChange={(checked) => setTrimWhitespace(checked === true)}
                  />
                  <Label htmlFor="trimWhitespace" className="text-sm">
                    Trim whitespace
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="removeEmptyLines"
                    checked={removeEmptyLines}
                    onCheckedChange={(checked) => setRemoveEmptyLines(checked === true)}
                  />
                  <Label htmlFor="removeEmptyLines" className="text-sm">
                    Remove empty lines
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="removeDuplicates"
                    checked={removeDuplicates}
                    onCheckedChange={(checked) => setRemoveDuplicates(checked === true)}
                  />
                  <Label htmlFor="removeDuplicates" className="text-sm">
                    Remove duplicates
                  </Label>
                </div>

                {removeDuplicates && (
                  <div className="flex items-center space-x-2 ml-6">
                    <Checkbox
                      id="keepFirstOccurrence"
                      checked={keepFirstOccurrence}
                      onCheckedChange={(checked) => setKeepFirstOccurrence(checked === true)}
                    />
                    <Label htmlFor="keepFirstOccurrence" className="text-sm">
                      Keep first occurrence
                    </Label>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Input lines: {stats.inputLines}</div>
                  <div>Output lines: {stats.outputLines}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Formatted Text
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!outputText}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </CardTitle>
              <CardDescription>
                Your formatted text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[300px] resize-none bg-muted"
                placeholder="Formatted text will appear here..."
              />
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TextFormatter;
