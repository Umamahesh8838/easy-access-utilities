import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Target, TestTube, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Match {
  text: string;
  start: number;
  end: number;
  groups?: string[];
}


const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const testRegex = () => {
    try {
      if (!pattern) {
        setMatches([]);
        return;
      }

      const regex = new RegExp(pattern, flags);
      const foundMatches: Match[] = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            text: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1)
          });
          
          // Prevent infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            text: match[0],
            start: match.index,
            end: match.index + match[0].length,
            groups: match.slice(1)
          });
        }
      }

      setMatches(foundMatches);
      setIsValid(true);
      setErrorMessage("");
      
      toast({
        title: "Regex Tested",
        description: `Found ${foundMatches.length} match${foundMatches.length !== 1 ? 'es' : ''}`,
      });
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : "Invalid regex pattern");
      setMatches([]);
      toast({
        title: "Invalid Regex",
        description: "Please check your regex pattern",
        variant: "destructive",
      });
    }
  };

  const highlightMatches = (text: string, matches: Match[]): JSX.Element[] => {
    if (!matches.length) return [<span key="0">{text}</span>];

    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before match
      if (match.start > lastIndex) {
        elements.push(
          <span key={`before-${index}`}>
            {text.slice(lastIndex, match.start)}
          </span>
        );
      }

      // Add highlighted match
      elements.push(
        <span 
          key={`match-${index}`}
          className="bg-yellow-400 text-black font-semibold rounded px-1"
        >
          {match.text}
        </span>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="after">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const commonPatterns = [
    { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", description: "Matches email addresses" },
    { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", description: "Matches HTTP/HTTPS URLs" },
    { name: "Phone", pattern: "\\+?[1-9]\\d{1,14}", description: "Matches international phone numbers" },
    { name: "IP Address", pattern: "\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b", description: "Matches IPv4 addresses" },
    { name: "Hex Color", pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})", description: "Matches hex color codes" },
    { name: "Credit Card", pattern: "\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b", description: "Matches credit card numbers" },
    { name: "Username", pattern: "^[a-zA-Z0-9_]{3,16}$", description: "Matches usernames (3-16 chars, alphanumeric + underscore)" },
    { name: "HTML Tag", pattern: "<[^>]+>", description: "Matches HTML tags" },
  ];

  const flagOptions = [
    { key: 'g', name: 'Global', description: 'Find all matches' },
    { key: 'i', name: 'Case Insensitive', description: 'Ignore case' },
    { key: 'm', name: 'Multiline', description: '^$ match line boundaries' },
    { key: 's', name: 'Dotall', description: '. matches newlines' },
    { key: 'u', name: 'Unicode', description: 'Enable Unicode mode' },
    { key: 'y', name: 'Sticky', description: 'Match from lastIndex' },
  ];

  const toggleFlag = (flag: string) => {
    setFlags(prev => 
      prev.includes(flag) 
        ? prev.replace(flag, '') 
        : prev + flag
    );
  };


  return (
    <div className="pt-40 min-h-screen bg-background px-4 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Editor & Results */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Regex Tester
              </CardTitle>
              <CardDescription>
                Test and debug regular expressions with live matching and detailed match info.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="pattern">Pattern</Label>
                  <div className="flex gap-2">
                    <span className="self-center text-muted-foreground">/</span>
                    <Input
                      id="pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Enter regex pattern..."
                      className={`font-mono flex-1 ${!isValid ? 'border-red-500' : ''}`}
                    />
                    <span className="self-center text-muted-foreground">/{flags}</span>
                  </div>
                  {!isValid && (
                    <p className="text-destructive text-sm mt-1">{errorMessage}</p>
                  )}
                  <div>
                    <Label>Flags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {flagOptions.map((flag) => (
                        <Badge
                          key={flag.key}
                          variant={flags.includes(flag.key) ? "default" : "outline"}
                          className={`cursor-pointer ${flags.includes(flag.key) ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => toggleFlag(flag.key)}
                        >
                          {flag.key} - {flag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="test-string">Test String</Label>
                  <Textarea
                    id="test-string"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter text to test against..."
                    className="min-h-[140px] font-mono"
                  />
                  <Button onClick={testRegex} className="w-full">
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Regex
                  </Button>
                </div>
              </div>
              <div>
                <Label>Results</Label>
                <div className="bg-muted border rounded-lg p-4 min-h-[100px] mt-2">
                  <div className="font-mono whitespace-pre-wrap">
                    {testString ? highlightMatches(testString, matches) : (
                      <span className="text-muted-foreground">Test string will be highlighted here...</span>
                    )}
                  </div>
                </div>
                {matches.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Match Details</Label>
                    <div className="max-h-[180px] overflow-auto space-y-2">
                      {matches.map((match, index) => (
                        <div key={index} className="bg-background p-3 rounded border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-muted-foreground">Match {index + 1}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(match.text)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-muted-foreground">Text:</span> <span className="font-mono">{match.text}</span></div>
                            <div><span className="text-muted-foreground">Position:</span> <span>{match.start}-{match.end}</span></div>
                            {match.groups && match.groups.length > 0 && (
                              <div><span className="text-muted-foreground">Groups:</span> <span className="font-mono">{match.groups.join(', ')}</span></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right: Info & Reference */}
        <div className="space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                About & Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p>
                  <b>Regex Tester</b> helps you write, debug, and visualize regular expressions. Enter a pattern and test string to see live matches, match details, and use common patterns or quick reference for help.
                </p>
              </div>
              <div>
                <b>Legend:</b>
                <ul className="list-disc ml-5 mt-1">
                  <li><span className="bg-yellow-300 text-black px-1 rounded">highlight</span> = matched text</li>
                  <li><b>Flags</b>: g = global, i = case-insensitive, m = multiline, s = dotall, u = unicode, y = sticky</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          <Tabs defaultValue="common" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="common">Common Patterns</TabsTrigger>
              <TabsTrigger value="reference">Quick Reference</TabsTrigger>
            </TabsList>
            <TabsContent value="common">
              <Card className="bg-muted border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Common Patterns
                  </CardTitle>
                  <CardDescription>
                    Click to use these common regex patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commonPatterns.map((item, index) => (
                      <div
                        key={index}
                        className="bg-background p-4 rounded border cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setPattern(item.pattern)}
                      >
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-muted-foreground text-xs mb-2">{item.description}</p>
                        <code className="text-xs text-primary bg-muted px-2 py-1 rounded">{item.pattern}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reference">
              <Card className="bg-muted border">
                <CardHeader>
                  <CardTitle>Quick Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <h3 className="font-semibold mb-3">Character Classes</h3>
                      <div className="space-y-2">
                        <div><code className="text-primary">.</code> - Any character</div>
                        <div><code className="text-primary">\d</code> - Digit (0-9)</div>
                        <div><code className="text-primary">\w</code> - Word character</div>
                        <div><code className="text-primary">\s</code> - Whitespace</div>
                        <div><code className="text-primary">[abc]</code> - Character set</div>
                        <div><code className="text-primary">[^abc]</code> - Negated set</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Quantifiers</h3>
                      <div className="space-y-2">
                        <div><code className="text-primary">*</code> - 0 or more</div>
                        <div><code className="text-primary">+</code> - 1 or more</div>
                        <div><code className="text-primary">?</code> - 0 or 1</div>
                        <div><code className="text-primary">{`{n}`}</code> - Exactly n</div>
                        <div><code className="text-primary">{`{n,m}`}</code> - Between n and m</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Anchors</h3>
                      <div className="space-y-2">
                        <div><code className="text-primary">^</code> - Start of string</div>
                        <div><code className="text-primary">$</code> - End of string</div>
                        <div><code className="text-primary">\b</code> - Word boundary</div>
                        <div><code className="text-primary">\B</code> - Non-word boundary</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
