import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Shuffle, Copy, RotateCcw, ArrowUpDown, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const ListRandomizer = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [numberOfItems, setNumberOfItems] = useState("");
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [addNumbers, setAddNumbers] = useState(false);
  const [preserveFormatting, setPreserveFormatting] = useState(false);
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const randomizeList = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list to randomize.",
        variant: "destructive",
      });
      return;
    }

    let lines = inputText.split('\n');
    
    // Remove empty lines if requested
    if (removeEmptyLines) {
      lines = lines.filter(line => line.trim() !== '');
    }

    // Remove duplicates if requested
    if (removeDuplicates) {
      lines = [...new Set(lines.map(line => line.trim()))];
    }

    // Trim lines unless preserving formatting
    if (!preserveFormatting) {
      lines = lines.map(line => line.trim());
    }

    if (lines.length === 0) {
      toast({
        title: "Error",
        description: "No valid items found to randomize.",
        variant: "destructive",
      });
      return;
    }

    // Shuffle the array
    let shuffledLines = shuffleArray(lines);

    // Limit number of items if specified
    const numItems = parseInt(numberOfItems);
    if (numberOfItems && numItems > 0 && numItems < shuffledLines.length) {
      shuffledLines = shuffledLines.slice(0, numItems);
    }

    // Add numbers if requested
    if (addNumbers) {
      shuffledLines = shuffledLines.map((line, index) => `${index + 1}. ${line}`);
    }

    setOutputText(shuffledLines.join('\n'));

    toast({
      title: "Randomized!",
      description: `Successfully randomized ${shuffledLines.length} items.`,
    });

    // Scroll to output section after a brief delay
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const sortList = (order: 'asc' | 'desc') => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list to sort.",
        variant: "destructive",
      });
      return;
    }

    let lines = inputText.split('\n');
    
    if (removeEmptyLines) {
      lines = lines.filter(line => line.trim() !== '');
    }

    if (removeDuplicates) {
      lines = [...new Set(lines.map(line => line.trim()))];
    }

    if (!preserveFormatting) {
      lines = lines.map(line => line.trim());
    }

    if (lines.length === 0) {
      toast({
        title: "Error",
        description: "No valid items found to sort.",
        variant: "destructive",
      });
      return;
    }

    // Sort the array
    lines.sort((a, b) => {
      if (order === 'asc') {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
      }
    });

    // Limit number of items if specified
    const numItems = parseInt(numberOfItems);
    if (numberOfItems && numItems > 0 && numItems < lines.length) {
      lines = lines.slice(0, numItems);
    }

    // Add numbers if requested
    if (addNumbers) {
      lines = lines.map((line, index) => `${index + 1}. ${line}`);
    }

    setOutputText(lines.join('\n'));

    toast({
      title: "Sorted!",
      description: `Successfully sorted ${lines.length} items in ${order}ending order.`,
    });

    // Scroll to output section after a brief delay
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const copyToClipboard = async () => {
    if (!outputText) {
      toast({
        title: "Error",
        description: "No content to copy.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First try the modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(outputText);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = outputText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      toast({
        title: "Copied!",
        description: "List copied to clipboard successfully.",
      });
    } catch (err) {
      console.error('Copy failed:', err);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try selecting and copying manually.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setNumberOfItems("");
    toast({
      title: "Cleared",
      description: "All content has been cleared.",
    });
  };

  const getStats = () => {
    const inputLines = inputText ? inputText.split('\n').filter(line => removeEmptyLines ? line.trim() !== '' : true).length : 0;
    const outputLines = outputText ? outputText.split('\n').length : 0;
    const duplicatesFound = inputText ? inputText.split('\n').length - [...new Set(inputText.split('\n').map(line => line.trim()))].length : 0;
    
    return { inputLines, outputLines, duplicatesFound };
  };

  const stats = getStats();

  const sampleLists = [
    {
      title: "Colors",
      description: "Basic color names",
      items: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Brown", "Black", "White"]
    },
    {
      title: "Countries",
      description: "Popular country names",
      items: ["United States", "Canada", "Mexico", "Brazil", "United Kingdom", "France", "Germany", "Japan", "Australia", "India"]
    },
    {
      title: "Animals",
      description: "Common animal names",
      items: ["Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Monkey", "Bear", "Wolf", "Fox", "Rabbit"]
    },
    {
      title: "Programming Languages",
      description: "Popular coding languages",
      items: ["JavaScript", "Python", "Java", "C++", "TypeScript", "Go", "Rust", "PHP", "Ruby", "Swift"]
    },
    {
      title: "Test List",
      description: "With duplicates & empty lines",
      items: ["Item 1", "Item 2", "Item 3", "Item 1", "Item 4", "", "Item 5"]
    }
  ];

  const loadSampleList = (sampleIndex: number) => {
    const sample = sampleLists[sampleIndex];
    setInputText(sample.items.join('\n'));
    toast({
      title: "Sample Loaded!",
      description: `Loaded ${sample.title} sample list.`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Shuffle className="w-8 h-8" />
            List Randomizer
          </h1>
          <p className="text-muted-foreground">
            Randomize, sort, and organize lists with various options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sample Lists Section - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl shadow-glow p-6 sticky top-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">Sample Lists</h2>
                <p className="text-sm text-muted-foreground">
                  Try these example lists
                </p>
              </div>
              <div className="space-y-3">
                {sampleLists.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleList(index)}
                    className="w-full text-xs h-auto py-3 px-4"
                  >
                    <div className="text-center">
                      <div className="font-medium">{sample.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {sample.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Tool Section */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl shadow-glow p-8">

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-2">Enter your list:</label>
                  <Textarea
                    placeholder="Enter list items here, one per line..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[300px] resize-none font-mono text-sm"
                  />
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button onClick={randomizeList} disabled={!inputText.trim()}>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Randomize
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => sortList('asc')}
                      disabled={!inputText.trim()}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort A-Z
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => sortList('desc')}
                      disabled={!inputText.trim()}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Sort Z-A
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Options & Stats Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="numItems">Limit to (optional)</Label>
                      <Input
                        id="numItems"
                        type="number"
                        placeholder="e.g., 5"
                        value={numberOfItems}
                        onChange={(e) => setNumberOfItems(e.target.value)}
                        min="1"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to include all items
                      </p>
                    </div>

                    <div className="space-y-3">
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
                          id="removeDuplicates"
                          checked={removeDuplicates}
                          onCheckedChange={(checked) => setRemoveDuplicates(checked === true)}
                        />
                        <label htmlFor="removeDuplicates" className="text-sm font-medium">
                          Remove duplicates
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="addNumbers"
                          checked={addNumbers}
                          onCheckedChange={(checked) => setAddNumbers(checked === true)}
                        />
                        <label htmlFor="addNumbers" className="text-sm font-medium">
                          Add numbers (1, 2, 3...)
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="preserveFormatting"
                          checked={preserveFormatting}
                          onCheckedChange={(checked) => setPreserveFormatting(checked === true)}
                        />
                        <label htmlFor="preserveFormatting" className="text-sm font-medium">
                          Preserve line spacing
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Input items:</span>
                          <span className="font-mono">{stats.inputLines}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Output items:</span>
                          <span className="font-mono">{stats.outputLines}</span>
                        </div>
                        {stats.duplicatesFound > 0 && (
                          <div className="flex justify-between p-2 bg-muted rounded">
                            <span>Duplicates found:</span>
                            <span className="font-mono text-orange-600">{stats.duplicatesFound}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {outputText && (
                <div className="mt-8" ref={outputRef}>
                  <label className="block text-sm font-medium mb-2">Processed List:</label>
                  <Textarea
                    value={outputText}
                    readOnly
                    placeholder="Processed list will appear here..."
                    className="min-h-[200px] resize-none bg-muted font-mono text-sm"
                  />
                  
                  <div className="mt-4 text-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="px-8"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Result
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={clearAll}
                      className="px-6"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListRandomizer;
