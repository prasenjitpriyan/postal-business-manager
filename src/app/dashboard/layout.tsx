'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Users, FileText, Home, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // In a real app we'd rely on middleware, but Zustand gives us client-side checks
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">Postal Business</h1>
          <p className="text-sm text-slate-400">Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Home className="w-5 h-5 text-slate-400" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/officials" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Users className="w-5 h-5 text-slate-400" />
            <span>Officials</span>
          </Link>
          <Link href="/dashboard/contributions" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <FileText className="w-5 h-5 text-slate-400" />
            <span>Contributions</span>
          </Link>
          <Link href="/dashboard/reports" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <FileText className="w-5 h-5 text-slate-400" />
            <span>Reports</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            {/* Add user menu dropdown here later */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
