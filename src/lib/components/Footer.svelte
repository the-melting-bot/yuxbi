<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="27" height="27" rx="8" stroke="currentColor" stroke-width="2" opacity="0.45" stroke-dasharray="3 4"/>
            <path d="M8 10L16 20L24 10" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="24" r="1.5" fill="var(--color-accent)"/>
          </svg>
          <span class="footer-name">yuxbi</span>
        </div>
        <p class="footer-tagline">Weird ideas, clean apps.</p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4 class="footer-col-title">Lab</h4>
          <a href="#experiments" class="footer-link">Experiments</a>
          <a href="#transmissions" class="footer-link">Transmissions</a>
          <a href="#manifesto" class="footer-link">Manifesto</a>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-title">Signal</h4>
          <span class="footer-link footer-link--muted">More experiments soon</span>
          <span class="footer-link footer-link--muted">API access coming</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span class="footer-copy">© {year} Yuxbi</span>
      <span class="footer-attribution">
        Built by <a href="https://themeltingbot.com" class="footer-attrib-link" target="_blank" rel="noopener noreferrer">The Melting Bot</a>
      </span>
    </div>
  </div>
</footer>

<style>
  .footer {
    padding-block: var(--space-16) var(--space-8);
    background: linear-gradient(180deg, #ffffff 0%, #fff5de 100%);
    border-top: 2px solid rgba(31, 47, 86, 0.14);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    gap: var(--space-12);
    padding-bottom: var(--space-12);
    border-bottom: 2px dashed rgba(31, 47, 86, 0.18);
    margin-bottom: var(--space-8);
  }

  .footer-brand {
    max-width: 280px;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-text-bright);
    margin-bottom: var(--space-3);
  }

  .footer-name {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }

  .footer-tagline {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
    line-height: 1.6;
  }

  .footer-links {
    display: flex;
    gap: var(--space-16);
  }

  .footer-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .footer-col-title {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
  }

  .footer-link {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: inline-block;
  }

  a.footer-link:hover {
    color: var(--color-accent);
    transform: translateX(3px);
  }

  .footer-link--muted {
    color: var(--color-text-faint);
    font-style: italic;
    opacity: 0.85;
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-copy {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }

  .footer-attribution {
    font-size: var(--text-xs);
    color: var(--color-text-faint);
  }

  .footer-attrib-link {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-attrib-link:hover {
    color: var(--color-accent);
  }

  @media (max-width: 640px) {
    .footer-inner {
      flex-direction: column;
      gap: var(--space-8);
    }

    .footer-links {
      gap: var(--space-8);
    }

    .footer-bottom {
      flex-direction: column;
      gap: var(--space-3);
      text-align: center;
    }
  }
</style>
