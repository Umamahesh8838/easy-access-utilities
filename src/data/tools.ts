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
        iconName: "CheckCircle"
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
        id: "base64-encoder",
        title: "Base64 Encoder/Decoder",
        description: "Encode and decode text using Base64 encoding",
        iconName: "Binary",
        isPopular: true
      },
      {
        id: "md5-hash",
        title: "MD5 Hash Generator",
        description: "Generate MD5 hash from text or files",
        iconName: "Hash"
      },
      {
        id: "password-generator",
        title: "Password Generator",
        description: "Create strong, secure passwords with custom options",
        iconName: "Key",
        isNew: true
      },
      {
        id: "url-encoder",
        title: "URL Encoder/Decoder",
        description: "Encode and decode URLs for safe transmission",
        iconName: "Lock"
      }
    ]
  },
  {
    id: "web-dev-tools",
    title: "Web & Dev Tools",
    description: "Essential tools for web developers and programmers",
    iconName: "Code",
    tools: [
      {
        id: "css-minifier",
        title: "CSS Minifier",
        description: "Minify CSS code to reduce file size",
        iconName: "Archive"
      },
      {
        id: "json-formatter",
        title: "JSON Formatter",
        description: "Format and validate JSON data with syntax highlighting",
        iconName: "FileCheck",
        isPopular: true
      },
      {
        id: "regex-tester",
        title: "Regex Tester",
        description: "Test and debug regular expressions with live matching",
        iconName: "Target"
      },
      {
        id: "color-picker",
        title: "Color Picker",
        description: "Pick colors and get hex, RGB, and HSL values",
        iconName: "Palette"
      }
    ]
  },
  {
    id: "design-tools",
    title: "Design & Media",
    description: "Create gradients, check contrast, and design elements",
    iconName: "Palette",
    tools: [
      {
        id: "gradient-generator",
        title: "CSS Gradient Generator",
        description: "Create beautiful CSS gradients with live preview",
        iconName: "Palette",
        isPopular: true
      },
      {
        id: "contrast-checker",
        title: "Contrast Checker",
        description: "Check color contrast for accessibility compliance",
        iconName: "Eye"
      },
      {
        id: "icon-generator",
        title: "Favicon Generator",
        description: "Generate favicons in multiple sizes from images",
        iconName: "Sparkles"
      },
      {
        id: "svg-optimizer",
        title: "SVG Optimizer",
        description: "Optimize SVG files by removing unnecessary code",
        iconName: "Zap"
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
    title: "Productivity & Planning",
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
        id: "todo-list",
        title: "Simple Todo List",
        description: "Create and manage your daily tasks",
        iconName: "CheckCircle"
      },
      {
        id: "clipboard-manager",
        title: "Clipboard Manager",
        description: "Manage and organize your clipboard history",
        iconName: "Clipboard"
      }
    ]
  }
];