import { Link } from "wouter";
import { useGetCertificateStats, useListCertificates } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Award, CalendarDays, Upload, FileText, ArrowRight, BarChart3 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const reqOpts = { request: { headers: getAuthHeaders() } };
  
  const { data: stats, isLoading: statsLoading } = useGetCertificateStats(reqOpts);
  const { data: recentData, isLoading: recentLoading } = useListCertificates({ limit: 5 }, reqOpts);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="bg-white">
            <Link href="/admin/certificates"><FileText className="mr-2 h-4 w-4"/> View All</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/upload"><Upload className="mr-2 h-4 w-4"/> Issue New</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-80">Total Certificates</CardTitle>
              <Award className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{statsLoading ? "..." : stats?.total || 0}</div>
              <p className="text-sm opacity-80 mt-1">Issued historically</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issued This Month</CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{statsLoading ? "..." : stats?.thisMonth || 0}</div>
              <p className="text-sm text-emerald-600 font-medium mt-1">+ Active cycle</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="md:col-span-2 lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Domain</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {statsLoading ? "..." : (stats?.domains?.[0]?.domain || "None yet")}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.domains?.[0]?.count || 0} certificates
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Certificates</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-8 text-primary">
                <Link href="/admin/certificates">View All <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {recentLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading records...</div>
            ) : recentData?.certificates?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No certificates found.</div>
            ) : (
              <Table className="border-0">
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Domain</TableHead>
                    <TableHead className="font-semibold text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentData?.certificates.map((cert) => (
                    <TableRow key={cert.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div>{cert.studentName}</div>
                        <div className="text-xs text-muted-foreground font-normal">{cert.certificateId}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                          {cert.internshipDomain}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {cert.issueDate ? format(parseISO(cert.issueDate), "MMM d, yyyy") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Domain Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statsLoading ? (
               <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : !stats?.domains?.length ? (
               <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.domains} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="domain" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'var(--muted)', opacity: 0.2}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
