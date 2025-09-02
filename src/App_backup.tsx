import PomodoroTimer from "./pages/PomodoroTimer";
import InstagramPostEditor from "./pages/InstagramPostEditor";
import InstagramPostGenerator from "./pages/InstagramPostGenerator";
import InstagramPhotoDownloader from "./pages/InstagramPhotoDownloader";
import QrGenerator from "./pages/QrGenerator";
import BarcodeGenerator from "./pages/BarcodeGenerator";
import Md5HashGenerator from "./pages/Md5HashGenerator";
import StrongPasswordGenerator from "./pages/StrongPasswordGenerator";
import ShaEncryptDecrypt from "./pages/ShaEncryptDecrypt";
import Md5EncryptDecrypt from "./pages/Md5EncryptDecrypt";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PngToJpg from "./pages/PngToJpg";
import ImageCompressor from "./pages/ImageCompressor";
import ImageCropper from "./pages/ImageCropper";
import ImageRotator from "./pages/ImageRotator";
import ImageFilters from "./pages/ImageFilters";
import ImageResizer from "./pages/ImageResizer";
import ImageAverageColor from "./pages/ImageAverageColor";
import ImageColorExtractor from "./pages/ImageColorExtractor";
import ImageColorPicker from "./pages/ImageColorPicker";
import PhotoCensor from "./pages/PhotoCensor";
import SvgToPng from "./pages/SvgToPng";
import SvgStrokeToFill from "./pages/SvgStrokeToFill";
import SvgBlobGenerator from "./pages/SvgBlobGenerator";
import SvgPatternGenerator from "./pages/SvgPatternGenerator";
import SvgOptimizer from "./pages/SvgOptimizer";
import FaviconGenerator from "./pages/FaviconGenerator";
import InstagramFilters from "./pages/InstagramFilters";
import ImageToBase64 from "./pages/ImageToBase64";
import ImageCaptionGenerator from "./pages/ImageCaptionGenerator";
import ScannedPdfConverter from "./pages/ScannedPdfConverter";
import PdfMerge from "./pages/PdfMerge";
import PdfSplit from "./pages/PdfSplit";
import PdfToJpg from "./pages/PdfToJpg";
import PdfCompress from "./pages/PdfCompress";
import CharacterCounter from "./pages/CharacterCounter";
import CaseConverter from "./pages/CaseConverter";
import TextFormatter from "./pages/TextFormatter";
import DuplicateLineRemover from "./pages/DuplicateLineRemover";
import LoremIpsumGenerator from "./pages/LoremIpsumGenerator";
import LetterCounter from "./pages/LetterCounter_new";
import TextToHandwriting from "./pages/TextToHandwriting";
import BionicReadingConverter from "./pages/BionicReadingConverter";
import MultipleWhitespaceRemover from "./pages/MultipleWhitespaceRemover";
import ListRandomizer from "./pages/ListRandomizer";
import Base64Encoder from "./pages/Base64Encoder";
import UrlEncoder from "./pages/UrlEncoder";
import HtmlEncoder from "./pages/HtmlEncoder";
import JsonFormatter from "./pages/JsonFormatter";
import JsonTreeViewer from "./pages/JsonTreeViewer";
import RegexTester from "./pages/RegexTester";
import CodeToImage from "./pages/CodeToImage";
import UrlSlugGenerator from "./pages/UrlSlugGenerator";
import ReactNativeShadowGenerator from "./pages/ReactNativeShadowGenerator";
import HtmlMinifier from "./pages/HtmlMinifier";
import JavaScriptMinifier from "./pages/JavaScriptMinifier";
import HtmlFormatter from "./pages/HtmlFormatter";
import JavaScriptFormatter from "./pages/JavaScriptFormatter";
import JwtEncoder from "./pages/JwtEncoder";
import { Navbar } from "@/components/ui/mini-navbar";
import ColorPicker from "./pages/ColorPicker";
import ContrastChecker from "./pages/ContrastChecker";
import AiColorPaletteGenerator from "./pages/AiColorPaletteGenerator";
import HexToRgbaConverter from "./pages/HexToRgbaConverter";
import RgbaToHexConverter from "./pages/RgbaToHexConverter";
import ColorShadesGenerator from "./pages/ColorShadesGenerator";
import ColorMixer from "./pages/ColorMixer";
// Calculator tools
import BmiCalculator from "./pages/BmiCalculator";
import LoanEmiCalculator from "./pages/LoanEmiCalculator";
import PercentageCalculator from "./pages/PercentageCalculator";
import AgeCalculator from "./pages/AgeCalculator";
import TodoList from "./pages/TodoList";
import ClipboardManager from "./pages/ClipboardManager";
import FakeIbanGenerator from "./pages/FakeIbanGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/tools/instagram-post-editor" element={<InstagramPostEditor />} />
          <Route path="/tools/pomodoro-timer" element={<PomodoroTimer />} />
          <Route path="/tools/qr-generator" element={<QrGenerator />} />
          <Route path="/qr" element={<QrGenerator />} />  {/* Alias route for easier access */}
          <Route path="/tools/barcode-generator" element={<BarcodeGenerator />} />
          <Route path="/tools/instagram-post-generator" element={<InstagramPostGenerator />} />
          <Route path="/tools/instagram-photo-downloader" element={<InstagramPhotoDownloader />} />
          <Route path="/" element={<Index />} />
          <Route path="/tools/png-to-jpg" element={<PngToJpg />} />
          <Route path="/tools/image-compressor" element={<ImageCompressor />} />
          <Route path="/tools/image-cropper" element={<ImageCropper />} />
          <Route path="/tools/image-rotator" element={<ImageRotator />} />
          <Route path="/tools/image-filters" element={<ImageFilters />} />
          <Route path="/tools/image-resizer" element={<ImageResizer />} />
          <Route path="/tools/image-average-color" element={<ImageAverageColor />} />
          <Route path="/tools/image-color-extractor" element={<ImageColorExtractor />} />
          <Route path="/tools/image-color-picker" element={<ImageColorPicker />} />
          <Route path="/tools/photo-censor" element={<PhotoCensor />} />
          <Route path="/tools/svg-to-png" element={<SvgToPng />} />
          <Route path="/tools/svg-stroke-to-fill" element={<SvgStrokeToFill />} />
          <Route path="/tools/svg-blob-generator" element={<SvgBlobGenerator />} />
          <Route path="/tools/svg-pattern-generator" element={<SvgPatternGenerator />} />
          <Route path="/tools/svg-optimizer" element={<SvgOptimizer />} />
          <Route path="/tools/favicon-generator" element={<FaviconGenerator />} />
          <Route path="/tools/instagram-filters" element={<InstagramFilters />} />
          <Route path="/tools/image-to-base64" element={<ImageToBase64 />} />
          <Route path="/tools/image-caption-generator" element={<ImageCaptionGenerator />} />
          <Route path="/tools/scanned-pdf-converter" element={<ScannedPdfConverter />} />
          <Route path="/tools/pdf-merge" element={<PdfMerge />} />
          <Route path="/tools/pdf-split" element={<PdfSplit />} />
          <Route path="/tools/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/tools/compress-pdf" element={<PdfCompress />} />
          <Route path="/tools/character-counter" element={<CharacterCounter />} />
          <Route path="/tools/case-converter" element={<CaseConverter />} />
          <Route path="/tools/text-formatter" element={<TextFormatter />} />
          <Route path="/tools/duplicate-remover" element={<DuplicateLineRemover />} />
          <Route path="/tools/lorem-ipsum-generator" element={<LoremIpsumGenerator />} />
          <Route path="/tools/letter-counter" element={<LetterCounter />} />
          <Route path="/tools/text-to-handwriting" element={<TextToHandwriting />} />
          <Route path="/tools/bionic-reading" element={<BionicReadingConverter />} />
          <Route path="/tools/whitespace-remover" element={<MultipleWhitespaceRemover />} />
          <Route path="/tools/list-randomizer" element={<ListRandomizer />} />
          <Route path="/tools/base64-encoder" element={<Base64Encoder />} />
          <Route path="/tools/url-encoder" element={<UrlEncoder />} />
          <Route path="/tools/html-encoder" element={<HtmlEncoder />} />
          <Route path="/tools/json-formatter" element={<JsonFormatter />} />
          <Route path="/tools/json-tree-viewer" element={<JsonTreeViewer />} />
          <Route path="/tools/regex-tester" element={<RegexTester />} />
          <Route path="/tools/code-to-image" element={<CodeToImage />} />
          <Route path="/tools/url-slug-generator" element={<UrlSlugGenerator />} />
          <Route path="/tools/react-native-shadow" element={<ReactNativeShadowGenerator />} />
          <Route path="/tools/html-minifier" element={<HtmlMinifier />} />
          <Route path="/tools/js-minifier" element={<JavaScriptMinifier />} />
          <Route path="/tools/html-formatter" element={<HtmlFormatter />} />
          <Route path="/tools/js-formatter" element={<JavaScriptFormatter />} />
          <Route path="/tools/jwt-encoder" element={<JwtEncoder />} />
          <Route path="/tools/color-picker" element={<ColorPicker />} />
          <Route path="/tools/contrast-checker" element={<ContrastChecker />} />
          <Route path="/tools/ai-color-palette-generator" element={<AiColorPaletteGenerator />} />
          <Route path="/tools/hex-to-rgba-converter" element={<HexToRgbaConverter />} />
          <Route path="/tools/rgba-to-hex-converter" element={<RgbaToHexConverter />} />
          <Route path="/tools/color-shades-generator" element={<ColorShadesGenerator />} />
          <Route path="/tools/color-mixer" element={<ColorMixer />} />
          <Route path="/tools/md5-hash-generator" element={<Md5HashGenerator />} />
          <Route path="/tools/strong-password-generator" element={<StrongPasswordGenerator />} />
          <Route path="/tools/md5-encrypt-decrypt" element={<Md5EncryptDecrypt />} />
          <Route path="/tools/sha-encrypt-decrypt" element={<ShaEncryptDecrypt />} />
          <Route path="/tools/bmi-calculator" element={<BmiCalculator />} />
          <Route path="/tools/loan-emi-calculator" element={<LoanEmiCalculator />} />
          <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
          <Route path="/tools/age-calculator" element={<AgeCalculator />} />
          <Route path="/tools/todo-list" element={<TodoList />} />
          <Route path="/tools/clipboard-manager" element={<ClipboardManager />} />
          <Route path="/tools/fake-iban-generator" element={<FakeIbanGenerator />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
