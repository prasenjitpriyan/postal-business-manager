'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostalLogo } from '@/components/brand/PostalLogo';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Your message has been sent successfully! Our support team will get back to you shortly.');
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30 relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-900/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[65%] rounded-full bg-indigo-900/20 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-white/10 backdrop-blur-md bg-slate-950/60">
        <PostalLogo size="md" />
        <Link href="/">
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-semibold rounded-full px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Mail className="w-4 h-4" />
            Official Support Channel
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Have questions regarding official tracking, PLI/RPLI policy metrics, or technical support? Our operational support team is here to assist.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-8">
              <h2 className="text-xl font-bold text-white mb-2">Department Contact Info</h2>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Official Email</p>
                  <p className="text-sm font-semibold text-white mt-1">support@postalbusinessmanager.in</p>
                  <p className="text-xs text-slate-500 mt-0.5">Response within 24 operational hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Support Helpline</p>
                  <p className="text-sm font-semibold text-white mt-1">+91 1800 266 6868</p>
                  <p className="text-xs text-slate-500 mt-0.5">Toll-free departmental line</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Central Headquarters</p>
                  <p className="text-sm font-semibold text-white mt-1">Postal Directorate, Dak Bhawan</p>
                  <p className="text-xs text-slate-500 mt-0.5">Sansad Marg, New Delhi 110001</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Working Hours</p>
                  <p className="text-sm font-semibold text-white mt-1">Monday – Saturday: 09:00 AM – 06:00 PM</p>
                  <p className="text-xs text-slate-500 mt-0.5">Closed on Sunday & Postal Holidays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Panel */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md shadow-2xl">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Thank you for reaching out. Your message has been logged into our support ticketing system.
                  </p>
                  <Button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }} 
                    variant="outline" 
                    className="mt-4 border-white/20 text-white rounded-full"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">Send Us a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                      <Input
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-950/60 rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Official Email Address *</label>
                      <Input
                        required
                        type="email"
                        placeholder="officer@indiapost.gov.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-slate-950/60 rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Subject</label>
                    <Input
                      placeholder="e.g. Account Access / PLI Data Clarification"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-slate-950/60 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Message / Query Details *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please describe your query or technical issue in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-4 rounded-xl bg-slate-950/60 border border-white/15 text-sm placeholder:text-slate-500 transition-colors resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting ? (
                      'Sending Message...'
                    ) : (
                      <span className="flex items-center justify-center">
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-8 px-8 mt-auto text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Postal Business Manager. All rights reserved.
      </footer>
    </div>
  );
}
