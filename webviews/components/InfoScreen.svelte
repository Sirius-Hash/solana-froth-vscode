<script lang="ts">
  import { onMount } from "svelte";
  import DisclosureWidget from "./DisclosureWidget.svelte";
  import Wallet from "./Wallet.svelte";

  let configNetworkName = "";
  let epochInfo = "";
  let walletTXHistory = "";
  let config = "";
  let configJsonRpcUrl = "";

  onMount(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "configJsonRpcUrl":
          configJsonRpcUrl = message.value?.split("URL:")[1];
          configNetworkName = configJsonRpcUrl?.split("api.")[1].split(".")[0];
          break;

        case "config":
          config = message.value;
          break;

        case "epochInfo":
          epochInfo = message.value;
          break;

        case "walletTXHistory":
          walletTXHistory = message.value;
          break;
      }
    });
  });
</script>

<div class="network-box">
  {#if configJsonRpcUrl}
    <div class="network">
      <h2>{configNetworkName}</h2>
      <p>{configJsonRpcUrl}</p>
    </div>
  {/if}

  <DisclosureWidget title="Config File" description={config} />

  <DisclosureWidget title="Epoch Info" description={epochInfo} />

  <DisclosureWidget
    title="Wallet Transaction History"
    description={walletTXHistory}
  />
</div>

<Wallet />
