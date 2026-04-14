<script lang="ts">
  import '$lib/styles/global.css';
  import type { Snippet } from 'svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<LoadingScreen />
<div class="noise-overlay" aria-hidden="true"></div>

{@render children()}
