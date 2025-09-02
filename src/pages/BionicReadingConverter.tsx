import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Copy, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const BionicReadingConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [boldPercentage, setBoldPercentage] = useState([50]);
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  const convertToBionicReading = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert.",
        variant: "destructive",
      });
      return;
    }

    const percentage = boldPercentage[0];
    const words = inputText.split(/(\s+)/);
    
    const convertedWords = words.map(word => {
      if (/^\s+$/.test(word)) return word; // Keep whitespace as is
      
      const letters = word.split('');
      const boldCount = Math.ceil((letters.length * percentage) / 100);
      
      let result = '';
      for (let i = 0; i < letters.length; i++) {
        if (i < boldCount && /[a-zA-Z]/.test(letters[i])) {
          result += `**${letters[i]}**`;
        } else {
          result += letters[i];
        }
      }
      return result;
    });

    setOutputText(convertedWords.join(''));
    
    toast({
      title: "Converted!",
      description: "Text has been converted to Bionic Reading format.",
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
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Bionic reading text copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const renderBionicText = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const loadSampleText = (type: string) => {
    const samples = {
      'explanation': `Bionic Reading revises texts so that the most concise parts of words are highlighted. This guides the eye over the text and the brain remembers previously learned words more quickly.`,
      'pangram': `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.`,
      'lorem': `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`
    };

    setInputText(samples[type as keyof typeof samples] || '');
    toast({
      title: "Sample Loaded!",
      description: `Loaded ${type} sample text for testing.`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Eye className="w-8 h-8" />
            Bionic Reading Converter
          </h1>
          <p className="text-muted-foreground">
            Convert text to Bionic Reading format to improve reading speed and comprehension
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sample Texts Section - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl shadow-glow p-6 sticky top-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">Sample Texts</h2>
                <p className="text-sm text-muted-foreground">
                  Try these sample texts
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('explanation')}
                  className="w-full text-xs h-auto py-3 px-4"
                >
                  <div className="text-center">
                    <div className="font-medium">Bionic Reading Explanation</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      How it works
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('pangram')}
                  className="w-full text-xs h-auto py-3 px-4"
                >
                  <div className="text-center">
                    <div className="font-medium">Pangram Example</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Classic alphabet sentence
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSampleText('lorem')}
                  className="w-full text-xs h-auto py-3 px-4"
                >
                  <div className="text-center">
                    <div className="font-medium">Lorem Ipsum</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Standard placeholder text
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Main Tool Section */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl shadow-glow p-8">

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
                    <div>
                      <Label>Bold Percentage: {boldPercentage[0]}%</Label>
                      <Slider
                        value={boldPercentage}
                        onValueChange={setBoldPercentage}
                        max={80}
                        min={20}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Percentage of each word to make bold
                      </p>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={convertToBionicReading}
                        disabled={!inputText.trim()}
                        className="px-8"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Convert to Bionic Reading
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Output Section */}
                <div ref={outputRef}>
                  <label className="block text-sm font-medium mb-2">Bionic Reading Text:</label>
                  <div className="min-h-[300px] p-4 border rounded-lg bg-muted/50 font-serif text-base leading-relaxed">
                    {outputText ? (
                      <div className="whitespace-pre-wrap">
                        {renderBionicText(outputText)}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-20">
                        <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Converted bionic reading text will appear here</p>
                      </div>
                    )}
                  </div>
                  
                  {outputText && (
                    <div className="mt-6 space-y-4">
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={copyToClipboard}
                          className="px-8 mr-4"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Result
                        </Button>
                        
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
                        <div className="text-sm">
                          <span className="font-medium">Bold percentage:</span> {boldPercentage[0]}%
                          <br />
                          <span className="font-medium">Words processed:</span> {outputText.split(/\s+/).filter(w => w.trim()).length}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">About Bionic Reading</h4>
                <p className="text-sm text-blue-800">
                  Bionic Reading is a reading method that highlights the most important parts of words to guide your eye and help your brain process text more efficiently. 
                  The highlighted portions act as artificial fixation points that facilitate the reading flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BionicReadingConverter;
