# 🌊 Solana Froth Sidebar

<img width="1068" alt="Screenshot 2023-01-20 at 2 34 38 PM" src="https://user-images.githubusercontent.com/188568/213696229-0b39de74-863b-492e-add8-c15d35339f4f.png">

## Motivation

The main motivation for this vscode extention is to create simple UI for interaction with local Solana CLI and local wallets.
Working/developing app with Solana locally requires person constantly repeat same CLI commands to show / update Solana config information or active wallet details. Instead Solana Froth VSCode will just show you often needed info and buttons for most common operations with it.

The project is open-sourced. It is open and welcomed for contribution by anyone.

## The Plan

- [ ] **Phase 1** display Solana' configs & wallet info in VSCode sidebar in simplest form.
- [ ] **Phase 2** is about adding basic interaction with CLI. e.g. change network from sidebar, change active wallet with dropdown/open dialog, create new wallet, etc.
- [ ] **Phase 3** is about listing info about Solana program you currently develop. Add basic actions like build, deploy, test.
- [ ] **Pahse 4** is about adding similar fn for Anchor apps.

# How to build

1. run webpack watch

```shell
npm run watch
```

2. then start debug version of VS Code with `F5` key.

after any change-save you can update debug window focusing it and pressing `CMD + R`.
