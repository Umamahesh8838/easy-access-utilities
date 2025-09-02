import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Smartphone, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReactNativeShadowGenerator = () => {
  const [shadow, setShadow] = useState({
    elevation: [4],
    shadowColor: "#000000",
    shadowOffset: { width: [0], height: [2] },
    shadowOpacity: [0.25],
    shadowRadius: [4],
  });
  const { toast } = useToast();

  const generateShadowCode = () => {
    const code = {
      android: `elevation: ${shadow.elevation[0]},`,
      ios: `shadowColor: '${shadow.shadowColor}',
shadowOffset: {
  width: ${shadow.shadowOffset.width[0]},
  height: ${shadow.shadowOffset.height[0]},
},
shadowOpacity: ${shadow.shadowOpacity[0]},
shadowRadius: ${shadow.shadowRadius[0]},`,
      combined: `// Shadow Style
shadowColor: '${shadow.shadowColor}',
shadowOffset: {
  width: ${shadow.shadowOffset.width[0]},
  height: ${shadow.shadowOffset.height[0]},
},
shadowOpacity: ${shadow.shadowOpacity[0]},
shadowRadius: ${shadow.shadowRadius[0]},
elevation: ${shadow.elevation[0]}, // Android`
    };

    return code;
  };

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: `${type} shadow code copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCode = () => {
    const code = generateShadowCode();
    const fullCode = `// React Native Shadow Styles
// Generated with Easy Access Utilities

// iOS Shadow Properties
${code.ios}

// Android Shadow Property
${code.android}

// Combined Shadow Style (Recommended)
const shadowStyle = {
  ${code.combined}
};

// Usage Example:
// <View style={[styles.container, shadowStyle]}>
//   <Text>Your content here</Text>
// </View>
`;

    const blob = new Blob([fullCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "react-native-shadow.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const presets = [
    {
      name: "Subtle Card",
      shadow: {
        elevation: [2],
        shadowColor: "#000000",
        shadowOffset: { width: [0], height: [1] },
        shadowOpacity: [0.20],
        shadowRadius: [1.41],
      }
    },
    {
      name: "Medium Card",
      shadow: {
        elevation: [4],
        shadowColor: "#000000",
        shadowOffset: { width: [0], height: [2] },
        shadowOpacity: [0.25],
        shadowRadius: [3.84],
      }
    },
    {
      name: "Elevated Card",
      shadow: {
        elevation: [8],
        shadowColor: "#000000",
        shadowOffset: { width: [0], height: [4] },
        shadowOpacity: [0.30],
        shadowRadius: [4.65],
      }
    },
    {
      name: "Floating Button",
      shadow: {
        elevation: [6],
        shadowColor: "#000000",
        shadowOffset: { width: [0], height: [3] },
        shadowOpacity: [0.27],
        shadowRadius: [4.65],
      }
    },
    {
      name: "Modal/Dialog",
      shadow: {
        elevation: [12],
        shadowColor: "#000000",
        shadowOffset: { width: [0], height: [6] },
        shadowOpacity: [0.37],
        shadowRadius: [7.49],
      }
    },
    {
      name: "Heavy Drop Shadow",
      shadow: {
        elevation: [16],
        shadowColor: "#000000",
        shadowOffset: { width: [0], height: [8] },
        shadowOpacity: [0.44],
        shadowRadius: [10.32],
      }
    }
  ];

  const loadPreset = (preset: typeof presets[0]) => {
    setShadow(preset.shadow);
  };

  const code = generateShadowCode();

  return (
    <div className="pt-40 min-h-screen bg-background px-4 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Config & Preview */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                React Native Shadow Generator
              </CardTitle>
              <CardDescription>
                Generate cross-platform shadow styles for React Native components. Adjust properties and preview the result.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {presets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => loadPreset(preset)}
                        className="justify-start"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  <div>
                    <Label>Shadow Color</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <input
                        type="color"
                        value={shadow.shadowColor}
                        onChange={(e) => setShadow(prev => ({ ...prev, shadowColor: e.target.value }))}
                        className="w-10 h-10 rounded border"
                      />
                      <span className="font-mono text-sm">{shadow.shadowColor}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Elevation (Android): {shadow.elevation[0]}</Label>
                    <Slider
                      value={shadow.elevation}
                      onValueChange={(value) => setShadow(prev => ({ ...prev, elevation: value }))}
                      min={0}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Offset X: {shadow.shadowOffset.width[0]}</Label>
                    <Slider
                      value={shadow.shadowOffset.width}
                      onValueChange={(value) => setShadow(prev => ({ 
                        ...prev, 
                        shadowOffset: { ...prev.shadowOffset, width: value }
                      }))}
                      min={-10}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Offset Y: {shadow.shadowOffset.height[0]}</Label>
                    <Slider
                      value={shadow.shadowOffset.height}
                      onValueChange={(value) => setShadow(prev => ({ 
                        ...prev, 
                        shadowOffset: { ...prev.shadowOffset, height: value }
                      }))}
                      min={-10}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Shadow Opacity: {shadow.shadowOpacity[0]}</Label>
                    <Slider
                      value={shadow.shadowOpacity}
                      onValueChange={(value) => setShadow(prev => ({ ...prev, shadowOpacity: value }))}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Shadow Radius (iOS): {shadow.shadowRadius[0]}</Label>
                    <Slider
                      value={shadow.shadowRadius}
                      onValueChange={(value) => setShadow(prev => ({ ...prev, shadowRadius: value }))}
                      min={0}
                      max={20}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Live Preview</Label>
                  <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
                    <div 
                      className="w-32 h-24 bg-white rounded-lg flex items-center justify-center"
                      style={{
                        boxShadow: `${shadow.shadowOffset.width[0]}px ${shadow.shadowOffset.height[0]}px ${shadow.shadowRadius[0]}px ${shadow.shadowColor}${Math.round(shadow.shadowOpacity[0] * 255).toString(16).padStart(2, '0')}`
                      }}
                    >
                      <span className="text-muted-foreground text-sm">Preview</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Combined (Recommended)</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code.combined, "Combined")}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-background border rounded p-3 overflow-x-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {code.combined}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>iOS Only</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code.ios, "iOS")}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-background border rounded p-3 overflow-x-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {code.ios}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Android Only</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code.android, "Android")}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-background border rounded p-3 overflow-x-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {code.android}
                        </pre>
                      </div>
                    </div>
                    <Button onClick={downloadCode} className="w-full mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download Complete Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right: Info & Properties */}
        <div className="space-y-8">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>About & Shadow Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  <b>React Native Shadow Generator</b> helps you create cross-platform shadow styles for your components. Adjust the sliders, pick a color, and copy or download the generated code for iOS and Android.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">iOS Properties</h3>
                    <ul className="list-disc ml-5">
                      <li><b>shadowColor</b>: The color of the shadow</li>
                      <li><b>shadowOffset</b>: The offset (x, y) of the shadow</li>
                      <li><b>shadowOpacity</b>: The opacity of the shadow (0-1)</li>
                      <li><b>shadowRadius</b>: The blur radius of the shadow</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Android Properties</h3>
                    <ul className="list-disc ml-5">
                      <li><b>elevation</b>: Material Design elevation (0-24)</li>
                    </ul>
                    <div className="text-xs opacity-75 mt-2">
                      Android automatically generates shadows based on elevation value. Higher elevation creates larger, softer shadows.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReactNativeShadowGenerator;
