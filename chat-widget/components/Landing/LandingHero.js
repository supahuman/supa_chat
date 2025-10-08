export default function LandingHero() {
  return (
    <section className="text-center">
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-[var(--color-text-primary)]">
        African Vibes Support
      </h1>
      <p className="mt-4 text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
        Get instant answers about hosting events, tickets, accounts, and payments.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <a href="#" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-light)] transition text-center">
          Start chatting
        </a>
        <a href="#features" className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[var(--color-card-border)] text-[var(--color-text)] hover:bg-[var(--color-card-border)] transition text-center">
          Learn more
        </a>
      </div>
    </section>
  );
}


