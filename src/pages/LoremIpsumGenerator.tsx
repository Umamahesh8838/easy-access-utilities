import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Copy, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const LoremIpsumGenerator = () => {
  const [generatedText, setGeneratedText] = useState("");
  const [count, setCount] = useState(3);
  const [type, setType] = useState("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const { toast } = useToast();

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
    "accusamus", "accusantium", "doloremque", "laudantium", "totam", "rem",
    "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
    "et", "quasi", "architecto", "beatae", "vitae", "dicta", "sunt", "explicabo",
    "nemo", "ipsam", "voluptatem", "quia", "voluptas", "aspernatur", "aut", "odit",
    "aut", "fugit", "sed", "quia", "consequuntur", "magni", "dolores", "eos", "qui",
    "ratione", "voluptatem", "sequi", "nesciunt", "neque", "porro", "quisquam",
    "est", "qui", "dolorem", "ipsum", "quia", "dolor", "sit", "amet", "consectetur",
    "adipisci", "velit", "sed", "quia", "non", "numquam", "eius", "modi", "tempora",
    "incidunt", "ut", "labore", "et", "dolore", "magnam", "aliquam", "quaerat",
    "voluptatem", "ut", "enim", "ad", "minima", "veniam", "quis", "nostrum",
    "exercitationem", "ullam", "corporis", "suscipit", "laboriosam", "nisi", "ut",
    "aliquid", "ex", "ea", "commodi", "consequatur", "quis", "autem", "vel", "eum",
    "iure", "reprehenderit", "qui", "in", "ea", "voluptate", "velit", "esse", "quam",
    "nihil", "molestiae", "et", "iusto", "odio", "dignissimos", "ducimus", "qui",
    "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti",
    "quos", "dolores", "et", "quas", "molestias", "excepturi", "sint", "occaecati",
    "cupiditate", "non", "provident", "similique", "sunt", "in", "culpa", "qui",
    "officia", "deserunt", "mollitia", "animi", "id", "est", "laborum", "et",
    "dolorum", "fuga", "et", "harum", "quidem", "rerum", "facilis", "est", "et",
    "expedita", "distinctio", "nam", "libero", "tempore", "cum", "soluta", "nobis",
    "est", "eligendi", "optio", "cumque", "nihil", "impedit", "quo", "minus"
  ];

  const generateWord = () => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = (wordCount = Math.floor(Math.random() * 10) + 5) => {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(generateWord());
    }
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  const generateParagraph = (sentenceCount = Math.floor(Math.random() * 5) + 3) => {
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(" ");
  };

  const generateText = () => {
    if (count <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid count greater than 0.",
        variant: "destructive",
      });
      return;
    }

    let result = "";

    switch (type) {
      case "words":
        const words = [];
        for (let i = 0; i < count; i++) {
          words.push(generateWord());
        }
        result = words.join(" ");
        break;

      case "sentences":
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(" ");
        break;

      case "paragraphs":
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join("\n\n");
        break;

      default:
        result = generateParagraph();
    }

    // Start with classic lorem ipsum if option is enabled
    if (startWithLorem && type !== "words") {
      const classicStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
      if (type === "sentences" && count > 0) {
        const restSentences = [];
        for (let i = 1; i < count; i++) {
          restSentences.push(generateSentence());
        }
        result = restSentences.length > 0 ? classicStart + " " + restSentences.join(" ") : classicStart;
      } else if (type === "paragraphs" && count > 0) {
        const restParagraphs = [];
        for (let i = 1; i < count; i++) {
          restParagraphs.push(generateParagraph());
        }
        result = restParagraphs.length > 0 ? classicStart + "\n\n" + restParagraphs.join("\n\n") : classicStart;
      }
    }

    setGeneratedText(result);
    toast({
      title: "Generated!",
      description: `Generated ${count} ${type} of Lorem Ipsum text.`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied!",
        description: "Lorem Ipsum text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const presets = [
    { name: "Short Paragraph", type: "paragraphs", count: 1 },
    { name: "Article", type: "paragraphs", count: 5 },
    { name: "Long Article", type: "paragraphs", count: 10 },
    { name: "Few Sentences", type: "sentences", count: 3 },
    { name: "Many Sentences", type: "sentences", count: 10 },
    { name: "Few Words", type: "words", count: 20 },
    { name: "Many Words", type: "words", count: 100 },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="max-w-7xl w-full">
        {/* Quick Presets Section */}
        <div className="mb-6">
          <div className="bg-accent/50 border border-border rounded-2xl p-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Quick Presets</h2>
              <p className="text-sm text-muted-foreground">
                Generate Lorem Ipsum with predefined settings
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {presets.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setType(preset.type);
                    setCount(preset.count);
                    // Trigger generation after setting the values
                    setTimeout(() => generateText(), 0);
                  }}
                  className="text-xs h-auto py-2 px-3"
                >
                  <div className="text-center">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.count} {preset.type}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tool Section */}
        <div className="bg-card border border-border rounded-2xl shadow-glow w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <FileText className="w-8 h-8" />
            Lorem Ipsum Generator
          </h1>
          <p className="text-muted-foreground">
            Generate placeholder text for your designs and layouts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="count">Number to generate:</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="100"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Generate:</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">Words</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="startWithLorem"
                  checked={startWithLorem}
                  onCheckedChange={(checked) => setStartWithLorem(checked === true)}
                />
                <Label htmlFor="startWithLorem" className="text-sm">
                  Start with "Lorem ipsum"
                </Label>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={generateText}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Text
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-2">Generated Text:</label>
            <Textarea
              value={generatedText}
              readOnly
              placeholder="Generated Lorem Ipsum text will appear here..."
              className="min-h-[400px] resize-none bg-muted font-mono text-sm"
            />
            
            {generatedText && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    className="px-8 mr-4"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedText("");
                      toast({
                        title: "Cleared",
                        description: "Generated text has been cleared.",
                      });
                    }}
                    className="px-6"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                  <div className="text-sm">
                    <span className="font-medium">Generated:</span> {count} {type}
                    <br />
                    <span className="font-medium">Characters:</span> {generatedText.length}
                    <br />
                    <span className="font-medium">Words:</span> {generatedText.split(/\s+/).length}
                  </div>
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

export default LoremIpsumGenerator;
