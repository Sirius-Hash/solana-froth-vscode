<script lang="ts">
  import { onMount } from "svelte";

  enum Status {
    Disabled,
    Loading,
    Connected,
    Failed,
  }

  import Loader from "./Loader.svelte";
  import InfoScreen from "./InfoScreen.svelte";
  import DisabledScreen from "./DisabledScreen.svelte";
  import "sidebar.css";

  let solanaCliVersion = "";
  let status = Status.Loading;
  $: statusText = getStatusText(status);
  $: statusClass = getStatusClass(status);

  onMount(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "status":
          status = message.value;
          break;

        case "solanaCliVersion":
          solanaCliVersion = message.value;
          break;
      }
    });
  });

  const getStatusText = (status: Status) => {
    switch (status) {
      case Status.Loading:
        return "CONNECTING...";

      case Status.Connected:
        return "CONNECTED";

      case Status.Failed:
      case Status.Disabled:
      default:
        return "NOT CONNECTED";
    }
  };

  const getStatusClass = (status: Status) => {
    switch (status) {
      case Status.Loading:
        return "loading";

      case Status.Connected:
        return "connected";

      case Status.Failed:
        return "error";

      case Status.Disabled:
      default:
        return "disabled";
    }
  };
</script>

<div class="flex-col">
  <div class="status-box">
    <div class={`icon ${statusClass}`}>
      <i class="codicon codicon-circle-filled" />
    </div>
    <div class="status-text">{statusText}</div>
  </div>

  <div class="flex-col">
    {#if status === Status.Loading}
      <Loader />
    {:else if status === Status.Connected}
      <InfoScreen />
    {:else if status === Status.Disabled}
      <DisabledScreen />
    {:else}
      <div>Something goes wrong...</div>
    {/if}
  </div>

  <div class="bottom-box">
    <hr />
    <div class="cli-box">
      <div>
        <button
          on:click={() => {
            tsvscode.postMessage({
              type: "refresh",
              value: "",
            });
          }}
        >
          Refresh
        </button>
      </div>
      <div class="cli-version">
        {solanaCliVersion}
      </div>
    </div>
  </div>
</div>
