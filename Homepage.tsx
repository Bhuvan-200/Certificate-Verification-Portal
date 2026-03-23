import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function HomePage() {
  const [certId, setCertId] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      setLocation(`/certificate/${encodeURIComponent(certId.trim())}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background with image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-3xl px-4 sm:px-6 z-10 text-center"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary/10 border border-border/50">
          <Award className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 font-display">
          Verify Academic <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Certificates</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Enter a certificate identification number below to verify its authenticity, issue date, and recipient details securely.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <div className="relative flex items-center group">
            <Search className="absolute left-5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input
              type="text"
              placeholder="e.g. CERT-2023-XYZ123"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="h-16 pl-14 pr-36 text-lg rounded-2xl shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md border-border/50 transition-all hover:bg-white focus:bg-white"
            />
            <div className="absolute right-2">
              <Button type="submit" size="lg" className="rounded-xl h-12 px-6 font-semibold shadow-md">
                Verify Now
              </Button>
            </div>
          </div>
        </form>
        
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Real-time Verification
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" /> Secure Database
          </div>
        </div>
      </motion.div>
    </div>
  );
}
