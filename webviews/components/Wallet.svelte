<script lang="ts">
  import { onMount } from "svelte";

  const loadingWalletBalance = "-";
  let walletAddress = "";
  let walletBalance = loadingWalletBalance;
  let walletAddressShort = "loading...";
  let airdropInProgress = false;
  let ifMainnet = true;

  onMount(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "configJsonRpcUrl":
          ifMainnet = message.value?.includes("mainnet") ? true : false;
          break;
        case "walletAddress":
          if (message.value !== walletAddress) {
            walletBalance = loadingWalletBalance;
            walletAddress = message.value;
            if (walletAddress) {
              walletAddressShort = `${walletAddress.slice(
                0,
                4
              )} *** ${walletAddress.slice(-5)}`;
            }
          }

          break;

        case "walletBalance":
          walletBalance = message.value.replace("SOL", "").trim();
          break;
        case "airdropSolDone":
          airdropInProgress = false;
      }
    });
  });

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      tsvscode.postMessage({
        type: "onAddressCopiedToClipboard",
        value: walletAddress,
      });
    });
  };

  const airdropSol = () => {
    airdropInProgress = true;
    tsvscode.postMessage({
      type: "airdropSol",
      value: null,
    });
  };
</script>

<div class="bottom-box">
  <h2>🔏 Wallet</h2>

  <div class="wallet-card">
    <div class="wallet-box">
      <div class="address-short">{walletAddressShort}</div>

      <div>
        <button
          class="icon-button"
          on:click={copyAddressToClipboard}
          title="Copy Wallet Address"
          disabled={!walletAddress?.length}
        >
          <i class="codicon codicon-copy" />
        </button>
      </div>
    </div>

    <div class="wallet-box balance-header">
      <div class="title">Wallet Balance</div>
      {#if !ifMainnet}
        <div>
          <button
            disabled={!walletAddress?.length || airdropInProgress}
            on:click={airdropSol}>airdrop 1 SOL</button
          >
        </div>
      {/if}
    </div>

    <div class="wallet-balance">
      <div>{walletBalance}</div>
      <div class="sol-text">SOL</div>
    </div>
  </div>
</div>
