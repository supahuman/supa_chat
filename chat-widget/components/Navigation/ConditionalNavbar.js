'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Hide navbar on dashboard pages and auth pages
  const isDashboardPage = pathname?.startsWith('/agent-builder');
  const isAuthPage = pathname?.startsWith('/signup') || pathname?.startsWith('/login');
  
  if (isDashboardPage || isAuthPage) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;
