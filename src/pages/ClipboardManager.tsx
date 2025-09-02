import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Copy,
  Star,
  Pin,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  MoreVertical,
  FileText,
  Code,
  Image,
  Moon,
  Sun,
  Eye,
  Settings,
  X,
  ClipboardCopy,
  Hash,
} from "lucide-react";
import useClipboardStore, { type ClipboardItem, type FilterType } from "../hooks/useClipboardStore";
import { toast } from "sonner";
import { updatePageSEO, toolSEOData, addBreadcrumbStructuredData } from "../utils/seo";

const ClipboardManager: React.FC = () => {
  const {
    clips,
    searchQuery,
    activeFilter,
    sortBy,
    selectedClipId,
    showDetailModal,
    isDarkMode,
    isHighContrast,
    maxClips,
    addClip,
    updateClip,
    deleteClip,
    clearAllClips,
    setSearchQuery,
    setActiveFilter,
    setSortBy,
    setSelectedClipId,
    setShowDetailModal,
    setIsDarkMode,
    setIsHighContrast,
    getFilteredClips,
    getAllTags,
    getClipById,
    exportData,
    importData,
    getStorageInfo,
  } = useClipboardStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [newClip, setNewClip] = useState({
    type: "text" as const,
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [clipboardPermission, setClipboardPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [searchResultIndex, setSearchResultIndex] = useState<number>(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClips = useMemo(() => getFilteredClips(), [searchQuery, activeFilter, clips]);
  const allTags = useMemo(() => getAllTags(), [clips]);
  const storageInfo = useMemo(() => getStorageInfo(), [clips]);

  // Check clipboard permissions on mount
  useEffect(() => {
    checkClipboardPermission();
    
    // Update SEO metadata
    updatePageSEO(toolSEOData['clipboard-manager']);
    
    // Add breadcrumb structured data
    addBreadcrumbStructuredData([
      { name: 'Home', url: 'https://easy-access-utilities.vercel.app/' },
      { name: 'Tools', url: 'https://easy-access-utilities.vercel.app/#tools' },
      { name: 'Clipboard Manager', url: 'https://easy-access-utilities.vercel.app/tools/clipboard-manager' }
    ]);
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    document.documentElement.classList.toggle("high-contrast", isHighContrast);
  }, [isDarkMode, isHighContrast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Handle search results navigation
      if (searchQuery && filteredClips.length > 0) {
        const maxIndex = Math.min(filteredClips.length - 1, 4); // Max 5 results shown
        
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSearchResultIndex(prev => Math.min(prev + 1, maxIndex));
            break;
          case "ArrowUp":
            e.preventDefault();
            setSearchResultIndex(prev => Math.max(prev - 1, -1));
            break;
          case "Enter":
            if (searchResultIndex >= 0 && searchResultIndex < filteredClips.length) {
              e.preventDefault();
              const selectedClip = filteredClips[searchResultIndex];
              setSelectedClipId(selectedClip.id);
              setShowDetailModal(true);
              setSearchQuery('');
              setSearchResultIndex(-1);
            }
            break;
          case "Escape":
            setSearchQuery('');
            setSearchResultIndex(-1);
            setShowDetailModal(false);
            setShowAddDialog(false);
            break;
        }
        return;
      }
      
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "/":
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "n":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowAddDialog(true);
          }
          break;
        case "Escape":
          setShowDetailModal(false);
          setShowAddDialog(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [searchQuery, filteredClips, searchResultIndex]);

  const checkClipboardPermission = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
        setClipboardPermission(permission.state);
      }
    } catch (error) {
      console.log("Clipboard permission check not supported");
    }
  }, []);

  const captureFromClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard) {
        toast.error("Clipboard API not supported");
        return;
      }

      // Try to read text first
      const text = await navigator.clipboard.readText();
      if (text) {
        const title = generateTitle(text);
        addClip({
          type: "text",
          title,
          content: text,
          tags: [],
          favorite: false,
          pinned: false,
        });
        toast.success("Text captured from clipboard");
        return;
      }

      // Try to read richer content
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        // Check for HTML
        if (item.types.includes("text/html")) {
          const htmlBlob = await item.getType("text/html");
          const html = await htmlBlob.text();
          const title = generateTitle(stripHtml(html));
          addClip({
            type: "html",
            title,
            content: html,
            tags: [],
            favorite: false,
            pinned: false,
          });
          toast.success("HTML captured from clipboard");
          return;
        }

        // Check for image
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const imageBlob = await item.getType(type);
            const dataUrl = await blobToDataUrl(imageBlob);
            addClip({
              type: "image",
              title: `Image ${new Date().toLocaleString()}`,
              content: dataUrl,
              tags: [],
              favorite: false,
              pinned: false,
            });
            toast.success("Image captured from clipboard");
            return;
          }
        }
      }
    } catch (error) {
      console.error("Failed to capture from clipboard:", error);
      toast.error("Failed to capture from clipboard. Permission may be denied.");
    }
  }, [addClip]);

  const copyToClipboard = useCallback(async (clip: ClipboardItem) => {
    try {
      if (clip.type === "text") {
        await navigator.clipboard.writeText(clip.content);
        toast.success("Text copied to clipboard");
      } else if (clip.type === "html" && clip.rawHtml) {
        const htmlBlob = new Blob([clip.rawHtml], { type: "text/html" });
        const textBlob = new Blob([stripHtml(clip.content)], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob,
          }),
        ]);
        toast.success("HTML copied to clipboard");
      } else if (clip.type === "image") {
        const response = await fetch(clip.content);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        toast.success("Image copied to clipboard");
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      fallbackCopy(clip.type === "html" ? stripHtml(clip.content) : clip.content);
    }
  }, []);

  const fallbackCopy = useCallback((text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success("Copied to clipboard (fallback method)");
  }, []);

  const generateTitle = useCallback((content: string): string => {
    const firstLine = content.split("\n")[0].trim();
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + "...";
    }
    return firstLine || "Untitled";
  }, []);

  const stripHtml = useCallback((html: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }, []);

  const blobToDataUrl = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }, []);

  const handleAddClip = useCallback(() => {
    if (!newClip.content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    const title = newClip.title.trim() || generateTitle(newClip.content);
    addClip({
      type: newClip.type,
      title,
      content: newClip.content,
      tags: newClip.tags,
      favorite: false,
      pinned: false,
    });

    setNewClip({ type: "text", title: "", content: "", tags: [] });
    setShowAddDialog(false);
    toast.success("Clip added successfully");
  }, [newClip, addClip, generateTitle]);

  const handleTagAdd = useCallback((tag: string) => {
    if (tag && !newClip.tags.includes(tag)) {
      setNewClip(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  }, [newClip.tags]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    setNewClip(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clipboard-manager-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  }, [exportData]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        importData(data);
        toast.success("Data imported successfully");
      } catch (error) {
        toast.error("Failed to import data");
      }
    };
    reader.readAsText(file);
  }, [importData]);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />;
      case "html":
        return <Code className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  }, []);

  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const selectedClip = useMemo(() => selectedClipId ? getClipById(selectedClipId) : null, [selectedClipId, getClipById]);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300" style={{ paddingTop: '120px' }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Clipboard Manager</h1>
            <p className="text-muted-foreground">
              Capture, organize, and manage your clipboard history with privacy-first local storage
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="ghost"
              size="icon"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isHighContrast}
                      onCheckedChange={setIsHighContrast}
                    />
                    <Label>High Contrast</Label>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowClearDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Toolbar */}
        <section className="flex flex-col lg:flex-row gap-4 mb-6" aria-label="Clipboard actions and search">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
            <Input
              ref={searchInputRef}
              placeholder="Search clips... (Press / to focus)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchResultIndex(-1); // Reset selection when typing
              }}
              className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              aria-label="Search clipboard items"
            />
            {/* Search Results Summary */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 z-20 bg-card border border-border rounded-md mt-1 p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {filteredClips.length} result{filteredClips.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResultIndex(-1);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {filteredClips.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredClips.slice(0, 5).map((clip, index) => (
                      <div
                        key={clip.id}
                        className={`flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm transition-colors ${
                          index === searchResultIndex ? 'bg-muted ring-1 ring-primary' : ''
                        }`}
                        onClick={() => {
                          setSelectedClipId(clip.id);
                          setShowDetailModal(true);
                          setSearchQuery('');
                          setSearchResultIndex(-1);
                        }}
                      >
                        {getTypeIcon(clip.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{clip.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {clip.type === "html" ? stripHtml(clip.content) : clip.content}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(clip.createdAt)}
                        </div>
                      </div>
                    ))}
                    {filteredClips.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{filteredClips.length - 5} more results below
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No clips match your search query
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={captureFromClipboard} variant="default">
              <ClipboardCopy className="w-4 h-4 mr-2" />
              Capture
            </Button>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </section>

        {/* Filters */}
        <nav className="flex flex-wrap items-center gap-2 mb-6" aria-label="Filter clipboard items">
          {(["all", "text", "html", "image", "pinned", "favorites"] as FilterType[]).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter === "all" && <Filter className="w-4 h-4 mr-2" />}
              {filter === "text" && <FileText className="w-4 h-4 mr-2" />}
              {filter === "html" && <Code className="w-4 h-4 mr-2" />}
              {filter === "image" && <Image className="w-4 h-4 mr-2" />}
              {filter === "pinned" && <Pin className="w-4 h-4 mr-2" />}
              {filter === "favorites" && <Star className="w-4 h-4 mr-2" />}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </nav>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground bg-card/50 p-3 rounded-lg border">
          <span className="font-medium">{storageInfo.clipsCount} clips</span>
          <span className="font-medium">~{Math.round(storageInfo.estimatedSize / 1024)}KB used</span>
          <span className="font-medium">Max {maxClips} clips</span>
        </div>

        {/* Clips Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Clipboard items">
          {filteredClips.map((clip) => (
            <Card
              key={clip.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border bg-card/80 backdrop-blur-sm hover:bg-card"
              onClick={() => {
                setSelectedClipId(clip.id);
                setShowDetailModal(true);
              }}
              role="article"
              aria-label={`Clipboard item: ${clip.title}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(clip.type)}
                    <CardTitle className="text-sm truncate">{clip.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {clip.pinned && <Pin className="w-4 h-4 text-primary" />}
                    {clip.favorite && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  <span title={new Date(clip.createdAt).toLocaleString()} className="font-medium">
                    {formatTimestamp(clip.createdAt)}
                  </span>
                  <span className="font-medium">{clip.length} chars</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="mb-3">
                  {clip.type === "image" ? (
                    <img
                      src={clip.content}
                      alt="Clipboard content"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {clip.type === "html" ? stripHtml(clip.content) : clip.content}
                    </p>
                  )}
                </div>

                {clip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {clip.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(clip);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateClip(clip.id, { favorite: !clip.favorite });
                    }}
                  >
                    <Star className={`w-4 h-4 ${clip.favorite ? "text-yellow-500" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateClip(clip.id, { pinned: !clip.pinned });
                    }}
                  >
                    <Pin className={`w-4 h-4 ${clip.pinned ? "text-primary" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteClip(clip.id);
                      toast.success("Clip deleted");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {filteredClips.length === 0 && (
          <div className="text-center py-12 bg-card/30 backdrop-blur-sm rounded-lg border border-border">
            <ClipboardCopy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-60" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No clips found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery ? "Try adjusting your search or filters" : "Start by capturing content from your clipboard"}
            </p>
            <Button onClick={captureFromClipboard} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <ClipboardCopy className="w-4 h-4 mr-2" />
              Capture from Clipboard
            </Button>
          </div>
        )}
      </div>

      {/* Add Clip Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Clip</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-1">
                {["text", "html", "image"].map((type) => (
                  <Button
                    key={type}
                    variant={newClip.type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewClip(prev => ({ ...prev, type: type as any }))}
                  >
                    {getTypeIcon(type)}
                    <span className="ml-2 capitalize">{type}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={newClip.title}
                onChange={(e) => setNewClip(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Auto-generated from content if empty"
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newClip.content}
                onChange={(e) => setNewClip(prev => ({ ...prev, content: e.target.value }))}
                placeholder={`Enter ${newClip.type} content...`}
                rows={8}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {newClip.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X
                      className="w-3 h-3 ml-1"
                      onClick={() => handleTagRemove(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleTagAdd(tagInput.trim());
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleTagAdd(tagInput.trim())}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClip}>Add Clip</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedClip && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedClip.type)}
                    {selectedClip.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedClip)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateClip(selectedClip.id, { favorite: !selectedClip.favorite });
                      }}
                    >
                      <Star className={`w-4 h-4 ${selectedClip.favorite ? "text-yellow-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateClip(selectedClip.id, { pinned: !selectedClip.pinned });
                      }}
                    >
                      <Pin className={`w-4 h-4 ${selectedClip.pinned ? "text-primary" : ""}`} />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(selectedClip.createdAt).toLocaleString()} • 
                  Updated: {new Date(selectedClip.updatedAt).toLocaleString()} • 
                  {selectedClip.length} characters
                </div>

                {selectedClip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedClip.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div>
                  {selectedClip.type === "image" ? (
                    <img
                      src={selectedClip.content}
                      alt="Clipboard content"
                      className="max-w-full h-auto rounded-md"
                    />
                  ) : selectedClip.type === "html" ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Preview</h4>
                        <div 
                          className="border rounded-md p-4 bg-card"
                          dangerouslySetInnerHTML={{ __html: selectedClip.content }}
                        />
                      </div>
                      {selectedClip.rawHtml && (
                        <div>
                          <h4 className="font-semibold mb-2">Raw HTML</h4>
                          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                            {selectedClip.rawHtml}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all bg-muted p-4 rounded-md">
                      {selectedClip.content}
                    </pre>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Clear All Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Clips</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your clipboard history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAllClips();
                setShowClearDialog(false);
                toast.success("All clips cleared");
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </main>
  );
};

export default ClipboardManager;
