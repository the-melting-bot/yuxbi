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
      <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="27" height="27" rx="8" stroke="currentColor" stroke-width="2" opacity="0.45" stroke-dasharray="3 4"/>
        <path d="M8 10L16 20L24 10" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
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
    transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
  }

  .nav.scrolled {
    background: rgba(255, 246, 223, 0.9);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 2px solid rgba(31, 47, 86, 0.18);
    box-shadow: 0 8px 0 rgba(31, 47, 86, 0.08);
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
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .logo:hover {
    transform: scale(1.05);
  }

  .logo:hover .logo-icon {
    filter: drop-shadow(0 0 8px rgba(53, 104, 235, 0.35));
  }

  .logo-icon {
    transition: filter 0.3s ease;
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
    position: relative;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.3s ease;
    padding: 6px 10px;
    border-radius: 999px;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 999px;
    border: 2px solid transparent;
    background: rgba(53, 104, 235, 0.08);
    opacity: 0;
    transition: opacity 0.25s ease, border-color 0.25s ease;
  }

  .nav-link:hover {
    color: var(--color-accent);
  }

  .nav-link:hover::after {
    opacity: 1;
    border-color: rgba(53, 104, 235, 0.2);
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
