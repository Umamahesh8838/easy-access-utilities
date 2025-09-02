import { useState } from "react";
import { Button } from "@/components/ui/button";

const InstagramPhotoDownloader = () => {
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDownloadUrl(null);
    setLoading(true);
    try {
      // For demo: just validate and fake a download link
      if (!url.match(/^https?:\/\/(www\.)?instagram\.com\//)) {
        setError("Please enter a valid Instagram post URL.");
        setLoading(false);
        return;
      }
      // In production, call a backend API or third-party service here
      setTimeout(() => {
        // Use a CORS-friendly placeholder image for demo
        setDownloadUrl("https://placekitten.com/600/600");
        setLoading(false);
      }, 1200);
    } catch (err) {
      setError("Failed to fetch photo. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4 text-foreground">Instagram Photo Downloader</h1>
      <p className="mb-6 text-muted-foreground">
        Download Instagram post photos easily. Paste the Instagram post URL below and click Download.
      </p>
      <form onSubmit={handleDownload} className="flex flex-col gap-4">
        <input
          type="url"
          className="w-full px-4 py-2 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Paste Instagram post URL here..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Download Photo"}
        </Button>
      </form>
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {downloadUrl && (
        <div className="mt-8 text-center">
          <img
            src={downloadUrl}
            alt="Instagram Post Preview"
            className="mx-auto rounded shadow mb-4 max-w-xs"
            onError={e => {
              e.currentTarget.style.display = 'none';
              setError('Failed to load preview image.');
            }}
          />
          <Button
            type="button"
            variant="default"
            onClick={async () => {
              try {
                const response = await fetch(downloadUrl);
                if (!response.ok) throw new Error('Network error');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'instagram-photo.png';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                setError('Download failed. Please try again.');
              }
            }}
          >
            Download Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default InstagramPhotoDownloader;
