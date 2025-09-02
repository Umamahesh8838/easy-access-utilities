import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const CharacterCounter = () => {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    readingTime: 0,
    readingTimeSeconds: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    calculateStats(text);
  }, [text]);

  const calculateStats = (inputText: string) => {
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
    
    // Better sentence counting algorithm
    let sentences = 0;
    if (inputText.trim() !== '') {
      // Remove common abbreviations that shouldn't end sentences
      const textWithoutAbbrev = inputText
        .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|a\.m|p\.m|U\.S|U\.K)\./gi, (match) => match.replace('.', '___DOT___'));
      
      // Split by sentence endings and count valid sentences
      const potentialSentences = textWithoutAbbrev.split(/[.!?]+/);
      
      sentences = potentialSentences.filter(sentence => {
        const cleaned = sentence.trim().replace(/___DOT___/g, '.');
        // Must have at least one word (letters)
        return cleaned.length > 0 && /[a-zA-Z]/.test(cleaned);
      }).length;
      
      // If the text doesn't end with punctuation, the last part isn't a complete sentence
      if (!/[.!?]\s*$/.test(inputText.trim())) {
        sentences = Math.max(0, sentences - 1);
      }
    }
    
    const paragraphs = inputText.trim() === '' ? 0 : inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const lines = inputText === '' ? 0 : inputText.split('\n').length;
    
    // Reading time calculation (200 words per minute = 3.33 words per second)
    const readingTimeMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
    const readingTimeSeconds = words === 0 ? 0 : Math.ceil(words / 3.33); // 200 words/min = 3.33 words/sec

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime: readingTimeMinutes,
      readingTimeSeconds
    });
  };

  const handleClear = () => {
    setText("");
    toast({
      title: "Cleared",
      description: "Text has been cleared.",
    });
  };

  const handleCopy = () => {
    const statsText = `Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading time: ${stats.readingTime} min`;
    
    navigator.clipboard.writeText(statsText);
    toast({
      title: "Copied",
      description: "Statistics copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4" style={{ marginTop: '96px' }}>
      <div className="bg-card border border-border rounded-2xl shadow-glow max-w-4xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Character Counter</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Enter your text:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="min-h-96 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleClear} variant="outline">
                Clear Text
              </Button>
              <Button onClick={handleCopy} variant="secondary">
                Copy Stats
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Text Statistics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                  <div className="text-sm text-muted-foreground">Characters</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{stats.charactersNoSpaces}</div>
                  <div className="text-sm text-muted-foreground">Characters (no spaces)</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{stats.words}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{stats.sentences}</div>
                  <div className="text-sm text-muted-foreground">Sentences</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{stats.paragraphs}</div>
                  <div className="text-sm text-muted-foreground">Paragraphs</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{stats.lines}</div>
                  <div className="text-sm text-muted-foreground">Lines</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg text-center border">
                <div className="text-lg font-semibold">📖 Reading Time</div>
                <div className="text-2xl font-bold text-primary">
                  {stats.readingTime === 0 ? '0m 0s' : 
                   stats.readingTime < 1 ? `${stats.readingTimeSeconds}s` :
                   `${stats.readingTime}m ${stats.readingTimeSeconds % 60}s`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.words === 0 ? 'No reading time' : 
                   stats.readingTimeSeconds < 60 ? 'seconds' : 
                   'minutes and seconds'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.words > 0 ? `Based on 200 words per minute (${stats.words} words)` : 'No words to read'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCounter;
