import { useState } from 'react';
import { useGetCallerUserProfile, useSubmitVerificationDocuments } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, Upload, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { ExternalBlob } from '../../backend';

export function VerificationUploadPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const submitDocuments = useSubmitVerificationDocuments();

  const [academicFiles, setAcademicFiles] = useState<File[]>([]);
  const [goodConductFile, setGoodConductFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const verificationStatus = userProfile?.providerProfile?.verificationStatus;

  const getStatusInfo = () => {
    if (!verificationStatus) {
      return {
        icon: AlertCircle,
        variant: 'default' as const,
        title: 'Not Submitted',
        description: 'Upload your required documents to begin the verification process with the Administrator.',
      };
    }
    if ('verified' in verificationStatus) {
      return {
        icon: CheckCircle,
        variant: 'default' as const,
        title: 'Verified',
        description: 'Your account has been verified by the Administrator.',
      };
    }
    if ('pending' in verificationStatus) {
      return {
        icon: Clock,
        variant: 'default' as const,
        title: 'Pending Review',
        description: 'Your verification documents are being reviewed by the Administrator.',
      };
    }
    if ('rejected' in verificationStatus) {
      return {
        icon: XCircle,
        variant: 'destructive' as const,
        title: 'Rejected',
        description: `Reason: ${verificationStatus.rejected}`,
      };
    }
    return {
      icon: AlertCircle,
      variant: 'default' as const,
      title: 'Unverified',
      description: 'Upload your required documents to begin the verification process with the Administrator.',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const canUpload = !verificationStatus || 'unverified' in verificationStatus || 'rejected' in verificationStatus;

  const handleAcademicFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAcademicFiles(Array.from(e.target.files));
    }
  };

  const handleGoodConductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGoodConductFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (academicFiles.length === 0 || !goodConductFile) {
      alert('Please select all required documents before submitting.');
      return;
    }

    setIsUploading(true);
    setUploadProgress({});

    try {
      // Convert files to ExternalBlob with progress tracking
      const academicBlobs: ExternalBlob[] = [];
      
      for (let i = 0; i < academicFiles.length; i++) {
        const file = academicFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(prev => ({ ...prev, [`academic_${i}`]: percentage }));
        });
        
        academicBlobs.push(blob);
      }

      const goodConductArrayBuffer = await goodConductFile.arrayBuffer();
      const goodConductUint8Array = new Uint8Array(goodConductArrayBuffer);
      const goodConductBlob = ExternalBlob.fromBytes(goodConductUint8Array).withUploadProgress((percentage) => {
        setUploadProgress(prev => ({ ...prev, goodConduct: percentage }));
      });

      await submitDocuments.mutateAsync({
        academicDocs: academicBlobs,
        goodConductCert: goodConductBlob,
      });

      // Clear form on success
      setAcademicFiles([]);
      setGoodConductFile(null);
      setUploadProgress({});
    } catch (error: any) {
      console.error('Document submission error:', error);
      alert(error.message || 'Failed to submit documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Verification Status</h1>
          <p className="mt-2 text-muted-foreground">
            Get verified to build trust with clients
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={statusInfo.variant}>
              <StatusIcon className="h-4 w-4" />
              <AlertTitle>{statusInfo.title}</AlertTitle>
              <AlertDescription>{statusInfo.description}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {canUpload && (
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submit your required documents for Administrator review
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  Document upload functionality is currently being finalized. The Administrator will review your profile and documents once this feature is fully enabled.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="academic-docs">
                    Academic Qualifications <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="academic-docs"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAcademicFilesChange}
                    disabled={isUploading}
                  />
                  {academicFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {academicFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{file.name}</span>
                          {uploadProgress[`academic_${idx}`] !== undefined && (
                            <span className="ml-auto text-xs">
                              {Math.round(uploadProgress[`academic_${idx}`])}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload certificates, diplomas, or other academic credentials (PDF, JPG, PNG)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="good-conduct">
                    Certificate of Good Conduct <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="good-conduct"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleGoodConductFileChange}
                    disabled={isUploading}
                  />
                  {goodConductFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{goodConductFile.name}</span>
                      {uploadProgress.goodConduct !== undefined && (
                        <span className="ml-auto text-xs">
                          {Math.round(uploadProgress.goodConduct)}%
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload your certificate of good conduct from the relevant authority (PDF, JPG, PNG)
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isUploading || academicFiles.length === 0 || !goodConductFile}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Documents...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit for Administrator Review
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {verificationStatus && 'verified' in verificationStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your account has been successfully verified by the Administrator. You can now access all provider features and build trust with clients.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
