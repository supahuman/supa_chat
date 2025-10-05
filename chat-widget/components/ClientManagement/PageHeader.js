'use client';

const PageHeader = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        Client Management
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
        Manage your chatbot clients, configure databases and LLM providers, and test connections. 
        Each client can have their own database and AI model configuration.
      </p>
    </div>
  );
};

export default PageHeader;
