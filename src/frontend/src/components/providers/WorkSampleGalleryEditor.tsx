import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalBlob } from '@/backend';
import { useAddWorkSampleImage, useRemoveWorkSampleImage } from '@/hooks/useQueries';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WorkSampleGalleryEditorProps {
  workSampleImages: ExternalBlob[];
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  blob?: ExternalBlob;
}

export function WorkSampleGalleryEditor({ workSampleImages }: WorkSampleGalleryEditorProps) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const addImageMutation = useAddWorkSampleImage();
  const removeImageMutation = useRemoveWorkSampleImage();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newUploads: UploadingImage[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
    }));

    setUploadingImages((prev) => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      try {
        const arrayBuffer = await upload.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.id === upload.id ? { ...img, progress: percentage } : img
            )
          );
        });

        await addImageMutation.mutateAsync(blob);

        setUploadingImages((prev) => prev.filter((img) => img.id !== upload.id));
        toast.success('Image uploaded successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload image');
        setUploadingImages((prev) => prev.filter((img) => img.id !== upload.id));
      }
    }

    event.target.value = '';
  };

  const handleRemoveImage = async (blob: ExternalBlob) => {
    try {
      await removeImageMutation.mutateAsync(blob);
      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Work Sample Photos
        </CardTitle>
        <CardDescription>
          Upload photos of your completed work to showcase your skills to potential clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            id="work-sample-upload"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => document.getElementById('work-sample-upload')?.click()}
            disabled={addImageMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            Upload Photos
          </Button>
        </div>

        {uploadingImages.length > 0 && (
          <div className="space-y-2">
            {uploadingImages.map((upload) => (
              <div key={upload.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{upload.file.name}</p>
                  <span className="text-sm text-muted-foreground">{upload.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {workSampleImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {workSampleImages.map((blob, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border">
                <img
                  src={blob.getDirectURL()}
                  alt={`Work sample ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(blob)}
                    disabled={removeImageMutation.isPending}
                  >
                    {removeImageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <ImageIcon className="h-4 w-4" />
            <AlertDescription>
              No work sample photos yet. Upload photos to showcase your completed projects.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
