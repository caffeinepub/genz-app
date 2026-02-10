import { useGetCallerUserProfile, useUploadDocument } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { CheckCircle, Clock, XCircle, AlertCircle, Upload, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useState, useRef } from 'react';
import { DocumentType, ExternalBlob } from '../../backend';

export function VerificationUploadPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const uploadDocument = useUploadDocument();
  
  const academicInputRef = useRef<HTMLInputElement>(null);
  const conductInputRef = useRef<HTMLInputElement>(null);
  
  const [academicProgress, setAcademicProgress] = useState<number>(0);
  const [conductProgress, setConductProgress] = useState<number>(0);

  const handleFileUpload = async (
    file: File,
    docType: DocumentType,
    setProgress: (progress: number) => void
  ) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setProgress(percentage);
      });

      await uploadDocument.mutateAsync({
        docType,
        filename: file.name,
        blob,
      });
      
      setProgress(0);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
      setProgress(0);
    }
  };

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
  const academicDocs = userProfile?.providerProfile?.academicDocuments || [];
  const conductCert = userProfile?.providerProfile?.goodConductCert;

  const getStatusInfo = () => {
    if (!verificationStatus) {
      return {
        icon: AlertCircle,
        variant: 'default' as const,
        title: 'Not Submitted',
        description: 'You have not submitted verification documents yet.',
      };
    }
    if ('verified' in verificationStatus) {
      return {
        icon: CheckCircle,
        variant: 'default' as const,
        title: 'Verified',
        description: 'Your account has been verified by our technical team.',
      };
    }
    if ('pending' in verificationStatus) {
      return {
        icon: Clock,
        variant: 'default' as const,
        title: 'Pending Review',
        description: 'Your verification is being reviewed by our technical team.',
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
      description: 'Please submit your verification documents.',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Academic Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your academic certificates, diplomas, or relevant training documents.
            </p>
            
            {academicDocs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Documents:</p>
                {academicDocs.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc.filename}</span>
                    <Badge variant="outline" className="ml-auto">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Uploaded
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={academicInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, DocumentType.academicQualification, setAcademicProgress);
                }
              }}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => academicInputRef.current?.click()}
              disabled={uploadDocument.isPending}
              className="w-full gap-2"
            >
              {uploadDocument.isPending && academicProgress > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading... {academicProgress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Academic Document
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, JPG, PNG. Max size 10MB.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate of Good Conduct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your Certificate of Good Conduct from the Directorate of Criminal Investigations (DCI).
            </p>
            
            {conductCert && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{conductCert.filename}</span>
                <Badge variant="outline" className="ml-auto">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Uploaded
                </Badge>
              </div>
            )}

            <input
              ref={conductInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, DocumentType.goodConductCertificate, setConductProgress);
                }
              }}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => conductInputRef.current?.click()}
              disabled={uploadDocument.isPending}
              className="w-full gap-2"
            >
              {uploadDocument.isPending && conductProgress > 0 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading... {conductProgress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {conductCert ? 'Replace Certificate' : 'Upload Certificate'}
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, JPG, PNG. Max size 10MB.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
