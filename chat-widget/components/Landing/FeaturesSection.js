export default function FeaturesSection() {
  return (
    <section id="features" className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-xl border border-[var(--color-card-border)]">
        <h3 className="font-semibold mb-2">AI-Powered Answers</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Fast, relevant responses powered by Groq + RAG.</p>
      </div>
      <div className="p-6 rounded-xl border border-[var(--color-card-border)]">
        <h3 className="font-semibold mb-2">Knowledge Base</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Backed by curated docs and crawled help content.</p>
      </div>
      <div className="p-6 rounded-xl border border-[var(--color-card-border)]">
        <h3 className="font-semibold mb-2">Conversation History</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Pick up where you left off with session-aware chats.</p>
      </div>
    </section>
  );
}


