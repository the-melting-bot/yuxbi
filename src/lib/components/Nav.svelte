<script lang="ts">
  let scrolled = $state(false);

  function handleScroll() {
    scrolled = window.scrollY > 50;
  }

  $effect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav class="nav" class:scrolled aria-label="Main navigation">
  <div class="nav-inner container">
    <a href="/" class="logo" aria-label="Yuxbi home">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
        <path d="M8 10L16 20L24 10" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="16" cy="24" r="1.5" fill="var(--color-accent)"/>
      </svg>
      <span class="logo-text">yuxbi</span>
    </a>
    <div class="nav-links">
      <a href="#experiments" class="nav-link">Experiments</a>
      <a href="#transmissions" class="nav-link">Transmissions</a>
      <a href="#manifesto" class="nav-link">Manifesto</a>
    </div>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: var(--space-4) 0;
    transition: background 0.3s ease, backdrop-filter 0.3s ease;
  }

  .nav.scrolled {
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text-bright);
    text-decoration: none;
  }

  .logo-text {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }

  .nav-links {
    display: flex;
    gap: var(--space-8);
  }

  .nav-link {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color var(--transition-interactive);
  }

  .nav-link:hover {
    color: var(--color-accent);
  }

  @media (max-width: 640px) {
    .nav-links {
      gap: var(--space-4);
    }
    .nav-link {
      font-size: var(--text-xs);
    }
  }
</style>
