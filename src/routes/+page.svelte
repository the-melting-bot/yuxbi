<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import About from '$lib/components/About.svelte';
  import Experiments from '$lib/components/Experiments.svelte';
  import Transmissions from '$lib/components/Transmissions.svelte';
  import Manifesto from '$lib/components/Manifesto.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Yuxbi — Weird ideas, clean apps.</title>
  <meta name="description" content="Yuxbi is a digital lab for strange but useful experiments. One-purpose tools built from ideas too weird for anywhere else." />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Yuxbi — Weird ideas, clean apps." />
  <meta property="og:description" content="A digital lab for strange but useful experiments. One-purpose tools built from ideas too weird for anywhere else." />
  <meta property="og:site_name" content="Yuxbi" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Yuxbi — Weird ideas, clean apps." />
  <meta name="twitter:description" content="A digital lab for strange but useful experiments. One-purpose tools built from ideas too weird for anywhere else." />

  <!-- Theme -->
  <meta name="theme-color" content="#fff6df" />
</svelte:head>

<Nav />

<main>
  <Hero />
  <About />
  <Experiments />
  <Transmissions />
  <Manifesto />
</main>

<Footer />
