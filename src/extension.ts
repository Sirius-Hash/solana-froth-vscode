import * as vscode from "vscode";
import * as cp from "child_process";
import { SidebarProvider } from "./SidebarProvider";

const execShell = (cmd: string) =>
  new Promise<string>((resolve, reject) => {
    cp.exec(cmd, (err, out) => {
      if (err) {
        return reject(err);
      }
      return resolve(out);
    });
  });

const runSolanaCliShell = async (sidebarProvider: SidebarProvider) => {
  const config = await execShell("solana config get");
  sidebarProvider._view?.webview.postMessage({
    type: "config",
    value: config,
  });

  const epochInfo = await execShell("solana epoch-info");
  sidebarProvider._view?.webview.postMessage({
    type: "epochInfo",
    value: epochInfo,
  });

  const jsonRpcUrl = await execShell("solana config get json_rpc_url");
  sidebarProvider._view?.webview.postMessage({
    type: "configJsonRpcUrl",
    value: jsonRpcUrl,
  });

  const currentDir = await execShell("solana -V");
  sidebarProvider._view?.webview.postMessage({
    type: "solanaCliVersion",
    value: currentDir,
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
};

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  setTimeout(async () => {
    runSolanaCliShell(sidebarProvider);
  }, 500);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "solana-froth-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("solana-froth.refresh", async () => {
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
}

// This method is calle d when your extension is deactivated
export function deactivate() {}
