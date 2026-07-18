'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Background SVGs Floating
    gsap.to('.auth-svg-node', {
      y: 'random(-50, 50)',
      x: 'random(-50, 50)',
      duration: 'random(3, 6)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2
    });

    // Form Entrance Animation
    tl.fromTo('.auth-card',
      { y: 30, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.auth-header-item',
      { y: -15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.5)' },
      "-=0.2"
    )
    .fromTo('.auth-form-item',
      { x: -15, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      "-=0.1"
    );
  }, { scope: container });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to login');
      }

      login(responseData.data.user, responseData.data.token);
      toast.success('Login successful!');
      
      window.location.assign('/dashboard');
      
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div ref={container} className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated SVG Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <svg className="w-full h-full max-w-6xl opacity-30" viewBox="0 0 1000 1000" fill="none">
           <circle className="auth-svg-node" cx="200" cy="200" r="200" fill="url(#grad1)" />
           <circle className="auth-svg-node" cx="800" cy="800" r="250" fill="url(#grad2)" />
           <circle className="auth-svg-node" cx="800" cy="200" r="150" fill="url(#grad3)" />
           <defs>
            <radialGradient id="grad1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
            <radialGradient id="grad2"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
            <radialGradient id="grad3"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="transparent" /></radialGradient>
           </defs>
        </svg>
      </div>

      <Card className="auth-card relative z-10 w-full max-w-md shadow-2xl border-white/10 bg-slate-900/60 backdrop-blur-2xl text-slate-50">
        <CardHeader className="space-y-2 text-center pb-6">
          <Link href="/">
            <div className="auth-header-item w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-105 cursor-pointer">
              <Mail className="text-white w-8 h-8" />
            </div>
          </Link>
          <CardTitle className="auth-header-item text-2xl font-bold tracking-tight text-white">
            Postal Business Manager
          </CardTitle>
          <CardDescription className="auth-header-item text-slate-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="auth-form-item">
                    <FormLabel className="text-slate-300">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-500" />
                        <Input
                          placeholder="admin@indiapost.gov.in"
                          className="h-12 pl-12 bg-slate-950/50 border-slate-800 text-white focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-slate-600 transition-all rounded-xl"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="auth-form-item">
                    <FormLabel className="text-slate-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-500" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-12 pl-12 bg-slate-950/50 border-slate-800 text-white focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-slate-600 transition-all rounded-xl"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <div className="auth-form-item pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 mt-2 rounded-xl text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="auth-form-item flex justify-center border-t border-white/10 p-4 mt-4">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
