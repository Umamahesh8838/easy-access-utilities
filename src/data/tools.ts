import { 
  Image, 
  FileText, 
  Type, 
  Shield, 
  Code, 
  Palette, 
  Calendar,
  Calculator,
  QrCode,
  Scissors,
  Archive,
  FileCheck,
  Hash,
  Lock,
  Eye,
  Zap,
  Crop,
  Download,
  Upload,
  RotateCw,
  Layers,
  Binary,
  Key,
  CheckCircle,
  Target,
  Ruler,
  Sparkles,
  Timer,
  Clipboard
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: Tool[];
}

export const toolCategories: Category[] = [
  {
    id: "image-tools",
    title: "Image Tools",
    description: "Convert, compress, and edit images with ease",
    icon: Image,
    tools: [
      {
        id: "png-to-jpg",
        title: "PNG to JPG Converter",
        description: "Convert PNG images to JPG format quickly and easily",
        icon: Scissors,
        isPopular: true
      },
      {
        id: "image-compressor",
        title: "Image Compressor",
        description: "Reduce image file size while maintaining quality",
        icon: Archive,
        isPopular: true
      },
      {
        id: "image-cropper",
        title: "Image Cropper",
        description: "Crop and resize images to your desired dimensions",
        icon: Crop
      },
      {
        id: "image-rotator",
        title: "Image Rotator",
        description: "Rotate images by any angle with precision",
        icon: RotateCw
      }
    ]
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    description: "Merge, split, and manipulate PDF documents",
    icon: FileText,
    tools: [
      {
        id: "merge-pdf",
        title: "Merge PDF",
        description: "Combine multiple PDF files into a single document",
        icon: Layers,
        isPopular: true
      },
      {
        id: "split-pdf",
        title: "Split PDF",
        description: "Extract pages or split PDF into multiple files",
        icon: Scissors
      },
      {
        id: "pdf-to-jpg",
        title: "PDF to JPG",
        description: "Convert PDF pages to high-quality JPG images",
        icon: Download
      },
      {
        id: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce PDF file size without losing quality",
        icon: Archive
      }
    ]
  },
  {
    id: "text-tools",
    title: "Text & Lists",
    description: "Format, convert, and analyze text content",
    icon: Type,
    tools: [
      {
        id: "character-counter",
        title: "Character Counter",
        description: "Count characters, words, and lines in your text",
        icon: Target,
        isPopular: true
      },
      {
        id: "case-converter",
        title: "Case Converter",
        description: "Convert text between different cases (upper, lower, title)",
        icon: Type
      },
      {
        id: "text-formatter",
        title: "Text Formatter",
        description: "Format and beautify text with various options",
        icon: Sparkles
      },
      {
        id: "duplicate-remover",
        title: "Duplicate Line Remover",
        description: "Remove duplicate lines from text lists",
        icon: CheckCircle
      }
    ]
  },
  {
    id: "encryption-tools",
    title: "Encryption & Hashing",
    description: "Secure your data with encryption and hashing tools",
    icon: Shield,
    tools: [
      {
        id: "base64-encoder",
        title: "Base64 Encoder/Decoder",
        description: "Encode and decode text using Base64 encoding",
        icon: Binary,
        isPopular: true
      },
      {
        id: "md5-hash",
        title: "MD5 Hash Generator",
        description: "Generate MD5 hash from text or files",
        icon: Hash
      },
      {
        id: "password-generator",
        title: "Password Generator",
        description: "Create strong, secure passwords with custom options",
        icon: Key,
        isNew: true
      },
      {
        id: "url-encoder",
        title: "URL Encoder/Decoder",
        description: "Encode and decode URLs for safe transmission",
        icon: Lock
      }
    ]
  },
  {
    id: "web-dev-tools",
    title: "Web & Dev Tools",
    description: "Essential tools for web developers and programmers",
    icon: Code,
    tools: [
      {
        id: "css-minifier",
        title: "CSS Minifier",
        description: "Minify CSS code to reduce file size",
        icon: Archive
      },
      {
        id: "json-formatter",
        title: "JSON Formatter",
        description: "Format and validate JSON data with syntax highlighting",
        icon: FileCheck,
        isPopular: true
      },
      {
        id: "regex-tester",
        title: "Regex Tester",
        description: "Test and debug regular expressions with live matching",
        icon: Target
      },
      {
        id: "color-picker",
        title: "Color Picker",
        description: "Pick colors and get hex, RGB, and HSL values",
        icon: Palette
      }
    ]
  },
  {
    id: "design-tools",
    title: "Design & Media",
    description: "Create gradients, check contrast, and design elements",
    icon: Palette,
    tools: [
      {
        id: "gradient-generator",
        title: "CSS Gradient Generator",
        description: "Create beautiful CSS gradients with live preview",
        icon: Palette,
        isPopular: true
      },
      {
        id: "contrast-checker",
        title: "Contrast Checker",
        description: "Check color contrast for accessibility compliance",
        icon: Eye
      },
      {
        id: "icon-generator",
        title: "Favicon Generator",
        description: "Generate favicons in multiple sizes from images",
        icon: Sparkles
      },
      {
        id: "svg-optimizer",
        title: "SVG Optimizer",
        description: "Optimize SVG files by removing unnecessary code",
        icon: Zap
      }
    ]
  },
  {
    id: "calculators",
    title: "Calculators",
    description: "Various calculators for everyday use",
    icon: Calculator,
    tools: [
      {
        id: "bmi-calculator",
        title: "BMI Calculator",
        description: "Calculate your Body Mass Index and health status",
        icon: Calculator,
        isPopular: true
      },
      {
        id: "loan-calculator",
        title: "Loan EMI Calculator",
        description: "Calculate loan EMI, interest, and total payment",
        icon: Calculator
      },
      {
        id: "percentage-calculator",
        title: "Percentage Calculator",
        description: "Calculate percentages, increase, and decrease",
        icon: Target
      },
      {
        id: "age-calculator",
        title: "Age Calculator",
        description: "Calculate age in years, months, and days",
        icon: Calendar
      }
    ]
  },
  {
    id: "productivity-tools",
    title: "Productivity & Planning",
    description: "Tools to boost your productivity and organization",
    icon: Calendar,
    tools: [
      {
        id: "pomodoro-timer",
        title: "Pomodoro Timer",
        description: "Focus timer based on the Pomodoro Technique",
        icon: Timer,
        isNew: true
      },
      {
        id: "qr-generator",
        title: "QR Code Generator",
        description: "Generate QR codes for text, URLs, and more",
        icon: QrCode,
        isPopular: true
      },
      {
        id: "todo-list",
        title: "Simple Todo List",
        description: "Create and manage your daily tasks",
        icon: CheckCircle
      },
      {
        id: "clipboard-manager",
        title: "Clipboard Manager",
        description: "Manage and organize your clipboard history",
        icon: Clipboard
      }
    ]
  }
];