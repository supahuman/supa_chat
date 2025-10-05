'use client';

import { useState } from 'react';
import TeachHeader from './TeachHeader';
import ChatInterface from './ChatInterface';
import TrainingExamples from './TrainingExamples';

const TeachYourAgent = () => {
  const [trainingExamples, setTrainingExamples] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);

  const handleSaveExample = (example) => {
    const newExample = {
      id: Date.now().toString(),
      customerMessage: example.customerMessage,
      agentResponse: example.agentResponse,
      createdAt: new Date().toISOString(),
      rating: 'good'
    };
    setTrainingExamples([...trainingExamples, newExample]);
    setCurrentChat([]);
  };

  const handleDeleteExample = (id) => {
    setTrainingExamples(trainingExamples.filter(example => example.id !== id));
  };

  const handleRateExample = (id, rating) => {
    setTrainingExamples(trainingExamples.map(example => 
      example.id === id ? { ...example, rating } : example
    ));
  };

  const handleLoadExample = (example) => {
    setCurrentChat([
      { type: 'customer', message: example.customerMessage },
      { type: 'agent', message: example.agentResponse, isEditable: true }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-divider pb-4">
        <h3 className="heading-lg">
          Teach Your Agent
        </h3>
        <p className="text-sm text-secondary mt-1">
          Train your AI agent by having conversations and showing it the right responses. Create training examples to improve its performance.
        </p>
      </div>

      {/* Header with Stats */}
      <TeachHeader 
        examplesLength={trainingExamples.length}
      />

      {/* Chat Interface */}
      <ChatInterface
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        onSaveExample={handleSaveExample}
      />

      {/* Training Examples */}
      <TrainingExamples
        examples={trainingExamples}
        onDelete={handleDeleteExample}
        onRate={handleRateExample}
        onLoad={handleLoadExample}
      />
    </div>
  );
};

export default TeachYourAgent;
