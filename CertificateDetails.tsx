import { useRoute, Link } from "wouter";
import { useVerifyCertificate } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Printer, Download, Calendar, User, BookOpen, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

export default function CertificateDetails() {
  const [, params] = useRoute("/certificate/:id");
  const id = params?.id ? decodeURIComponent(params.id) : "";

  const { data: cert, isLoading, isError } = useVerifyCertificate(id, {
    query: { 
      retry: false,
      enabled: !!id 
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Verifying records...</p>
        </div>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/30 p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="text-center p-8 border-destructive/20 shadow-xl shadow-destructive/5">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
            <p className="text-muted-foreground mb-8">
              We could not find any records matching the certificate ID <strong>{id}</strong>. Please check the ID and try again.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Try Another Search</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Search</Link>
        </Button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden border-0 shadow-2xl bg-white relative">
            {/* Verified Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 flex items-center justify-center gap-3">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold tracking-wide uppercase text-sm">Official Verified Record</span>
            </div>

            <div className="p-8 sm:p-12 relative">
              {/* Watermark/Background logo */}
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none p-12">
                <BadgeCheck className="w-64 h-64" />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-border/50 pb-8 mb-8 relative z-10">
                <div>
                  <h1 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Certificate of Completion</h1>
                  <p className="text-4xl font-display font-bold text-foreground mb-2">{cert.studentName}</p>
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <User className="h-5 w-5" /> {cert.email}
                  </p>
                </div>
                <div className="text-right bg-secondary/30 p-4 rounded-xl border border-secondary">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Certificate ID</p>
                  <p className="text-xl font-mono font-bold text-foreground">{cert.certificateId}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4" /> Domain / Program
                    </h3>
                    <p className="text-xl font-semibold">{cert.internshipDomain}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" /> Duration
                    </h3>
                    <p className="text-lg font-medium">
                      {cert.startDate ? format(parseISO(cert.startDate), "MMM d, yyyy") : "N/A"} - {cert.endDate ? format(parseISO(cert.endDate), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Date of Issue</h3>
                    <p className="text-lg font-medium">
                      {cert.issueDate ? format(parseISO(cert.issueDate), "MMMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active & Valid
                    </div>
                  </div>
                </div>
              </div>

              {cert.certificateUrl && (
                <div className="mt-10 p-6 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">Original Document</h4>
                    <p className="text-sm text-muted-foreground">View the original scanned document</p>
                  </div>
                  <Button asChild variant="outline">
                    <a href={cert.certificateUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 w-4 h-4" /> View File
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-muted/30 border-t border-border px-8 py-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Verified at {new Date().toLocaleString()}</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print Record
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
