<script lang="ts">
  import '$lib/styles/global.css';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="noise-overlay" aria-hidden="true"></div>
<div class="scanlines" aria-hidden="true"></div>

{@render children()}
