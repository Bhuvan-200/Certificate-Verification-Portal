import { useRef } from "react";
import { useRoute, Link } from "wouter";
import { useGetCertificate } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReactToPrint } from "react-to-print";

export default function CertificatePreview() {
  const [, params] = useRoute("/admin/certificate/:id/preview");
  const id = params?.id ? decodeURIComponent(params.id) : "";
  const componentRef = useRef<HTMLDivElement>(null);

  const { data: cert, isLoading } = useGetCertificate(id, {
    request: { headers: getAuthHeaders() },
    query: { enabled: !!id }
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificate_${id}`,
  });

  if (isLoading) return <div className="p-8 text-center">Loading preview...</div>;
  if (!cert) return <div className="p-8 text-center text-destructive">Certificate not found.</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Button asChild variant="ghost" className="pl-0">
          <Link href="/admin/certificates"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory</Link>
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" /> Print Document
          </Button>
        </div>
      </div>

      <div className="bg-muted p-8 rounded-2xl flex items-center justify-center print:bg-transparent print:p-0">
        {/* Printable Area */}
        <div 
          ref={componentRef} 
          className="w-[1056px] h-[816px] bg-white text-black shadow-2xl relative overflow-hidden flex flex-col items-center print:shadow-none"
          style={{ padding: "40px" }}
        >
          {/* Certificate Border Design */}
          <div className="absolute inset-0 m-4 border-[12px] border-primary/90"></div>
          <div className="absolute inset-0 m-6 border-2 border-primary/30"></div>
          <div className="absolute inset-0 m-8 border border-primary/20"></div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-[500px] h-[500px]" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>

          <div className="z-10 flex flex-col items-center w-full h-full text-center relative px-20 py-16">
            
            <div className="mb-12">
              <h1 className="text-5xl font-display font-bold text-primary tracking-widest uppercase">Certificate of Completion</h1>
              <div className="h-1 w-24 bg-accent mx-auto mt-6"></div>
            </div>

            <p className="text-xl italic text-gray-600 mb-8 font-display">This is to certify that</p>

            <h2 className="text-6xl font-display font-bold mb-8 text-gray-900 border-b-2 border-gray-300 pb-2 px-12 inline-block">
              {cert.studentName}
            </h2>

            <p className="text-xl text-gray-700 max-w-2xl leading-relaxed mb-16">
              has successfully completed the comprehensive training and internship program in 
              <br/><strong className="text-2xl mt-2 block text-primary">{cert.internshipDomain}</strong>
            </p>

            <div className="mt-auto w-full flex justify-between items-end px-12">
              <div className="text-left flex flex-col items-center">
                <p className="font-medium text-lg border-b border-gray-400 pb-1 px-8 mb-2">
                  {cert.startDate ? format(parseISO(cert.startDate), "MMM d, yyyy") : "-"} to {cert.endDate ? format(parseISO(cert.endDate), "MMM d, yyyy") : "-"}
                </p>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Duration</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-24 h-24 border-4 border-accent rounded-full flex items-center justify-center transform rotate-12 mb-4">
                  <span className="font-bold text-accent transform -rotate-12">SEAL</span>
                </div>
                <p className="text-xs text-gray-400 font-mono">ID: {cert.certificateId}</p>
              </div>

              <div className="text-right flex flex-col items-center">
                <p className="font-medium text-lg border-b border-gray-400 pb-1 px-8 mb-2">
                  {cert.issueDate ? format(parseISO(cert.issueDate), "MMMM d, yyyy") : "-"}
                </p>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Date of Issue</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

