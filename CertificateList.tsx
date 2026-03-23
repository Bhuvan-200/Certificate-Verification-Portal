import { useState } from "react";
import { Link } from "wouter";
import { useListCertificates, useDeleteCertificate } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Search, ExternalLink, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function CertificateList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const reqOpts = { request: { headers: getAuthHeaders() } };

  // Simple debounce for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => setDebouncedSearch(e.target.value), 500);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useListCertificates({ 
    page, 
    limit: 10, 
    search: debouncedSearch || undefined 
  }, reqOpts);

  const deleteMutation = useDeleteCertificate({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Certificate removed successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
        setDeleteId(null);
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete certificate" })
    }
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and view all issued certificates.</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, Name or Email..." 
            value={search}
            onChange={handleSearchChange}
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background h-10"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b border-border">
              <TableHead>Certificate ID</TableHead>
              <TableHead>Student Info</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="inline-flex items-center justify-center w-full">
                    <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mr-3" />
                    Loading records...
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No certificates found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data?.certificates.map((cert) => (
                <TableRow key={cert.id} className="group">
                  <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                    {cert.certificateId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{cert.studentName}</div>
                    <div className="text-xs text-muted-foreground">{cert.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {cert.internshipDomain}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {cert.issueDate ? format(parseISO(cert.issueDate), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                        <Link href={`/admin/certificate/${cert.certificateId}/preview`} title="Preview & Print">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(cert.certificateId)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === data.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete certificate <strong>{deleteId}</strong>? This action cannot be undone and the record will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteId && deleteMutation.mutate({ certificateId: deleteId })}
              isLoading={deleteMutation.isPending}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

