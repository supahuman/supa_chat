'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Hide navbar on dashboard pages
  const isDashboardPage = pathname?.startsWith('/agent-builder');
  
  if (isDashboardPage) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar;
