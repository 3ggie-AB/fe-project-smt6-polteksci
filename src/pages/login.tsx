import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Activity } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          if (data.success && data.data?.token && data.data?.user) {
            login(data.data.token, data.data.user, data.data.permissions || []);
            toast({
              title: "Login successful",
              description: "Welcome back to NetMonitor.",
            });
            setLocation("/dashboard");
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: data.message || "Invalid credentials",
            });
          }
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error?.message || "An error occurred during login",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded bg-primary text-primary-foreground flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to NetMonitor</h2>
          <p className="text-sm text-zinc-500 mt-2">Enter your details below to access the command center</p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}
