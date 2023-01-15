<script lang="ts">
  import { onMount } from "svelte";

  let walletAddress = "";
  let walletBalance = "NaN"; // this value is set intentionally
  let walletAddressShort = "loading...";

  onMount(() => {
    // Handle messages sent from the extension to the webview
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.type) {
        case "walletAddress":
          walletAddress = message.value;
          if (walletAddress) {
            walletAddressShort = `${walletAddress.slice(
              0,
              4
            )} *** ${walletAddress.slice(-5)}`;
          }
          break;

        case "walletBalance":
          walletBalance = message.value.replace("SOL", "").trim();
          break;
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
</script>

<div class="bottom-box">
  <h2>🔏 Wallet</h2>

  <div class="wallet-card">
    <div class="wallet-box">
      <div class="address-short">{walletAddressShort}</div>

      <div>
        <button
          disabled={!walletAddress?.length}
          on:click={copyAddressToClipboard}>copy</button
        >
      </div>
    </div>

    <div class="wallet-box balance-header">
      <div class="title">Wallet Balance</div>
      <!-- <div>
        <button disabled>airdrop 1 SOL</button>
      </div> -->
    </div>

    <div class="wallet-balance">
      <div>{walletBalance}</div>
      <div class="sol-text">SOL</div>
    </div>
  </div>
</div>
