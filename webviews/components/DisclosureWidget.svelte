<script>
  export let title = "";
  export let description = "";
</script>

{#if description}
  <details class="disclosure-widget">
    <summary>{title}</summary>
    <div class="description">
      <pre>{description.trim()}</pre>
    </div>
  </details>
{/if}
