'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Clock, CheckCircle2, MessageSquare, Trash2, Send, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ContactMessageItem {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  replyNotes?: string;
  repliedBy?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function SupportMessagesPage() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'READ' | 'REPLIED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all support messages
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['support-messages'],
    queryFn: async () => {
      const res = await fetch('/api/contact');
      if (!res.ok) throw new Error('Failed to fetch support messages');
      const json = await res.json();
      return json.data as ContactMessageItem[];
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ id, replyNotes }: { id: string; replyNotes: string }) => {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyNotes, status: 'REPLIED' }),
      });
      if (!res.ok) throw new Error('Failed to save reply');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Reply saved and message marked as Replied!');
      queryClient.invalidateQueries({ queryKey: ['support-messages'] });
      setSelectedMessage(null);
      setReplyText('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error saving reply');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete message');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Message deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['support-messages'] });
      if (selectedMessage) setSelectedMessage(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error deleting message');
    },
  });

  // Filter messages
  const messages = data || [];
  const filteredMessages = messages.filter((m) => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: 'NEW' | 'READ' | 'REPLIED') => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
            New
          </span>
        );
      case 'READ':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Read
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Replied
          </span>
        );
    }
  };

  const handleOpenMessage = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyNotes || '');
    // If NEW, update status to READ in background
    if (msg.status === 'NEW') {
      fetch(`/api/contact/${msg._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      }).then(() => queryClient.invalidateQueries({ queryKey: ['support-messages'] }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-400" />
            Support & Contact Messages
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            View and respond to inquiries submitted by users via the contact channel.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          className="border-white/10 text-slate-300 hover:bg-white/10 self-start md:self-auto rounded-xl"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Inbox
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <Input
          placeholder="Search by name, email, subject, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md bg-slate-950/60 rounded-xl"
        />

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Status:</span>
          {(['ALL', 'NEW', 'READ', 'REPLIED'] as const).map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? 'default' : 'ghost'}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg text-xs font-semibold ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Message List Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading messages...</div>
      ) : filteredMessages.length === 0 ? (
        <Card className="bg-slate-950/50 border border-white/10 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Messages Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No messages match your search or status filter.'
              : 'No support inquiries have been submitted yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Messages Table / List */}
          <div className={`${selectedMessage ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3 transition-all`}>
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedMessage?._id === msg._id
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/50 border-white/10 hover:border-white/20 hover:bg-white/3'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-bold text-white text-base">{msg.name}</h4>
                    <p className="text-xs text-slate-400">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(msg.status)}
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-200 truncate mt-1">
                  {msg.subject || 'General Support Inquiry'}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Message Detail & Reply Box */}
          {selectedMessage && (
            <div className="lg:col-span-6 sticky top-6">
              <Card className="bg-slate-950/80 border border-white/15 p-6 backdrop-blur-xl space-y-6 shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(selectedMessage.status)}
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{selectedMessage.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      From: <strong className="text-white">{selectedMessage.name}</strong> ({selectedMessage.email})
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(selectedMessage._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User Inquiry</p>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Existing Reply Details */}
                {selectedMessage.replyNotes && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Admin Reply Note ({selectedMessage.repliedBy || 'Admin'})
                    </p>
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-sm text-emerald-200 whitespace-pre-wrap">
                      {selectedMessage.replyNotes}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>{selectedMessage.replyNotes ? 'Update Reply Note' : 'Add Admin Reply Note'}</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your official response / resolution notes here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors resize-none"
                  />

                  <div className="flex justify-end gap-3 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMessage(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      Close
                    </Button>

                    <Button
                      size="sm"
                      disabled={!replyText.trim() || replyMutation.isPending}
                      onClick={() =>
                        replyMutation.mutate({
                          id: selectedMessage._id,
                          replyNotes: replyText,
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                    >
                      {replyMutation.isPending ? (
                        'Saving Reply...'
                      ) : (
                        <span className="flex items-center">
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Save & Mark Replied
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
