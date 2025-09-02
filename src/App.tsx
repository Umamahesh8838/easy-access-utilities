import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Navbar } from "@/components/ui/mini-navbar";
import { ToolPageSkeleton } from "@/components/ui/loading";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import lazy components
import {
  LazyPomodoroTimer,
  LazyInstagramPostEditor,
  LazyInstagramPostGenerator,
  LazyInstagramPhotoDownloader,
  LazyQrGenerator,
  LazyBarcodeGenerator,
  LazyMd5HashGenerator,
  LazyStrongPasswordGenerator,
  LazyShaEncryptDecrypt,
  LazyMd5EncryptDecrypt,
  LazyPngToJpg,
  LazyImageCompressor,
  LazyImageCropper,
  LazyImageRotator,
  LazyImageFilters,
  LazyImageResizer,
  LazyImageAverageColor,
  LazyImageColorExtractor,
  LazyImageColorPicker,
  LazyPhotoCensor,
  LazySvgToPng,
  LazySvgStrokeToFill,
  LazySvgBlobGenerator,
  LazySvgPatternGenerator,
  LazySvgOptimizer,
  LazyFaviconGenerator,
  LazyInstagramFilters,
  LazyImageToBase64,
  LazyImageCaptionGenerator,
  LazyScannedPdfConverter,
  LazyPdfMerge,
  LazyPdfSplit,
  LazyPdfToJpg,
  LazyPdfCompress,
  LazyCharacterCounter,
  LazyCaseConverter,
  LazyTextFormatter,
  LazyDuplicateLineRemover,
  LazyLoremIpsumGenerator,
  LazyLetterCounter,
  LazyTextToHandwriting,
  LazyBionicReadingConverter,
  LazyMultipleWhitespaceRemover,
  LazyListRandomizer,
  LazyBase64Encoder,
  LazyUrlEncoder,
  LazyHtmlEncoder,
  LazyJsonFormatter,
  LazyJsonTreeViewer,
  LazyRegexTester,
  LazyCodeToImage,
  LazyUrlSlugGenerator,
  LazyReactNativeShadowGenerator,
  LazyHtmlMinifier,
  LazyJavaScriptMinifier,
  LazyHtmlFormatter,
  LazyJavaScriptFormatter,
  LazyJwtEncoder,
  LazyColorPicker,
  LazyContrastChecker,
  LazyAiColorPaletteGenerator,
  LazyHexToRgbaConverter,
  LazyRgbaToHexConverter,
  LazyColorShadesGenerator,
  LazyColorMixer,
  LazyBmiCalculator,
  LazyLoanEmiCalculator,
  LazyPercentageCalculator,
  LazyAgeCalculator,
  LazyTodoList,
  LazyClipboardManager,
  LazyFakeIbanGenerator
} from "@/components/LazyComponents";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<ToolPageSkeleton />}>
            <Routes>
            <Route path="/tools/instagram-post-editor" element={<LazyInstagramPostEditor />} />
            <Route path="/tools/pomodoro-timer" element={<LazyPomodoroTimer />} />
            <Route path="/tools/qr-generator" element={<LazyQrGenerator />} />
            <Route path="/qr" element={<LazyQrGenerator />} />  {/* Alias route for easier access */}
            <Route path="/tools/barcode-generator" element={<LazyBarcodeGenerator />} />
            <Route path="/tools/instagram-post-generator" element={<LazyInstagramPostGenerator />} />
            <Route path="/tools/instagram-photo-downloader" element={<LazyInstagramPhotoDownloader />} />
            <Route path="/" element={<Index />} />
            
            {/* Image Tools */}
            <Route path="/tools/png-to-jpg" element={<LazyPngToJpg />} />
            <Route path="/tools/image-compressor" element={<LazyImageCompressor />} />
            <Route path="/tools/image-cropper" element={<LazyImageCropper />} />
            <Route path="/tools/image-rotator" element={<LazyImageRotator />} />
            <Route path="/tools/image-filters" element={<LazyImageFilters />} />
            <Route path="/tools/image-resizer" element={<LazyImageResizer />} />
            <Route path="/tools/image-average-color" element={<LazyImageAverageColor />} />
            <Route path="/tools/image-color-extractor" element={<LazyImageColorExtractor />} />
            <Route path="/tools/image-color-picker" element={<LazyImageColorPicker />} />
            <Route path="/tools/photo-censor" element={<LazyPhotoCensor />} />
            <Route path="/tools/svg-to-png" element={<LazySvgToPng />} />
            <Route path="/tools/svg-stroke-to-fill" element={<LazySvgStrokeToFill />} />
            <Route path="/tools/svg-blob-generator" element={<LazySvgBlobGenerator />} />
            <Route path="/tools/svg-pattern-generator" element={<LazySvgPatternGenerator />} />
            <Route path="/tools/svg-optimizer" element={<LazySvgOptimizer />} />
            <Route path="/tools/favicon-generator" element={<LazyFaviconGenerator />} />
            <Route path="/tools/instagram-filters" element={<LazyInstagramFilters />} />
            <Route path="/tools/image-to-base64" element={<LazyImageToBase64 />} />
            <Route path="/tools/image-caption-generator" element={<LazyImageCaptionGenerator />} />
            <Route path="/tools/scanned-pdf-converter" element={<LazyScannedPdfConverter />} />
            
            {/* PDF Tools */}
            <Route path="/tools/pdf-merge" element={<LazyPdfMerge />} />
            <Route path="/tools/pdf-split" element={<LazyPdfSplit />} />
            <Route path="/tools/pdf-to-jpg" element={<LazyPdfToJpg />} />
            <Route path="/tools/compress-pdf" element={<LazyPdfCompress />} />
            
            {/* Text Tools */}
            <Route path="/tools/character-counter" element={<LazyCharacterCounter />} />
            <Route path="/tools/case-converter" element={<LazyCaseConverter />} />
            <Route path="/tools/text-formatter" element={<LazyTextFormatter />} />
            <Route path="/tools/duplicate-remover" element={<LazyDuplicateLineRemover />} />
            <Route path="/tools/lorem-ipsum-generator" element={<LazyLoremIpsumGenerator />} />
            <Route path="/tools/letter-counter" element={<LazyLetterCounter />} />
            <Route path="/tools/text-to-handwriting" element={<LazyTextToHandwriting />} />
            <Route path="/tools/bionic-reading" element={<LazyBionicReadingConverter />} />
            <Route path="/tools/whitespace-remover" element={<LazyMultipleWhitespaceRemover />} />
            <Route path="/tools/list-randomizer" element={<LazyListRandomizer />} />
            
            {/* Coding Tools */}
            <Route path="/tools/base64-encoder" element={<LazyBase64Encoder />} />
            <Route path="/tools/url-encoder" element={<LazyUrlEncoder />} />
            <Route path="/tools/html-encoder" element={<LazyHtmlEncoder />} />
            <Route path="/tools/json-formatter" element={<LazyJsonFormatter />} />
            <Route path="/tools/json-tree-viewer" element={<LazyJsonTreeViewer />} />
            <Route path="/tools/regex-tester" element={<LazyRegexTester />} />
            <Route path="/tools/code-to-image" element={<LazyCodeToImage />} />
            <Route path="/tools/url-slug-generator" element={<LazyUrlSlugGenerator />} />
            <Route path="/tools/react-native-shadow" element={<LazyReactNativeShadowGenerator />} />
            <Route path="/tools/html-minifier" element={<LazyHtmlMinifier />} />
            <Route path="/tools/js-minifier" element={<LazyJavaScriptMinifier />} />
            <Route path="/tools/html-formatter" element={<LazyHtmlFormatter />} />
            <Route path="/tools/js-formatter" element={<LazyJavaScriptFormatter />} />
            <Route path="/tools/jwt-encoder" element={<LazyJwtEncoder />} />
            
            {/* Color Tools */}
            <Route path="/tools/color-picker" element={<LazyColorPicker />} />
            <Route path="/tools/contrast-checker" element={<LazyContrastChecker />} />
            <Route path="/tools/ai-color-palette-generator" element={<LazyAiColorPaletteGenerator />} />
            <Route path="/tools/hex-to-rgba-converter" element={<LazyHexToRgbaConverter />} />
            <Route path="/tools/rgba-to-hex-converter" element={<LazyRgbaToHexConverter />} />
            <Route path="/tools/color-shades-generator" element={<LazyColorShadesGenerator />} />
            <Route path="/tools/color-mixer" element={<LazyColorMixer />} />
            
            {/* Encryption Tools */}
            <Route path="/tools/md5-hash-generator" element={<LazyMd5HashGenerator />} />
            <Route path="/tools/strong-password-generator" element={<LazyStrongPasswordGenerator />} />
            <Route path="/tools/md5-encrypt-decrypt" element={<LazyMd5EncryptDecrypt />} />
            <Route path="/tools/sha-encrypt-decrypt" element={<LazyShaEncryptDecrypt />} />
            
            {/* Calculator Tools */}
            <Route path="/tools/bmi-calculator" element={<LazyBmiCalculator />} />
            <Route path="/tools/loan-emi-calculator" element={<LazyLoanEmiCalculator />} />
            <Route path="/tools/percentage-calculator" element={<LazyPercentageCalculator />} />
            <Route path="/tools/age-calculator" element={<LazyAgeCalculator />} />
            
            {/* Productivity Tools */}
            <Route path="/tools/todo-list" element={<LazyTodoList />} />
            <Route path="/tools/clipboard-manager" element={<LazyClipboardManager />} />
            <Route path="/tools/fake-iban-generator" element={<LazyFakeIbanGenerator />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
