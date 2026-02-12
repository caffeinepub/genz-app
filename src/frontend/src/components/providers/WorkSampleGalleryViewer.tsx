import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalBlob } from '@/backend';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface WorkSampleGalleryViewerProps {
  workSampleImages: ExternalBlob[];
  variant?: 'compact' | 'full';
  maxThumbnails?: number;
}

export function WorkSampleGalleryViewer({ 
  workSampleImages, 
  variant = 'full',
  maxThumbnails 
}: WorkSampleGalleryViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (workSampleImages.length === 0) {
    return null;
  }

  const displayImages = maxThumbnails 
    ? workSampleImages.slice(0, maxThumbnails) 
    : workSampleImages;

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + workSampleImages.length) % workSampleImages.length);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % workSampleImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <>
      <div className={variant === 'compact' ? 'space-y-2' : 'space-y-3'}>
        <h3 className={`font-semibold ${variant === 'compact' ? 'text-sm' : ''}`}>
          Work Samples
        </h3>
        <div className={`grid gap-2 ${variant === 'compact' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {displayImages.map((blob, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-primary"
            >
              <img
                src={blob.getDirectURL()}
                alt={`Work sample ${index + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
        {maxThumbnails && workSampleImages.length > maxThumbnails && (
          <p className="text-xs text-muted-foreground">
            +{workSampleImages.length - maxThumbnails} more photos
          </p>
        )}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent 
          className="max-w-4xl p-0"
          onKeyDown={handleKeyDown}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              Work Sample {selectedIndex !== null ? selectedIndex + 1 : 0} of {workSampleImages.length}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedIndex !== null && (
              <>
                <div className="flex items-center justify-center bg-black/5 p-4">
                  <img
                    src={workSampleImages[selectedIndex].getDirectURL()}
                    alt={`Work sample ${selectedIndex + 1}`}
                    className="max-h-[70vh] w-auto rounded-lg object-contain"
                  />
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    className="ml-2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="mr-2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
