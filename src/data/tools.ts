
export interface Tool {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tools: Tool[];
}

export const toolCategories: Category[] = [
  {
    id: "image-tools",
    title: "Image Tools",
    description: "Convert, compress, and edit images with ease",
    iconName: "Image",
    tools: [
      {
        id: "png-to-jpg",
        title: "PNG to JPG Converter",
        description: "Convert PNG images to JPG format quickly and easily",
        iconName: "Scissors",
        isPopular: true
      },
      {
        id: "image-compressor",
        title: "Image Compressor",
        description: "Reduce image file size while maintaining quality",
        iconName: "Archive",
        isPopular: true
      },
      {
        id: "image-cropper",
        title: "Image Cropper",
        description: "Crop and resize images to your desired dimensions",
        iconName: "Crop"
      },
      {
        id: "image-rotator",
        title: "Image Rotator",
        description: "Rotate images by any angle with precision",
        iconName: "RotateCw"
      },
      {
        id: "image-filters",
        title: "Image Filters",
        description: "Apply various filters and effects to your images",
        iconName: "Sparkles"
      },
      {
        id: "image-resizer",
        title: "Image Resizer",
        description: "Resize images to specific dimensions or percentages",
        iconName: "Maximize2"
      },
      {
        id: "image-average-color",
        title: "Image Average Color Finder",
        description: "Find the average color of any image",
        iconName: "Palette"
      },
      {
        id: "image-color-extractor",
        title: "Image Color Extractor",
        description: "Extract dominant colors from images",
        iconName: "Eyedropper"
      },
      {
        id: "image-color-picker",
        title: "Image Color Picker",
        description: "Pick colors from any point in an image",
        iconName: "Target"
      },
      {
        id: "photo-censor",
        title: "Photo Censor",
        description: "Blur or censor parts of your photos",
        iconName: "EyeOff"
      },
      {
        id: "svg-to-png",
        title: "SVG to PNG Converter",
        description: "Convert SVG files to PNG format",
        iconName: "Download"
      },
      {
        id: "svg-stroke-to-fill",
        title: "SVG Stroke to Fill Converter",
        description: "Convert SVG strokes to fills",
        iconName: "PenTool"
      },
      {
        id: "image-to-base64",
        title: "Image to Base64 Converter",
        description: "Convert images to Base64 encoded strings",
        iconName: "Binary"
      },
      {
        id: "image-caption-generator",
        title: "Image Caption Generator",
        description: "Generate captions for your images using AI",
        iconName: "MessageSquare",
        isNew: true
      },
      {
        id: "scanned-pdf-converter",
        title: "Scanned PDF Converter",
        description: "Convert scanned PDFs to searchable text",
        iconName: "FileText"
      }
    ]
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, and manipulate PDF documents",
    iconName: "FileText",
    tools: [
      {
        id: "merge-pdf",
        title: "Merge PDF",
        description: "Combine multiple PDF files into a single document",
        iconName: "Layers",
        isPopular: true
      },
      {
        id: "split-pdf",
        title: "Split PDF",
        description: "Extract pages or split PDF into multiple files",
        iconName: "Scissors"
      },
      {
        id: "pdf-to-jpg",
        title: "PDF to JPG",
        description: "Convert PDF pages to high-quality JPG images",
        iconName: "Download"
      },
      {
        id: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce PDF file size without losing quality",
        iconName: "Archive"
      }
    ]
  },
  {
    id: "text-tools",
    title: "Text & Lists",
    description: "Format, convert, and analyze text content",
    iconName: "Type",
    tools: [
      {
        id: "character-counter",
        title: "Character Counter",
        description: "Count characters, words, and lines in your text",
        iconName: "Target",
        isPopular: true
      },
      {
        id: "case-converter",
        title: "Case Converter",
        description: "Convert text between different cases (upper, lower, title)",
        iconName: "Type"
      },
      {
        id: "text-formatter",
        title: "Text Formatter",
        description: "Format and beautify text with various options",
        iconName: "Sparkles"
      },
      {
        id: "duplicate-remover",
        title: "Duplicate Line Remover",
        description: "Remove duplicate lines from text lists",
        iconName: "CheckCircle2"
      },
      {
        id: "lorem-ipsum-generator",
        title: "Lorem Ipsum Generator",
        description: "Generate placeholder text for your designs",
        iconName: "FileText"
      },
      {
        id: "letter-counter",
        title: "Letter Counter",
        description: "Count specific letters and characters in text",
        iconName: "Hash"
      },
      {
        id: "text-to-handwriting",
        title: "Text to Handwriting Converter",
        description: "Convert typed text to handwriting style",
        iconName: "PenTool",
        isNew: true
      },
      {
        id: "bionic-reading",
        title: "Bionic Reading Converter",
        description: "Convert text to bionic reading format for faster reading",
        iconName: "Zap",
        isNew: true
      },
      {
        id: "whitespace-remover",
        title: "Multiple Whitespace Remover",
        description: "Remove extra whitespaces from text",
        iconName: "Minimize2"
      },
      {
        id: "list-randomizer",
        title: "List Randomizer",
        description: "Randomize the order of items in a list",
        iconName: "Shuffle"
      }
    ]
  },
  {
    id: "css-tools",
    title: "CSS Tools",
    description: "Generate CSS code and effects with ease",
    iconName: "Palette",
    tools: [
      {
        id: "css-gradient-generator",
        title: "CSS Gradient Generator",
        description: "Create beautiful CSS gradients with live preview",
        iconName: "Palette",
        isPopular: true
      },
      {
        id: "css-loader-generator",
        title: "CSS Loader Generator",
        description: "Create animated CSS loading spinners",
        iconName: "Loader"
      },
      {
        id: "css-checkbox-generator",
        title: "CSS Checkbox Generator",
        description: "Generate custom styled CSS checkboxes",
        iconName: "CheckSquare"
      },
      {
        id: "css-switch-generator",
        title: "CSS Switch Generator",
        description: "Create toggle switches with pure CSS",
        iconName: "ToggleLeft"
      },
      {
        id: "css-clip-path-generator",
        title: "CSS Clip Path Generator",
        description: "Generate CSS clip-path values visually",
        iconName: "Scissors"
      },
      {
        id: "css-background-pattern",
        title: "CSS Background Pattern Generator",
        description: "Create repeating CSS background patterns",
        iconName: "Grid3x3"
      },
      {
        id: "css-cubic-bezier",
        title: "CSS Cubic Bezier Generator",
        description: "Create custom easing functions for animations",
        iconName: "TrendingUp"
      },
      {
        id: "css-glassmorphism",
        title: "CSS Glassmorphism Generator",
        description: "Generate glassmorphism effects with CSS",
        iconName: "Square",
        isPopular: true
      },
      {
        id: "css-text-glitch",
        title: "CSS Text Glitch Effect Generator",
        description: "Create glitch text effects with CSS",
        iconName: "Zap"
      },
      {
        id: "css-triangle-generator",
        title: "CSS Triangle Generator",
        description: "Generate triangles using pure CSS",
        iconName: "Triangle"
      },
      {
        id: "css-box-shadow",
        title: "CSS Box Shadow Generator",
        description: "Create and customize CSS box shadows",
        iconName: "Square"
      },
      {
        id: "css-border-radius",
        title: "CSS Border Radius Generator",
        description: "Generate custom border radius values",
        iconName: "CornerUpRight"
      },
      {
        id: "css-minifier",
        title: "CSS Minifier",
        description: "Minify CSS code to reduce file size",
        iconName: "Archive"
      },
      {
        id: "css-formatter",
        title: "CSS Formatter",
        description: "Format and beautify CSS code",
        iconName: "Code"
      }
    ]
  },
  {
    id: "coding-tools",
    title: "Coding & Development",
    description: "Essential tools for developers and programmers",
    iconName: "Code",
    tools: [
      {
        id: "base64-encoder",
        title: "Base64 Encoder/Decoder",
        description: "Encode and decode text using Base64 encoding",
        iconName: "Binary",
        isPopular: true
      },
      {
        id: "url-encoder",
        title: "URL Encoder/Decoder",
        description: "Encode and decode URLs for safe transmission",
        iconName: "Lock"
      },
      {
        id: "html-encoder",
        title: "HTML Encoder/Decoder",
        description: "Encode and decode HTML entities",
        iconName: "Code"
      },
      {
        id: "json-formatter",
        title: "JSON Formatter",
        description: "Format and validate JSON data with syntax highlighting",
        iconName: "FileCheck2",
        isPopular: true
      },
      {
        id: "json-tree-viewer",
        title: "JSON Tree Viewer",
        description: "View JSON data in an interactive tree format",
        iconName: "TreePine"
      },
      {
        id: "regex-tester",
        title: "Regex Tester",
        description: "Test and debug regular expressions with live matching",
        iconName: "Target"
      },
      {
        id: "code-to-image",
        title: "Code to Image Converter",
        description: "Convert code snippets to beautiful images",
        iconName: "Image"
      },
      {
        id: "url-slug-generator",
        title: "URL Slug Generator",
        description: "Generate SEO-friendly URL slugs from text",
        iconName: "Link"
      },
      {
        id: "react-native-shadow",
        title: "React Native Shadow Generator",
        description: "Generate shadow styles for React Native",
        iconName: "Smartphone"
      },
      {
        id: "html-minifier",
        title: "HTML Minifier",
        description: "Minify HTML code to reduce file size",
        iconName: "Archive"
      },
      {
        id: "js-minifier",
        title: "JavaScript Minifier",
        description: "Minify JavaScript code for production",
        iconName: "Archive"
      },
      {
        id: "html-formatter",
        title: "HTML Formatter",
        description: "Format and beautify HTML code",
        iconName: "Code"
      },
      {
        id: "js-formatter",
        title: "JavaScript Formatter",
        description: "Format and beautify JavaScript code",
        iconName: "Code"
      },
      {
        id: "jwt-encoder",
        title: "JWT Encoder/Decoder",
        description: "Encode and decode JSON Web Tokens",
        iconName: "Key"
      }
    ]
  },
  {
    id: "encryption-tools",
    title: "Encryption & Hashing",
    description: "Secure your data with encryption and hashing tools",
    iconName: "Shield",
    tools: [
      {
        id: "md5-hash",
        title: "MD5 Hash Generator",
        description: "Generate MD5 hash from text or files",
        iconName: "Hash"
      },
      {
        id: "md5-encrypt-decrypt",
        title: "MD5 Encrypt/Decrypt",
        description: "MD5 encryption and decryption tool",
        iconName: "Lock"
      },
      {
        id: "sha1-encrypt-decrypt",
        title: "SHA1 Encrypt/Decrypt",
        description: "SHA1 encryption and decryption tool",
        iconName: "Shield"
      },
      {
        id: "sha224-encrypt-decrypt",
        title: "SHA224 Encrypt/Decrypt",
        description: "SHA224 encryption and decryption tool",
        iconName: "Shield"
      },
      {
        id: "sha256-encrypt-decrypt",
        title: "SHA256 Encrypt/Decrypt",
        description: "SHA256 encryption and decryption tool",
        iconName: "Shield"
      },
      {
        id: "sha384-encrypt-decrypt",
        title: "SHA384 Encrypt/Decrypt",
        description: "SHA384 encryption and decryption tool",
        iconName: "Shield"
      },
      {
        id: "sha512-encrypt-decrypt",
        title: "SHA512 Encrypt/Decrypt",
        description: "SHA512 encryption and decryption tool",
        iconName: "Shield"
      },
      {
        id: "password-generator",
        title: "Strong Random Password Generator",
        description: "Create strong, secure passwords with custom options",
        iconName: "Key",
        isPopular: true
      }
    ]
  },
  {
    id: "color-tools",
    title: "Color Tools",
    description: "Work with colors, palettes, and conversions",
    iconName: "Palette",
    tools: [
      {
        id: "color-picker",
        title: "Color Picker",
        description: "Pick colors and get hex, RGB, and HSL values",
        iconName: "Palette"
      },
      {
        id: "contrast-checker",
        title: "Contrast Checker",
        description: "Check color contrast for accessibility compliance",
        iconName: "Eye"
      },
      {
        id: "ai-color-palette",
        title: "AI Color Palette Generator",
        description: "Generate color palettes using AI",
        iconName: "Sparkles",
        isNew: true
      },
      {
        id: "hex-to-rgba",
        title: "HEX to RGBA Converter",
        description: "Convert HEX colors to RGBA format",
        iconName: "RefreshCw"
      },
      {
        id: "rgba-to-hex",
        title: "RGBA to HEX Converter",
        description: "Convert RGBA colors to HEX format",
        iconName: "RefreshCw"
      },
      {
        id: "color-shades",
        title: "Color Shades Generator",
        description: "Generate different shades of a color",
        iconName: "Palette"
      },
      {
        id: "color-mixer",
        title: "Color Mixer",
        description: "Mix two colors to create new ones",
        iconName: "Blend"
      }
    ]
  },
  {
    id: "svg-tools",
    title: "SVG & Design Tools",
    description: "Create and optimize SVG graphics",
    iconName: "PenTool",
    tools: [
      {
        id: "svg-blob-generator",
        title: "SVG Blob Generator",
        description: "Generate organic blob shapes in SVG format",
        iconName: "Circle"
      },
      {
        id: "svg-pattern-generator",
        title: "SVG Pattern Generator",
        description: "Create repeating SVG patterns",
        iconName: "Grid3x3"
      },
      {
        id: "svg-optimizer",
        title: "SVG Optimizer",
        description: "Optimize SVG files by removing unnecessary code",
        iconName: "Zap"
      },
      {
        id: "icon-generator",
        title: "Favicon Generator",
        description: "Generate favicons in multiple sizes from images",
        iconName: "Sparkles"
      }
    ]
  },
  {
    id: "social-media-tools",
    title: "Social Media Tools",
    description: "Tools for social media content creation",
    iconName: "Share2",
    tools: [
      {
        id: "instagram-filters",
        title: "Instagram Filters",
        description: "Apply Instagram-style filters to photos",
        iconName: "Camera"
      },
      {
        id: "instagram-post-generator",
        title: "Instagram Post Generator",
        description: "Create Instagram post templates",
        iconName: "Square"
      },
      {
        id: "instagram-photo-downloader",
        title: "Instagram Photo Downloader",
        description: "Download photos from Instagram",
        iconName: "Download"
      },
      {
        id: "tweet-generator",
        title: "Tweet Generator",
        description: "Generate tweet content and ideas",
        iconName: "Twitter"
      },
      {
        id: "tweet-to-image",
        title: "Tweet to Image Converter",
        description: "Convert tweets to shareable images",
        iconName: "Image"
      },
      {
        id: "twitter-ad-revenue",
        title: "Twitter Ad Revenue Generator",
        description: "Calculate potential Twitter ad revenue",
        iconName: "DollarSign"
      },
      {
        id: "youtube-thumbnail-grabber",
        title: "YouTube Thumbnail Grabber",
        description: "Extract thumbnails from YouTube videos",
        iconName: "Youtube"
      },
      {
        id: "vimeo-thumbnail-grabber",
        title: "Vimeo Thumbnail Grabber",
        description: "Extract thumbnails from Vimeo videos",
        iconName: "Video"
      },
      {
        id: "open-graph-meta",
        title: "Open Graph Meta Generator",
        description: "Generate Open Graph meta tags for social sharing",
        iconName: "Share2"
      }
    ]
  },
  {
    id: "calculators",
    title: "Calculators",
    description: "Various calculators for everyday use",
    iconName: "Calculator",
    tools: [
      {
        id: "bmi-calculator",
        title: "BMI Calculator",
        description: "Calculate your Body Mass Index and health status",
        iconName: "Calculator",
        isPopular: true
      },
      {
        id: "loan-calculator",
        title: "Loan EMI Calculator",
        description: "Calculate loan EMI, interest, and total payment",
        iconName: "Calculator"
      },
      {
        id: "percentage-calculator",
        title: "Percentage Calculator",
        description: "Calculate percentages, increase, and decrease",
        iconName: "Target"
      },
      {
        id: "age-calculator",
        title: "Age Calculator",
        description: "Calculate age in years, months, and days",
        iconName: "Calendar"
      }
    ]
  },
  {
    id: "productivity-tools",
    title: "Productivity & Utilities",
    description: "Tools to boost your productivity and organization",
    iconName: "Calendar",
    tools: [
      {
        id: "pomodoro-timer",
        title: "Pomodoro Timer",
        description: "Focus timer based on the Pomodoro Technique",
        iconName: "Timer",
        isNew: true
      },
      {
        id: "qr-generator",
        title: "QR Code Generator",
        description: "Generate QR codes for text, URLs, and more",
        iconName: "QrCode",
        isPopular: true
      },
      {
        id: "barcode-generator",
        title: "Barcode Generator",
        description: "Generate various types of barcodes",
        iconName: "BarChart3"
      },
      {
        id: "todo-list",
        title: "Simple Todo List",
        description: "Create and manage your daily tasks",
        iconName: "CheckCircle2"
      },
      {
        id: "clipboard-manager",
        title: "Clipboard Manager",
        description: "Manage and organize your clipboard history",
        iconName: "Clipboard"
      },
      {
        id: "fake-iban-generator",
        title: "Fake IBAN Generator",
        description: "Generate fake IBAN numbers for testing",
        iconName: "CreditCard"
      }
    ]
  },
  {
    id: "font-tools",
    title: "Font & Typography",
    description: "Tools for working with fonts and typography",
    iconName: "Type",
    tools: [
      {
        id: "google-fonts-pair-finder",
        title: "Google Fonts Pair Finder",
        description: "Find perfect Google Font combinations",
        iconName: "Type"
      }
    ]
  }
];
