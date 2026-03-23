import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAdminLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [authError, setAuthError] = useState("");
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/admin/dashboard");
      },
      onError: (error: any) => {
        setAuthError(error.response?.data?.message || "Invalid credentials or server error");
      }
    }
  });

  const onSubmit = (data: LoginForm) => {
    setAuthError("");
    loginMutation.mutate({ data });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-0 shadow-2xl p-8 bg-white/80 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
              <Shield className="h-8 w-8 text-primary transform rotate-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">Admin Portal</h2>
            <p className="text-muted-foreground mt-2">Sign in to manage certificates</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                <Input 
                  {...register("email")} 
                  placeholder="admin@institution.edu" 
                  className="pl-12 bg-white"
                  error={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                <Input 
                  type="password" 
                  {...register("password")} 
                  placeholder="••••••••" 
                  className="pl-12 bg-white"
                  error={!!errors.password}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive ml-1">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg mt-4" 
              isLoading={loginMutation.isPending}
            >
              Sign In to Dashboard
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
