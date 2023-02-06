import * as vscode from "vscode";
import * as cp from "child_process";
import { SidebarProvider } from "./SidebarProvider";

enum Status {
  Disabled,
  Loading,
  Connected,
  Failed,
}

let intervalIdSolanaCliShell: NodeJS.Timer;

const execShell = (cmd: string) =>
  new Promise<string>((resolve, reject) => {
    cp.exec(cmd, (err, out) => {
      if (err) {
        return reject(err);
      }
      return resolve(out);
    });
  });

const setLoadingStatus = (value: Status, sidebarProvider: SidebarProvider) => {
  sidebarProvider._view?.webview.postMessage({
    type: "status",
    value,
  });
};

const runSolanaCliShell = async (sidebarProvider: SidebarProvider) => {
  try {
    const currentDir = await execShell("solana -V");
    sidebarProvider._view?.webview.postMessage({
      type: "solanaCliVersion",
      value: currentDir,
    });

    setLoadingStatus(Status.Connected, sidebarProvider);

    const config = await execShell("solana config get");
    sidebarProvider._view?.webview.postMessage({
      type: "config",
      value: config,
    });

    const jsonRpcUrl = await execShell("solana config get json_rpc_url");
    sidebarProvider._view?.webview.postMessage({
      type: "configJsonRpcUrl",
      value: jsonRpcUrl,
    });

    const epochInfo = await execShell("solana epoch-info");
    sidebarProvider._view?.webview.postMessage({
      type: "epochInfo",
      value: epochInfo,
    });

    // WALLET
    const walletAddress = await execShell("solana address");
    sidebarProvider._view?.webview.postMessage({
      type: "walletAddress",
      value: walletAddress,
    });

    const walletBalance = await execShell("solana balance");
    sidebarProvider._view?.webview.postMessage({
      type: "walletBalance",
      value: walletBalance,
    });

    if (walletAddress) {
      const walletTXHistory = await execShell(
        `solana transaction-history ${walletAddress}`
      );
      sidebarProvider._view?.webview.postMessage({
        type: "walletTXHistory",
        value: walletTXHistory,
      });
    }
  } catch (error) {
    // if CLI failed to run assume CLI isn't installed
    if (error instanceof Error) {
      const notFoundMsg = "command not found";

      if (error.message.includes(notFoundMsg)) {
        setLoadingStatus(Status.Disabled, sidebarProvider);
      }
    }
  }
};

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  setTimeout(async () => {
    setLoadingStatus(Status.Loading, sidebarProvider);
    runSolanaCliShell(sidebarProvider);
  }, 500);

  intervalIdSolanaCliShell = setInterval(function () {
    runSolanaCliShell(sidebarProvider);
  }, 5000);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "solana-froth-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("solana-froth.refresh", async () => {
      setLoadingStatus(Status.Loading, sidebarProvider);
      runSolanaCliShell(sidebarProvider);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("solana-froth.refresh-view", async () => {
      await vscode.commands.executeCommand("workbench.action.closeSidebar");
      await vscode.commands.executeCommand(
        "workbench.view.extension.sidebar-view"
      );

      // setTimeout(() => {
      //   vscode.commands.executeCommand(
      //     "workbench.action.webview.openDeveloperTools"
      //   );
      // }, 500);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("solana-froth.airdropSol", async () => {
      try {
        vscode.window.showInformationMessage(
          `Solana Froth: Requesting airdrop of 1 SOL.`
        );

        const result = await execShell("solana airdrop 1");
        vscode.window.showInformationMessage(`Solana Froth: ${result}`);
        console.log("result: ", result);
      } catch (error) {
        // if CLI failed to run assume CLI isn't installed
        if (error instanceof Error) {
          const notFoundMsg = "command not found";

          if (error.message.includes(notFoundMsg)) {
            // setLoadingStatus(Status.Disabled, sidebarProvider);
          }
          vscode.window.showInformationMessage(
            `Solana Froth: ${error.message}`
          );
        }
      } finally {
        sidebarProvider._view?.webview.postMessage({
          type: "airdropSolDone",
          value: true,
        });
      }
    })
  );
}

// This method is calle d when your extension is deactivated
export function deactivate() {
  clearInterval(intervalIdSolanaCliShell);
}
