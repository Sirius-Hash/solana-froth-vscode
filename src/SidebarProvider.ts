import * as vscode from "vscode";
import { getNonce } from "./getNounce";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "refresh": {
          await vscode.commands.executeCommand("solana-froth.refresh");
          break;
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onAddressCopiedToClipboard": {
          if (!data.value) {
            vscode.window.showErrorMessage("Sorry, can't get the address.");
            return;
          }
          vscode.window.showInformationMessage(
            `Wallet address is copied to clipboard:\n ${data.value}`
          );
          break;
        }
        case "airdropSol": {
          await vscode.commands.executeCommand("solana-froth.airdropSol");
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "sidebar.css")
    );

    const styleWalletUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "wallet.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "sidebar.js")
    );

    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "codicons",
        "codicon.css"
      )
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${styleWalletUri}" rel="stylesheet">
        <link href="${codiconsUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
