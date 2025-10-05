'use client';

import { FileText, Link, Upload, MessageSquare } from 'lucide-react';
import { Tabs } from '@/ui';

const KnowledgeTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'text', label: 'Text Knowledge', icon: FileText },
    { id: 'links', label: 'Website Links', icon: Link },
    { id: 'files', label: 'File Uploads', icon: Upload },
    { id: 'qa', label: 'Q&A Pairs', icon: MessageSquare }
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export default KnowledgeTabs;
