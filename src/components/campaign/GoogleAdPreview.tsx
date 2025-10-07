import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

interface AdPreviewProps {
  headlines: string[];
  descriptions: string[];
  displayUrl: string;
  sitelinks?: Array<{ text: string; url: string }>;
  callouts?: string[];
}

export const GoogleAdPreview = ({
  headlines,
  descriptions,
  displayUrl,
  sitelinks = [],
  callouts = [],
}: AdPreviewProps) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const baseUrl = displayUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const domain = baseUrl.split('/')[0];

  return (
    <div className="space-y-4">
      {/* Device Toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={device === 'desktop' ? 'default' : 'outline'}
          onClick={() => setDevice('desktop')}
          className="gap-2"
        >
          <Monitor className="w-4 h-4" />
          Desktop
        </Button>
        <Button
          size="sm"
          variant={device === 'mobile' ? 'default' : 'outline'}
          onClick={() => setDevice('mobile')}
          className="gap-2"
        >
          <Smartphone className="w-4 h-4" />
          Mobile
        </Button>
      </div>

      {/* Ad Preview */}
      <div 
        className={`bg-white border rounded-lg p-4 ${
          device === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
        }`}
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Ad Label */}
        <div className="mb-2">
          <span 
            className="text-xs font-bold px-1.5 py-0.5 border border-green-700 text-green-700 rounded"
            style={{ fontSize: '11px' }}
          >
            Ad
          </span>
        </div>

        {/* Display URL */}
        <div className="mb-1">
          <span 
            className="text-green-700"
            style={{ fontSize: '14px', lineHeight: '1.3' }}
          >
            {domain}
          </span>
        </div>

        {/* Headlines */}
        <div className="mb-2">
          <a
            href="#"
            className="text-blue-800 hover:underline"
            style={{ 
              fontSize: device === 'mobile' ? '18px' : '20px',
              lineHeight: '1.3',
              fontWeight: '400',
            }}
            onClick={(e) => e.preventDefault()}
          >
            {headlines.slice(0, 3).join(' | ')}
          </a>
        </div>

        {/* Descriptions */}
        <div className="mb-3">
          {descriptions.slice(0, 2).map((desc, i) => (
            <p
              key={i}
              className="text-gray-800"
              style={{ 
                fontSize: '14px',
                lineHeight: '1.4',
              }}
            >
              {desc}
            </p>
          ))}
        </div>

        {/* Sitelinks */}
        {sitelinks.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <div className={`grid ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              {sitelinks.slice(0, 4).map((link, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-blue-800 hover:underline text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Callouts */}
        {callouts.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {callouts.slice(0, 4).map((callout, i) => (
                <span
                  key={i}
                  className="text-gray-700"
                  style={{ fontSize: '13px' }}
                >
                  {i > 0 && '• '}
                  {callout}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground italic">
        * This is a pixel-perfect preview of how your ad will appear on Google Search
      </p>
    </div>
  );
};
