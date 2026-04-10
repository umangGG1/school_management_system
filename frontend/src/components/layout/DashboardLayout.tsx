import type { ReactNode } from 'react';
import { Sidebar, type NavItem } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  color: string;
  navItems: NavItem[];
  portalName: string;
  pageTitle: string;
  children: ReactNode;
}

export function DashboardLayout({
  color,
  navItems,
  portalName,
  pageTitle,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar color={color} navItems={navItems} portalName={portalName} />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header pageTitle={pageTitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
