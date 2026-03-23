import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUploadExcel } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { UploadResponse } from "@workspace/api-client-react/src/generated/api.schemas";

export default function UploadExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const { toast } = useToast();

  const uploadMutation = useUploadExcel({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        toast({ title: "Upload Complete", description: `Generated ${data.generated} certificates successfully.` });
        setFile(null);
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Upload Failed", description: error.response?.data?.message || "Server error" });
      }
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate({ data: { file } });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Issue Certificates</h1>
        <p className="text-muted-foreground mt-2">Upload an Excel file to automatically generate and store certificates.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-dashed border-2 border-border overflow-hidden bg-muted/10">
          <div 
            {...getRootProps()} 
            className={`p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px] ${isDragActive ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}`}
          >
            <input {...getInputProps()} />
            
            {!file ? (
              <>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-border">
                  <UploadCloud className={`w-10 h-10 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drag & drop your Excel file here</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Only .xlsx or .xls files are supported. Ensure headers match: studentName, email, internshipDomain, startDate, endDate.
                </p>
                <Button type="button" variant="secondary">Browse Files</Button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <FileSpreadsheet className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-xl font-semibold mb-1">{file.name}</h3>
                <p className="text-muted-foreground mb-6">{(file.size / 1024).toFixed(1)} KB</p>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Cancel</Button>
                  <Button type="button" onClick={(e) => { e.stopPropagation(); handleUpload(); }} isLoading={uploadMutation.isPending}>
                    {uploadMutation.isPending ? "Processing..." : "Generate Certificates"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {result && (
          <Card className="bg-white border-emerald-500/20 shadow-lg shadow-emerald-500/5 animate-in slide-in-from-bottom-4">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Process Complete</h3>
                  <p className="text-muted-foreground">
                    Successfully generated <span className="font-semibold text-foreground">{result.generated}</span> certificates.
                    {result.failed > 0 && <span className="text-destructive ml-2">Failed: {result.failed} rows.</span>}
                  </p>
                </div>
              </div>

              {result.certificates.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Generated Preview (First 5)</h4>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    {result.certificates.slice(0, 5).map((cert, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-medium text-sm">{cert.studentName}</p>
                          <p className="text-xs text-muted-foreground">{cert.certificateId}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-white border border-border rounded-md">{cert.internshipDomain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

