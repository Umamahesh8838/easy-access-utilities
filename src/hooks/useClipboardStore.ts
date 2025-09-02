import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import DOMPurify from "isomorphic-dompurify";

export interface ClipboardItem {
  id: string;
  type: "text" | "html" | "image";
  title: string;
  content: string;
  rawHtml?: string;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  length: number;
}

export type FilterType = "all" | "text" | "html" | "image" | "pinned" | "favorites";
export type SortType = "newest" | "oldest" | "title";

interface ClipboardManagerState {
  clips: ClipboardItem[];
  searchQuery: string;
  activeFilter: FilterType;
  sortBy: SortType;
  selectedClipId: string | null;
  showDetailModal: boolean;
  isDarkMode: boolean;
  isHighContrast: boolean;
  maxClips: number;
  
  // Actions
  addClip: (clip: Omit<ClipboardItem, "id" | "createdAt" | "updatedAt" | "length">) => void;
  updateClip: (id: string, updates: Partial<ClipboardItem>) => void;
  deleteClip: (id: string) => void;
  clearAllClips: () => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  setSortBy: (sort: SortType) => void;
  setSelectedClipId: (id: string | null) => void;
  setShowDetailModal: (show: boolean) => void;
  setIsDarkMode: (dark: boolean) => void;
  setIsHighContrast: (contrast: boolean) => void;
  
  // Computed
  getFilteredClips: () => ClipboardItem[];
  getAllTags: () => string[];
  getClipById: (id: string) => ClipboardItem | undefined;
  
  // Cookie management
  exportData: () => string;
  importData: (data: string) => void;
  getStorageInfo: () => { clipsCount: number; estimatedSize: number; };
}

// Cookie helper functions
function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string {
  return document.cookie.split('; ').reduce((r, v) => {
    const [k, val] = v.split('=');
    return k === name ? decodeURIComponent(val || '') : r;
  }, '');
}

function saveChunks(base: string, data: string, days = 30) {
  // Clear old chunks
  const meta = JSON.parse(getCookie(`${base}_meta`) || '{"chunks":0}');
  for (let i = 0; i < (meta.chunks || 0); i++) {
    setCookie(`${base}_${i}`, '', -1);
  }
  
  // Write new chunks
  const size = 3500; // Conservative bytes per cookie
  const chunks = Math.ceil(data.length / size);
  for (let i = 0; i < chunks; i++) {
    setCookie(`${base}_${i}`, data.slice(i * size, (i + 1) * size), days);
  }
  setCookie(`${base}_meta`, JSON.stringify({ chunks, ver: 1 }), days);
}

function loadChunks(base: string): string {
  const meta = JSON.parse(getCookie(`${base}_meta`) || '{"chunks":0}');
  let out = '';
  for (let i = 0; i < (meta.chunks || 0); i++) {
    out += getCookie(`${base}_${i}`) || '';
  }
  return out;
}

// Generate unique ID
function generateId(): string {
  return `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sanitize HTML
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  });
}

// Strip HTML tags to get plain text
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

const useClipboardStore = create<ClipboardManagerState>()(
  persist(
    (set, get) => ({
      clips: [],
      searchQuery: "",
      activeFilter: "all",
      sortBy: "newest",
      selectedClipId: null,
      showDetailModal: false,
      isDarkMode: false,
      isHighContrast: false,
      maxClips: 50,

      addClip: (clipData) => {
        const now = Date.now();
        const clip: ClipboardItem = {
          ...clipData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          content: clipData.type === "html" ? sanitizeHtml(clipData.content) : clipData.content,
          rawHtml: clipData.type === "html" ? clipData.content : undefined,
          length: clipData.content.length,
        };

        set((state) => {
          let newClips = [clip, ...state.clips];
          
          // Enforce max clips limit
          if (newClips.length > state.maxClips) {
            newClips = newClips.slice(0, state.maxClips);
          }
          
          return { clips: newClips };
        });
      },

      updateClip: (id, updates) => {
        set((state) => ({
          clips: state.clips.map((clip) =>
            clip.id === id
              ? {
                  ...clip,
                  ...updates,
                  updatedAt: Date.now(),
                  content: updates.content && updates.type === "html" 
                    ? sanitizeHtml(updates.content) 
                    : updates.content || clip.content,
                  length: updates.content ? updates.content.length : clip.length,
                }
              : clip
          ),
        }));
      },

      deleteClip: (id) => {
        set((state) => ({
          clips: state.clips.filter((clip) => clip.id !== id),
        }));
      },

      clearAllClips: () => {
        set({ clips: [] });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSelectedClipId: (id) => set({ selectedClipId: id }),
      setShowDetailModal: (show) => set({ showDetailModal: show }),
      setIsDarkMode: (dark) => set({ isDarkMode: dark }),
      setIsHighContrast: (contrast) => set({ isHighContrast: contrast }),

      getFilteredClips: () => {
        const { clips, searchQuery, activeFilter, sortBy } = get();
        
        let filtered = clips.filter((clip) => {
          // Filter by type
          if (activeFilter === "pinned") return clip.pinned;
          if (activeFilter === "favorites") return clip.favorite;
          if (activeFilter !== "all" && clip.type !== activeFilter) return false;
          
          // Filter by search query
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const searchableContent = clip.type === "html" 
              ? stripHtml(clip.content).toLowerCase()
              : clip.content.toLowerCase();
            
            return (
              clip.title.toLowerCase().includes(query) ||
              searchableContent.includes(query) ||
              clip.tags.some(tag => tag.toLowerCase().includes(query))
            );
          }
          
          return true;
        });

        // Sort clips
        filtered.sort((a, b) => {
          // Pinned items always on top
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          
          switch (sortBy) {
            case "newest":
              return b.createdAt - a.createdAt;
            case "oldest":
              return a.createdAt - b.createdAt;
            case "title":
              return a.title.localeCompare(b.title);
            default:
              return b.createdAt - a.createdAt;
          }
        });

        return filtered;
      },

      getAllTags: () => {
        const { clips } = get();
        const tagSet = new Set<string>();
        clips.forEach((clip) => {
          clip.tags.forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
      },

      getClipById: (id) => {
        const { clips } = get();
        return clips.find((clip) => clip.id === id);
      },

      exportData: () => {
        const { clips } = get();
        return JSON.stringify({
          clips,
          exportedAt: Date.now(),
          version: "1.0",
        });
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.clips && Array.isArray(parsed.clips)) {
            set({ clips: parsed.clips });
          }
        } catch (error) {
          console.error("Failed to import data:", error);
        }
      },

      getStorageInfo: () => {
        const { clips } = get();
        const estimatedSize = JSON.stringify(clips).length;
        return {
          clipsCount: clips.length,
          estimatedSize,
        };
      },
    }),
    {
      name: "clipboard-manager-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          return loadChunks(name);
        },
        setItem: (name, value) => {
          saveChunks(name, value);
        },
        removeItem: (name) => {
          const meta = JSON.parse(getCookie(`${name}_meta`) || '{"chunks":0}');
          for (let i = 0; i < (meta.chunks || 0); i++) {
            setCookie(`${name}_${i}`, '', -1);
          }
          setCookie(`${name}_meta`, '', -1);
        },
      })),
    }
  )
);

export default useClipboardStore;
