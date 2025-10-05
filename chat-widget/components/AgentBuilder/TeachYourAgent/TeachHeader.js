'use client';

import { GraduationCap, MessageSquare } from 'lucide-react';

const TeachHeader = ({ 
  examplesLength
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="heading-sm">Training Examples</h4>
            <p className="text-sm text-secondary">
              {examplesLength} conversation{examplesLength !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="heading-sm">Interactive Training</h4>
            <p className="text-sm text-secondary">
              Chat with your agent and teach it responses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachHeader;
