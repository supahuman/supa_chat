'use client';

import { useState } from 'react';
import { Bot, Database, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Button, LoadingSpinner } from '@/ui';

const ClientCard = ({ 
  client, 
  isActive, 
  onSelect, 
  onTestDatabase, 
  onTestLLM 
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async (type) => {
    setTesting(true);
    const success = await (type === 'database' ? onTestDatabase() : onTestLLM());
    setTestResult(success ? 'success' : 'error');
    setTesting(false);
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
      isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Bot className={`w-6 h-6 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{client.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{client.description || 'No description'}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>{client.vectorDB?.type || 'Unknown'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{client.llm?.provider || 'Unknown'}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span>ID: {client.clientId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => handleTest('database')}
            disabled={testing}
            variant="secondary"
            size="xs"
            title="Test Database Connection"
            icon={testing ? LoadingSpinner : testResult === 'success' ? CheckCircle : testResult === 'error' ? XCircle : null}
          >
            {testing ? '' : testResult === 'success' ? '' : testResult === 'error' ? '' : 'Test DB'}
          </Button>

          <Button
            onClick={() => handleTest('llm')}
            disabled={testing}
            variant="secondary"
            size="xs"
            title="Test LLM Connection"
            icon={testing ? LoadingSpinner : testResult === 'success' ? CheckCircle : testResult === 'error' ? XCircle : null}
          >
            {testing ? '' : testResult === 'success' ? '' : testResult === 'error' ? '' : 'Test LLM'}
          </Button>

          <Button
            onClick={onSelect}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
          >
            {isActive ? 'Active' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
