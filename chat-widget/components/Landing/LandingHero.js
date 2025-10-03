export default function LandingHero() {
  return (
    <section className="text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-text-primary)]">
        African Vibes Support
      </h1>
      <p className="mt-4 text-base md:text-lg text-[var(--color-text-secondary)]">
        Get instant answers about hosting events, tickets, accounts, and payments.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <a href="#" className="px-6 py-3 rounded-lg bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-light)] transition">
          Start chatting
        </a>
        <a href="#features" className="px-6 py-3 rounded-lg border border-[var(--color-card-border)] text-[var(--color-text)] hover:bg-[var(--color-card-border)] transition">
          Learn more
        </a>
      </div>
    </section>
  );
}


