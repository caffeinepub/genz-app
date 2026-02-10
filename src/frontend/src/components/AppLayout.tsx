import { type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SupportDrawer } from './support/SupportDrawer';
import { UserRole } from '../backend';

interface AppLayoutProps {
  children: ReactNode;
  currentPage?: string;
  onNavigate?: (page: any, params?: any) => void;
  userRole?: UserRole;
}

export function AppLayout({ children, currentPage, onNavigate, userRole }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header currentPage={currentPage} onNavigate={onNavigate} userRole={userRole} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SupportDrawer />
    </div>
  );
}
