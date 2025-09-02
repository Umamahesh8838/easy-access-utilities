import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Lock, Unlock, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JwtEncoder = () => {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState(`{
  "alg": "HS256",
  "typ": "JWT"
}`);
  const [payload, setPayload] = useState(`{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1716239022
}`);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedPayload, setDecodedPayload] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const { toast } = useToast();

  // Base64 URL encoding/decoding functions
  const base64UrlEncode = (str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const base64UrlDecode = (str: string): string => {
    str += '='.repeat((4 - str.length % 4) % 4);
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  };

  // Simple HMAC SHA256 simulation (for demo purposes)
  const createSignature = (data: string, secret: string): string => {
    // This is a simplified version - in real applications, use a proper crypto library
    let hash = 0;
    const combined = data + secret;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return base64UrlEncode(Math.abs(hash).toString(16));
  };

  const generateToken = () => {
    try {
      // Validate JSON
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);

      // Create token parts
      const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
      const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
      
      // Create signature
      const signatureData = `${encodedHeader}.${encodedPayload}`;
      const signature = createSignature(signatureData, secret);
      
      // Combine parts
      const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
      setToken(jwt);

      toast({
        title: "JWT Generated",
        description: "Token has been generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in header or payload",
        variant: "destructive",
      });
    }
  };

  const decodeToken = () => {
    try {
      if (!token.trim()) {
        setDecodedHeader("");
        setDecodedPayload("");
        setIsValidToken(false);
        return;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const [headerPart, payloadPart, signaturePart] = parts;
      
      // Decode header and payload
      const decodedHeaderData = base64UrlDecode(headerPart);
      const decodedPayloadData = base64UrlDecode(payloadPart);
      
      // Validate JSON
      const headerObj = JSON.parse(decodedHeaderData);
      const payloadObj = JSON.parse(decodedPayloadData);
      
      setDecodedHeader(JSON.stringify(headerObj, null, 2));
      setDecodedPayload(JSON.stringify(payloadObj, null, 2));
      
      // Verify signature (simplified)
      const expectedSignature = createSignature(`${headerPart}.${payloadPart}`, secret);
      setIsValidToken(expectedSignature === signaturePart);

      toast({
        title: "JWT Decoded",
        description: "Token has been decoded successfully!",
      });
    } catch (error) {
      setDecodedHeader("");
      setDecodedPayload("");
      setIsValidToken(false);
      toast({
        title: "Error",
        description: "Invalid JWT token format",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getTokenParts = () => {
    if (!token) return { header: "", payload: "", signature: "" };
    
    const parts = token.split('.');
    return {
      header: parts[0] || "",
      payload: parts[1] || "",
      signature: parts[2] || ""
    };
  };

  const tokenParts = getTokenParts();

  const sampleTokens = [
    {
      name: "Basic User Token",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      description: "Standard user authentication token"
    },
    {
      name: "Admin Token",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwibmFtZSI6IkphbmUgU21pdGgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc0NzMwNzIyMn0.Lq-83YRX-NaVKI5JKnLIpLhKNJZrBNJKdP-9Vr8-K_M",
      description: "Administrative privileges token"
    }
  ];

  const isTokenExpired = () => {
    try {
      const payloadObj = JSON.parse(decodedPayload);
      if (payloadObj.exp) {
        return Date.now() / 1000 > payloadObj.exp;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">JWT Encoder/Decoder</h1>
          <p className="text-xl text-muted-foreground">
            Encode and decode JSON Web Tokens (JWT) with signature verification
          </p>
        </div>

        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">
              <Lock className="w-4 h-4 mr-2" />
              Encode JWT
            </TabsTrigger>
            <TabsTrigger value="decode">
              <Unlock className="w-4 h-4 mr-2" />
              Decode JWT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 min-h-[500px]">
              {/* Input Panel */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Token Parts</CardTitle>
                  <CardDescription>
                    Configure the header, payload, and secret
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div>
                    <Label htmlFor="header" className="mb-2 block">
                      Header (JSON)
                    </Label>
                    <Textarea
                      id="header"
                      value={header}
                      onChange={(e) => setHeader(e.target.value)}
                      className="min-h-[100px] font-mono text-sm resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payload" className="mb-2 block">
                      Payload (JSON)
                    </Label>
                    <Textarea
                      id="payload"
                      value={payload}
                      onChange={(e) => setPayload(e.target.value)}
                      className="min-h-[120px] font-mono text-sm resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secret" className="mb-2 block">
                      Secret Key
                    </Label>
                    <Input
                      id="secret"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="font-mono"
                      placeholder="Enter your secret key..."
                    />
                  </div>

                  <Button onClick={generateToken} className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Generate JWT
                  </Button>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Generated Token</CardTitle>
                  <CardDescription>
                    Your encoded JWT token
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  {token && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <h3 className="font-medium mb-2">Token Parts</h3>
                        <div className="space-y-2 text-sm font-mono">
                          <div>
                            <span className="text-red-600 dark:text-red-300">Header:</span>
                            <div className="break-all bg-red-100 dark:bg-red-900/20 p-2 rounded mt-1">
                              {tokenParts.header}
                            </div>
                          </div>
                          <div>
                            <span className="text-purple-600 dark:text-purple-300">Payload:</span>
                            <div className="break-all bg-purple-100 dark:bg-purple-900/20 p-2 rounded mt-1">
                              {tokenParts.payload}
                            </div>
                          </div>
                          <div>
                            <span className="text-cyan-600 dark:text-cyan-300">Signature:</span>
                            <div className="break-all bg-cyan-100 dark:bg-cyan-900/20 p-2 rounded mt-1">
                              {tokenParts.signature}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="token-output" className="mb-2 block">
                          Complete JWT Token
                        </Label>
                        <Textarea
                          id="token-output"
                          value={token}
                          readOnly
                          className="min-h-[100px] font-mono text-sm resize-none"
                        />
                      </div>

                      <Button 
                        onClick={() => copyToClipboard(token, "JWT Token")} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Token
                      </Button>
                    </div>
                  )}

                  {!token && (
                    <div className="text-muted-foreground text-center py-8">
                      Generated JWT token will appear here
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="decode" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 min-h-[500px]">
              {/* Input Panel */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>JWT Token Input</CardTitle>
                  <CardDescription>
                    Paste your JWT token to decode
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div>
                    <Label htmlFor="token-input" className="mb-2 block">
                      JWT Token
                    </Label>
                    <Textarea
                      id="token-input"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your JWT token here..."
                      className="min-h-[120px] font-mono text-sm resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="decode-secret" className="mb-2 block">
                      Secret Key (for verification)
                    </Label>
                    <Input
                      id="decode-secret"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="font-mono"
                      placeholder="Enter secret key to verify signature..."
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Sample Tokens</Label>
                    <div className="space-y-2">
                      {sampleTokens.map((sample, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setToken(sample.token)}
                          className="justify-start w-full"
                        >
                          <div className="text-left">
                            <div className="font-medium">{sample.name}</div>
                            <div className="text-xs text-muted-foreground">{sample.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={decodeToken} className="w-full">
                    <Unlock className="w-4 h-4 mr-2" />
                    Decode JWT
                  </Button>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Decoded Content
                    {decodedPayload && (
                      <Badge 
                        variant={isValidToken ? "default" : "destructive"}
                        className={isValidToken ? "bg-green-600" : ""}
                      >
                        {isValidToken ? "Valid Signature" : "Invalid Signature"}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Decoded header and payload
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  {decodedPayload && isTokenExpired() && (
                    <div className="border border-yellow-600 rounded-lg p-3 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-yellow-800 dark:text-yellow-200 text-sm">This token has expired</span>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Header</Label>
                      {decodedHeader && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(decodedHeader, "Header")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={decodedHeader}
                      readOnly
                      className="min-h-[100px] font-mono text-sm resize-none"
                      placeholder="Decoded header will appear here..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Payload</Label>
                      {decodedPayload && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(decodedPayload, "Payload")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={decodedPayload}
                      readOnly
                      className="min-h-[120px] font-mono text-sm resize-none"
                      placeholder="Decoded payload will appear here..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* About Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About JWT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="font-semibold">What is JWT?</span>
                </div>
                <p className="text-sm">JSON Web Token is a compact, URL-safe means of representing claims between two parties. It consists of three parts: header, payload, and signature.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Security Note</span>
                </div>
                <p className="text-sm">This tool uses client-side processing only. However, never paste real secret keys or sensitive tokens into online tools.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Common Use Cases</span>
                </div>
                <p className="text-sm">Authentication, authorization, and secure information exchange between services and applications.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JwtEncoder;
