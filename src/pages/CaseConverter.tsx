import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Type, Copy, RotateCcw } from "lucide-react";

const CaseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const { toast } = useToast();

  const caseOptions = [
    { 
      id: "uppercase", 
      label: "UPPERCASE", 
      description: "Converts all text to uppercase",
      example: "HELLO WORLD"
    },
    { 
      id: "lowercase", 
      label: "lowercase", 
      description: "Converts all text to lowercase",
      example: "hello world"
    },
    { 
      id: "titlecase", 
      label: "Title Case", 
      description: "Capitalizes first letter of each word",
      example: "Hello World"
    },
    { 
      id: "sentencecase", 
      label: "Sentence case", 
      description: "Capitalizes first letter of each sentence",
      example: "Hello world. This is a sentence."
    },
    { 
      id: "camelcase", 
      label: "camelCase", 
      description: "Removes spaces and capitalizes first letter of each word except first",
      example: "helloWorld"
    },
    { 
      id: "pascalcase", 
      label: "PascalCase", 
      description: "Removes spaces and capitalizes first letter of each word",
      example: "HelloWorld"
    },
    { 
      id: "snakecase", 
      label: "snake_case", 
      description: "Replaces spaces with underscores and converts to lowercase",
      example: "hello_world"
    },
    { 
      id: "kebabcase", 
      label: "kebab-case", 
      description: "Replaces spaces with hyphens and converts to lowercase",
      example: "hello-world"
    },
    { 
      id: "constantcase", 
      label: "CONSTANT_CASE", 
      description: "Replaces spaces with underscores and converts to uppercase",
      example: "HELLO_WORLD"
    },
    { 
      id: "alternating", 
      label: "aLtErNaTiNg CaSe", 
      description: "Alternates between lowercase and uppercase characters",
      example: "hElLo WoRlD"
    }
  ];

  const convertText = (text: string, caseType: string): string => {
    if (!text) return "";

    switch (caseType) {
      case "uppercase":
        return text.toUpperCase();
      
      case "lowercase":
        return text.toLowerCase();
      
      case "titlecase":
        return text.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      
      case "sentencecase":
        return text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (match) =>
          match.toUpperCase()
        );
      
      case "camelcase":
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, "")
          .replace(/[^a-zA-Z0-9]/g, "");
      
      case "pascalcase":
        return text
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, "")
          .replace(/[^a-zA-Z0-9]/g, "");
      
      case "snakecase":
        return text
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");
      
      case "kebabcase":
        return text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-]/g, "");
      
      case "constantcase":
        return text
          .toUpperCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "");
      
      case "alternating":
        return text
          .split("")
          .map((char, index) =>
            char === " " ? char : (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
          )
          .join("");
      
      default:
        return text;
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast({
        title: "No text to convert",
        description: "Please enter some text to convert.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCase) {
      toast({
        title: "No case selected",
        description: "Please select a case format.",
        variant: "destructive"
      });
      return;
    }

    const converted = convertText(inputText, selectedCase);
    setOutputText(converted);
    
    const caseOption = caseOptions.find(opt => opt.id === selectedCase);
    toast({
      title: "Text converted",
      description: `Converted to ${caseOption?.label}`,
    });
  };

  const handleCopy = async () => {
    if (!outputText) {
      toast({
        title: "Nothing to copy",
        description: "Please convert some text first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Converted text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setSelectedCase("");
    toast({
      title: "Cleared",
      description: "All text has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Type className="w-8 h-8" />
            Case Converter
          </h1>
          <p className="text-muted-foreground">
            Convert text between different cases and naming conventions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Enter your text:</label>
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <label className="block text-sm font-medium mb-3">Select Case Format:</label>
                <div className="flex justify-center">
                  <Select value={selectedCase} onValueChange={setSelectedCase}>
                    <SelectTrigger className="w-full max-w-sm">
                      <SelectValue placeholder="Choose a case format" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.example}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleConvert}
                  disabled={!inputText.trim() || !selectedCase}
                  className="px-8"
                >
                  Convert Text
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!inputText && !outputText}
                  className="px-6"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Converted Text:</label>
            <Textarea
              value={outputText}
              readOnly
              placeholder="Converted text will appear here..."
              className="min-h-[300px] resize-none bg-muted font-mono"
            />
            
            {outputText && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="px-8"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                </div>
                
                {selectedCase && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                    <div className="text-sm">
                      <span className="font-medium">Format: </span>
                      <span className="text-primary">
                        {caseOptions.find(opt => opt.id === selectedCase)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {caseOptions.find(opt => opt.id === selectedCase)?.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseConverter;
