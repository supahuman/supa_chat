export default function FeaturesSection() {
  return (
    <section id="features" className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      <div className="p-4 sm:p-6 rounded-xl border border-[var(--color-card-border)]">
        <h3 className="font-semibold mb-2 text-sm sm:text-base">AI-Powered Answers</h3>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Fast, relevant responses powered by Groq + RAG.</p>
      </div>
      <div className="p-4 sm:p-6 rounded-xl border border-[var(--color-card-border)]">
        <h3 className="font-semibold mb-2 text-sm sm:text-base">Knowledge Base</h3>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Backed by curated docs and crawled help content.</p>
      </div>
      <div className="p-4 sm:p-6 rounded-xl border border-[var(--color-card-border)] sm:col-span-2 md:col-span-1">
        <h3 className="font-semibold mb-2 text-sm sm:text-base">Conversation History</h3>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Pick up where you left off with session-aware chats.</p>
      </div>
    </section>
  );
}


