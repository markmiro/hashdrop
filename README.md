# Hardhat tutorial for beginners

Following this tutorial:
https://hardhat.org/tutorial

GITHUB repo:
https://github.com/nomiclabs/hardhat/tree/website/docs/tutorial

## Getting started

```
npm install
```

## Compile

```
npx hardhat compile
```

or

```
npm run build
```

## Test

```
npx hardhat test
```

or

```
npm test
```

## Deploy

Because the frontend uses a generated file from hardhat, make sure to do a contract deploy before doing a frontend deploy.

### Local

Make sure local node is running:

```
npm run node
```

Local deploy doesn't deploy in some remote network. Everything is still local. The following deploys contracts to the locally running node.

```
% npm run deploy:local

> hashdrop@1.0.0 deploy:local
> hardhat run scripts/deploy.js --network localhost

Hello address: 0xabc123abc123abc123abc123abc123abc123abc1
Returns:  Hello there
```

Run the app:

```
npm run frontend
```

Open the page to http://localhost:3000 in the Brave Browser / Chrome

Check MetaMask to make sure the network is connected to `localhost:8545`

### Ropsten

I mostly use this to test with Vercel, so we'll do a preview deploy.

```
% npm run deploy:ropsten

> hashdrop@1.0.0 deploy:ropsten
> hardhat run scripts/deploy.js --network ropsten

Hello address: 0xdef123def123def123def123def123def123def1
Returns:  Hello there
```

```
% cd frontend
% vercel
> UPDATE AVAILABLE Run `yarn add vercel@latest` to install Vercel CLI 23.1.2
> Changelog: https://github.com/vercel/vercel/releases/tag/vercel@23.1.2
Vercel CLI 23.0.1
🔍  Inspect: https://vercel.com/markmiro/hashdrop/9tH8DrB7LN793ALoAJA6iufdgouw [781ms]
✅  Preview: https://hashdrop-markmiro.vercel.app [copied to clipboard] [2m]
📝  To deploy to production (hashdrop.vercel.app), run `vercel --prod`
```

Open the page to https://hashdrop-markmiro.vercel.app in the Brave Browser / Chrome

Check MetaMask to make sure the network is connected to `Ropsten`

Reload the page if it wasn't on Ropsten on load.

### Mainnet

To deploy on Mainnet, you need to set the `.env` file. See `.env.example` to see what it's supposed to look like.

You'll need the private key from MetaMask:

```
MAINNET_PRIVATE_KEY=
```

Open up MetaMask in the browser, select an account on the Mainnet network that has some eth. Make sure it's a hot wallet for spending and not a wallet that holds your eth savings. Then click ︙-> Account details -> Export Private Key

Copy this private key into the `.env` file.

```
% npm run deploy:mainnet

> hashdrop@1.0.0 deploy:mainnet
> hardhat run scripts/deploy.js --network mainnet

Hello address: 0xdef456def456def456def456def456def456def4
Returns:  Hello there
```

Next, deploy the frontend:

```
% cd frontend
% vercel --prod
Vercel CLI 23.0.1
🔍  Inspect: https://vercel.com/markmiro/hashdrop/6ZHs5nrDtPy8XHfBA2ifRLDRDFEh [2s]
✅  Production: https://hashdrop.vercel.app [copied to clipboard] [37s]
```

Open the page to https://hashdrop.vercel.app.

Make sure the MetaMask network is `Ethereum Mainnet`.

Reload the page if it wasn't on Mainnet on load.

# How this project was setup

1. Setup basic system using `npx hardhat` and choose "Create a sample project".
1. [Add TypeScript support](https://hardhat.org/guides/typescript.html#typescript-support).
