/**
 * SEO utilities for dynamic page metadata
 */

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

export const updatePageSEO = (seoData: SEOData) => {
  // Update title
  document.title = seoData.title;
  
  // Update meta description
  updateMetaTag('description', seoData.description);
  
  // Update keywords if provided
  if (seoData.keywords) {
    updateMetaTag('keywords', seoData.keywords);
  }
  
  // Update canonical URL if provided
  if (seoData.canonical) {
    updateCanonical(seoData.canonical);
  }
  
  // Update Open Graph tags
  updateMetaProperty('og:title', seoData.title);
  updateMetaProperty('og:description', seoData.description);
  updateMetaProperty('og:url', seoData.canonical || window.location.href);
  
  // Update Twitter Card tags
  updateMetaProperty('twitter:title', seoData.title);
  updateMetaProperty('twitter:description', seoData.description);
};

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
};

const updateCanonical = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
};

// SEO data for each tool page
export const toolSEOData: Record<string, SEOData> = {
  'clipboard-manager': {
    title: 'Clipboard Manager - Manage Clipboard History | Easy Access Utilities',
    description: 'Advanced clipboard manager to store, organize, and manage your clipboard history. Capture text, images, and HTML with privacy-first local storage.',
    keywords: 'clipboard manager, clipboard history, copy paste tool, clipboard organizer',
    canonical: 'https://easy-access-utilities.vercel.app/tools/clipboard-manager'
  },
  'qr-generator': {
    title: 'QR Code Generator - Create Custom QR Codes | Easy Access Utilities',
    description: 'Generate custom QR codes instantly for URLs, text, WiFi, contact info, and more. Free QR code generator with customization options.',
    keywords: 'QR code generator, QR maker, create QR code, custom QR codes',
    canonical: 'https://easy-access-utilities.vercel.app/tools/qr-generator'
  },
  'png-to-jpg': {
    title: 'PNG to JPG Converter - Convert Images Online | Easy Access Utilities',
    description: 'Convert PNG images to JPG format instantly. Free online image converter with batch processing and quality control.',
    keywords: 'PNG to JPG converter, image converter, PNG JPG, convert images online',
    canonical: 'https://easy-access-utilities.vercel.app/tools/png-to-jpg'
  },
  'image-compressor': {
    title: 'Image Compressor - Reduce Image Size Online | Easy Access Utilities',
    description: 'Compress images online to reduce file size while maintaining quality. Support for JPG, PNG, WebP formats with customizable compression.',
    keywords: 'image compressor, compress images, reduce image size, optimize images',
    canonical: 'https://easy-access-utilities.vercel.app/tools/image-compressor'
  },
  'pdf-merge': {
    title: 'PDF Merger - Combine PDF Files Online | Easy Access Utilities',
    description: 'Merge multiple PDF files into one document. Free online PDF merger with drag-and-drop interface and secure processing.',
    keywords: 'PDF merger, combine PDF, merge PDF files, PDF tools',
    canonical: 'https://easy-access-utilities.vercel.app/tools/pdf-merge'
  },
  'json-formatter': {
    title: 'JSON Formatter - Format and Validate JSON | Easy Access Utilities',
    description: 'Format, validate, and beautify JSON data online. Free JSON formatter with syntax highlighting and error detection.',
    keywords: 'JSON formatter, JSON validator, format JSON, JSON beautifier',
    canonical: 'https://easy-access-utilities.vercel.app/tools/json-formatter'
  },
  'base64-encoder': {
    title: 'Base64 Encoder Decoder - Convert Text and Files | Easy Access Utilities',
    description: 'Encode and decode Base64 text and files online. Free Base64 converter with support for text, images, and documents.',
    keywords: 'Base64 encoder, Base64 decoder, encode decode Base64, Base64 converter',
    canonical: 'https://easy-access-utilities.vercel.app/tools/base64-encoder'
  },
  'color-picker': {
    title: 'Color Picker - Pick Colors and Get Codes | Easy Access Utilities',
    description: 'Advanced color picker tool to get HEX, RGB, HSL color codes. Color palette generator with accessibility features.',
    keywords: 'color picker, color palette, HEX RGB HSL, color codes, color tool',
    canonical: 'https://easy-access-utilities.vercel.app/tools/color-picker'
  },
  'text-formatter': {
    title: 'Text Formatter - Format and Transform Text | Easy Access Utilities',
    description: 'Format and transform text with various options: uppercase, lowercase, title case, remove duplicates, and more.',
    keywords: 'text formatter, text transformer, format text, text tools',
    canonical: 'https://easy-access-utilities.vercel.app/tools/text-formatter'
  },
  'pomodoro-timer': {
    title: 'Pomodoro Timer - Productivity Focus Timer | Easy Access Utilities',
    description: 'Boost productivity with our Pomodoro timer. Customizable work and break intervals with notifications and progress tracking.',
    keywords: 'Pomodoro timer, productivity timer, focus timer, work timer',
    canonical: 'https://easy-access-utilities.vercel.app/tools/pomodoro-timer'
  }
};

// Default SEO data for tools not specifically configured
export const getDefaultToolSEO = (toolName: string): SEOData => {
  const formattedName = toolName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${formattedName} - Free Online Tool | Easy Access Utilities`,
    description: `Use our free ${formattedName.toLowerCase()} tool online. No registration required, privacy-first design with secure local processing.`,
    keywords: `${toolName.replace(/-/g, ' ')}, online tool, free utility`,
    canonical: `https://easy-access-utilities.vercel.app/tools/${toolName}`
  };
};

// Breadcrumb structured data
export const addBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  const existingScript = document.getElementById('breadcrumb-structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  const script = document.createElement('script');
  script.id = 'breadcrumb-structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};
