import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JsonNode {
  id: string;
  key: string;
  value: any;
  type: string;
  level: number;
  parent?: string;
  children: string[];
  count?: number;
}

const JsonTreeViewer = () => {
  const [jsonInput, setJsonInput] = useState(`{
  "user": {
    "name": "John Doe",
    "id": 12345,
    "isActive": true,
    "email": null,
    "roles": [
      "editor",
      "viewer"
    ]
  },
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "sms": false
    }
  }
}`);
  const [nodes, setNodes] = useState<JsonNode[]>([]);
  const [isValidJson, setIsValidJson] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const generateNodeId = (path: string) => path || "root";

  const getValueType = (value: any): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  const getNodeCount = (value: any, type: string): number => {
    if (type === "object") return Object.keys(value).length;
    if (type === "array") return value.length;
    return 0;
  };

  const buildTreeNodes = (obj: any, parentPath = "", level = 0, parentId?: string): JsonNode[] => {
    const nodes: JsonNode[] = [];

    const processValue = (key: string, value: any, index?: number) => {
      const isArrayElement = index !== undefined;
      const currentPath = isArrayElement 
        ? `${parentPath}[${index}]` 
        : parentPath 
          ? `${parentPath}.${key}` 
          : key;
      
      const nodeId = generateNodeId(currentPath);
      const type = getValueType(value);
      const count = getNodeCount(value, type);

      const node: JsonNode = {
        id: nodeId,
        key: isArrayElement ? `[${index}]` : key,
        value,
        type,
        level,
        parent: parentId,
        children: [],
        count: type === "object" || type === "array" ? count : undefined
      };

      nodes.push(node);

      if (type === "object" || type === "array") {
        const childNodes = buildTreeNodes(value, currentPath, level + 1, nodeId);
        nodes.push(...childNodes);
        node.children = childNodes.filter(child => child.parent === nodeId).map(child => child.id);
      }
    };

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        processValue(`item`, item, index);
      });
    } else if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([key, value]) => {
        processValue(key, value);
      });
    }

    return nodes;
  };

  const parseJsonAndGenerateTree = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setIsValidJson(true);
      setErrorMessage("");
      
      if (parsed && typeof parsed === "object") {
        const treeNodes = buildTreeNodes(parsed);
        setNodes(treeNodes);
      } else {
        // Handle primitive root values
        const rootNode: JsonNode = {
          id: "root",
          key: "root",
          value: parsed,
          type: getValueType(parsed),
          level: 0,
          children: []
        };
        setNodes([rootNode]);
      }
    } catch (error) {
      setIsValidJson(false);
      setErrorMessage("Invalid JSON format");
      setNodes([]);
    }
  };

  useEffect(() => {
    parseJsonAndGenerateTree(jsonInput);
  }, [jsonInput]);

  const renderValue = (node: JsonNode) => {
    const { value, type, count } = node;
    
    if (type === "string") return `"${value}"`;
    if (type === "null") return "null";
    if (type === "object") return `{${count}}`;
    if (type === "array") return `[${count}]`;
    return String(value);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "string": return "bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200";
      case "number": return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200";
      case "boolean": return "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200";
      case "null": return "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400";
      case "object": return "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200";
      case "array": return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200";
      default: return "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
    toast({
      title: "Copied!",
      description: "JSON copied to clipboard.",
    });
  };

  const downloadAsFile = () => {
    const blob = new Blob([jsonInput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getNodeShape = (type: string) => {
    switch (type) {
      case "object": return "rounded-xl shadow-lg";
      case "array": return "rounded-lg shadow-md";
      case "string": return "rounded-full shadow-sm";
      case "number": return "rounded shadow-sm";
      case "boolean": return "rounded-md shadow-sm";
      case "null": return "rounded-sm shadow-sm";
      default: return "rounded shadow-sm";
    }
  };

  const renderTreeNode = (node: JsonNode, depth = 0) => {
    const childNodes = nodes.filter(n => n.parent === node.id);
    const hasChildren = childNodes.length > 0;
    
    return (
      <div key={node.id} className="relative flex flex-col items-start">
        {/* Node with enhanced styling */}
        <div className="relative flex items-center group">
          {/* Connection line from parent */}
          {node.parent && depth > 0 && (
            <>
              {/* Horizontal line */}
              <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400"></div>
              {/* Connection dot */}
              <div className="absolute -left-10 top-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2 shadow-sm"></div>
            </>
          )}
          
          {/* Main Node */}
          <div className={`
            relative px-4 py-3 border-2 ${getNodeColor(node.type)} 
            ${getNodeShape(node.type)} min-w-[140px] max-w-[200px] 
            transition-all duration-300 hover:scale-105 hover:shadow-xl
            transform group-hover:translate-x-1
          `}>
            {/* Node type indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-current opacity-50"></div>
            
            <div className="text-center">
              <div className="font-semibold text-sm truncate">
                {node.key}
              </div>
              <div className="text-xs mt-1 opacity-90">
                {renderValue(node)}
              </div>
              {(node.type === "object" || node.type === "array") && (
                <div className="text-xs mt-1 opacity-70 font-mono">
                  {node.type === "object" ? "object" : "array"}
                </div>
              )}
            </div>
            
            {/* Arrow indicator for children */}
            {hasChildren && (
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-l-4 border-l-current border-t-2 border-t-transparent border-b-2 border-b-transparent opacity-60"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Children container with enhanced connections */}
        {hasChildren && (
          <div className="relative mt-6 ml-16">
            {/* Vertical line to children */}
            <div className="absolute -left-8 -top-2 w-0.5 h-4 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400"></div>
            
            {/* Children nodes */}
            <div className="space-y-6">
              {childNodes.map((childNode, index) => (
                <div key={childNode.id} className="relative">
                  {/* Branch line for each child */}
                  <div className="absolute -left-8 top-6 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400"></div>
                  
                  {/* Vertical connector line between siblings */}
                  {index < childNodes.length - 1 && (
                    <div className="absolute -left-8 top-6 w-0.5 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400" 
                         style={{ height: `calc(100% + 1.5rem)` }}></div>
                  )}
                  
                  {renderTreeNode(childNode, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-40 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">JSON Tree Viewer</h1>
          <p className="text-xl text-muted-foreground">
            Visualize JSON data in an interactive tree structure
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 min-h-[700px]">
          {/* Code Editor Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>JSON Editor</CardTitle>
              <CardDescription>
                Enter or paste your JSON data here. The tree will update in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 relative">
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[400px] font-mono text-sm resize-none"
                  placeholder="Enter your JSON here..."
                />
              </div>
              
              {!isValidJson && (
                <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON
                </Button>
                <Button
                  onClick={downloadAsFile}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tree Visualization Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Tree Visualization</CardTitle>
              <CardDescription>
                Interactive tree representation of your JSON structure
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full overflow-auto border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                {isValidJson && nodes.length > 0 ? (
                  <div className="min-h-full">
                    {/* Flowchart header */}
                    <div className="mb-6 text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        JSON Structure Flowchart
                      </div>
                    </div>
                    
                    {/* Root nodes with enhanced spacing */}
                    <div className="space-y-8">
                      {nodes.filter(node => !node.parent).map(rootNode => renderTreeNode(rootNode, 0))}
                    </div>
                  </div>
                ) : isValidJson ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-400 dark:border-gray-500 rounded border-dashed"></div>
                      </div>
                      <div className="text-lg font-medium mb-2">No Data</div>
                      <div className="text-sm">Enter valid JSON to see the flowchart visualization</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                      <div className="text-lg font-medium mb-2">Invalid JSON</div>
                      <div className="text-sm">Fix the JSON syntax to see the visualization</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Node Types Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 rounded border-2 bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200 text-xs">
                  Object {"{3}"}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 rounded border-2 bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-xs">
                  Array [2]
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 rounded border-2 bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200 text-xs">
                  String
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 rounded border-2 bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200 text-xs">
                  Number
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 rounded border-2 bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200 text-xs">
                  Boolean
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 rounded border-2 bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 text-xs">
                  Null
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About JSON Tree Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This JSON Tree Viewer provides a visual representation of JSON data structure. 
              The left panel features a code editor with syntax highlighting where you can input 
              or paste JSON data. The right panel displays an interactive tree diagram that 
              updates in real-time as you modify the JSON. Objects show their property count, 
              arrays show their element count, and primitive values are displayed with their 
              actual values. Perfect for understanding complex JSON structures and debugging data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JsonTreeViewer;
