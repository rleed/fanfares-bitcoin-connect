![image](https://github.com/getAlby/bitcoin-connect/assets/33993199/e99f0651-25a5-47cb-bd58-c75360517dfe)

# Bitcoin Connect

This project includes web components for connecting to Lightning wallets and enabling [WebLN](https://webln.guide). Websites only need to implement a single interface to connect with multiple wallets (WebLN), and users can connect from both desktop and mobile devices. These components work with pure HTML and all Javascript libraries or frameworks, such as React, Angular, Vue, Solid.js, etc.

🆕 Bitcoin Connect also supports a nice invoice payment UI that gives a multitude of options to a user to pay an invoice. Accept payments with a single line of code.

## 🛝 Try it out

[Demo](https://bitcoin-connect.com)

## 🧳 Migration Guide

There are multiple breaking changes in **v3**. See our migration guide [here](doc/MIGRATION_v3.md). Click [here](https://github.com/getAlby/bitcoin-connect/tree/v2.4.2-alpha) for v2.

## 🚀 Quick Start

> 🚧WARNING🚧: this package is currently in Alpha. It's got awesome features, but is using new features of protocols such as WebLN and NWC which have not been finalized, and there may be breaking changes or bugs.

### React Package

`npm install @getalby/bitcoin-connect-react` or `yarn add @getalby/bitcoin-connect-react`

### Web Components Package

`npm install @getalby/bitcoin-connect` or `yarn add @getalby/bitcoin-connect`

### HTML (CDN)

You can use Bitcoin Connect without any build tools:

> NOTE: LNC connector is currently not supported! See [#85](https://github.com/getAlby/bitcoin-connect/issues/85)

```html
<script src="https://cdn.jsdelivr.net/npm/@getalby/bitcoin-connect@2.4.2/dist/index.browser.js"></script>
```

## 🤙 Usage

### Pure JS

```ts
import {
  init,
  launchModal,
  requestProvider,
} from '@getalby/bitcoin-connect-react';

// Initialize Bitcoin Connect
init({
  appName: 'My Lightning App', // your app name
});

// launch a payment flow
await launchModal({invoice: 'lnbc...'});

// or request a WebLN provider to use the full WebLN API
const weblnProvider = await requestProvider();
const {preimage} = await weblnProvider.sendPayment('lnbc...');
```

_Continue further down for the full Bitcoin Connect API._

### React

```jsx
import {Button, init, launchModal, closeModal, requestProvider} from '@getalby/bitcoin-connect-react';

// Initialize Bitcoin Connect
init({
  appName: "My Lightning App", // your app name
})

// request a provider
<button onClick={() => {
  // if no WebLN provider exists, it will launch the modal
  const weblnProvider = await requestProvider();
  const { preimage } = await weblnProvider.sendPayment("lnbc...")
}}>
  Request WebLN provider
</button>

// render the Bitcoin Connect button
<Button onConnect={(provider) => {
  provider.sendPayment("lnbc...")
}} />

// render a payment component on its own
<SendPayment invoice="lnbc..."/>

// open modal programmatically to pay an invoice
<button onClick={() => launchModal({invoice: "lnbc..."})}>
  Programmatically launch modal
</button>

// close modal programmatically
closeModal();
```

#### React SSR / NextJS

Make sure to only render the components **client side**. This can be done either by creating a wrapper component with 'use client' directive (NextJS app directory) or by using next/dynamic.

### Other Frameworks

> 💡 The core Bitcoin Connect package works on all frameworks because it is powered by web components. However, a wrapper can simplify usage of Bitcoin Connect.

_Use another popular framework? please let us know or feel free to create a PR for a wrapper. See the React package for an example implementation._

### Pure HTML

#### Components

Bitcoin Connect exposes the following web components for allowing users to connect their desired Lightning wallet:

- `<bc-button/>` - launches the Bitcoin Connect Modal on click
- `<bc-send-payment/>` - render a payment request UI
  - Arguments:
    - `invoice` - BOLT11 invoice
    - `paid` - (optional) show the paid state e.g. if the payment was executed from a mobile device
- _more components coming soon_

### Bitcoin Connect API

#### Initializing Bitcoin Connect

```ts
import {init} from '@getalby/bitcoin-connect-react';

// Initialize Bitcoin Connect
init({
  appName: 'My Lightning App', // your app name
  // filters: ["nwc"],
  // showBalance: true,
});
```

- `appName` - Name of the app requesting access to wallet. Currently used for NWC connections (Alby and Mutiny)
- `filters` - Filter the type of connectors you want to show. Example: "nwc" (only show NWC connectors).
- `showBalance` - If false, do not request the connected wallet's balance

#### Requesting a provider

With one line of code you can ensure you have a WebLN provider available and ready to use. If one is not available, the Bitcoin connect modal will be launched.

```ts
import {requestProvider} from '@getalby/bitcoin-connect';

const provider = await requestProvider();
await provider.sendPayment('lnbc...');
```

#### Programmatically launching the modal

The modal can then be launched with:

```ts
import {launchModal} from '@getalby/bitcoin-connect';

launchModal(); // A `<bc-modal/>` element will be injected into the DOM
```

`launchModal` can also take an optional options object:

```ts
import {launchModal} from '@getalby/bitcoin-connect';

launchModal({
  invoice: 'lnbc...', // bolt11 invoice
});
```

#### Programmatically closing the modal

```ts
import {closeModal} from '@getalby/bitcoin-connect';

closeModal();
```

#### Disconnect from wallet

```ts
import {disconnect} from '@getalby/bitcoin-connect';

disconnect();
```

#### Check connection status

`window.bitcoinConnect.isConnected();`

#### Events

##### onConnected

This event fires when a WebLN provider is made available.

- When a user connects for the first time
- On page reload when a user has previously connected

```ts
import {onConnected} from '@getalby/bitcoin-connect';

const unsub = onConnected(async (provider) => {
  const {preimage} = await provider.sendPayment('lnbc...');
});
unsub();
```

##### onConnecting

This event fires when a WebLN provider is initializing.

- When a user connects for the first time
- On page reload when a user has previously connected

```ts
import {onConnecting} from '@getalby/bitcoin-connect';

const unsub = onConnecting(async () => {
  // do something...
});
unsub();
```

##### onDisconnected

This event fires when the user manually disconnects from Bitcoin Connect.

```ts
import {onDisconnected} from '@getalby/bitcoin-connect';

const unsub = onDisconnected(async () => {
  // do something...
});
unsub();
```

##### onModalOpened

This event fires when the Bitcoin Connect modal opens.

```ts
import {onModalOpened} from '@getalby/bitcoin-connect';

const unsub = onModalOpened(async () => {
  // do something...
});
unsub();
```

##### onModalClosed

This event fires when the Bitcoin Connect modal closes.

```ts
import {onModalClosed} from '@getalby/bitcoin-connect';

const unsub = onModalClosed(async () => {
  // do something...
});
unsub();
```

### WebLN global object

> WARNING: webln is no longer injected into the window object by default. If you need this, execute the following code:

```ts
import {onConnected} from '@getalby/bitcoin-connect';

onConnected((provider) => {
  window.webln = provider;
});
```

#### WebLN events

Providers also should fire a `webln:connected` event. See `webln.guide`.

_More methods coming soon. Is something missing that you'd need? let us know!_

### Styling

These variables must be set at the root or on a container element wrapping any bitcoin connect components.

```css
html {
  --bc-color-brand: #196ce7;
}
```

Optional CSS variables for further customization:

```css
html {
  --bc-color-brand-dark: #3994ff; /* use a different brand color in dark mode */
  --bc-brand-mix: 100%; /* how much to mix the brand color with default foreground color */
}
```

> 💡 using near-white or black brand colors? either set a lower `bc-brand-mix` or make sure to use an off-white for `bc-color-brand` and off-black for `bc-color-brand-dark` to avoid conflicts with the modal background color.

### Dark mode

#### Automatic (Recommended)

Bitcoin Connect uses `prefers-color-scheme` to automatically detect light/dark mode.

#### Manual

In case your site uses a manual theme switcher, you can force a theme by following these steps:

> see an example [here](./dev/vite/index.html)

1. set `globalThis.bcDarkMode = "class"` **before** any bitcoin connect components are rendered
2. `"dark"` must be added as a classname to the document to enable dark mode (e.g. `<html class="dark">` or `document.documentElement.classList.add('dark')`) otherwise light mode will be forced.

## Access to underlying providers (NWC, LNC etc.)

```ts
import { WebLNProviders, requestProvider } from "@getalby/bitcoin-connect";

const provider = await requestProvider();

if (provider instanceof WebLNProviders.NostrWebLNProvider) {
  provider.nostrWalletConnectUrl;
}

if (provider instanceof WebLNProviders.LNCWebLNProvider) {
  provider.lnc.lnd.lightning.listInvoices(...);
}

if (provider instanceof WebLNProviders.LnbitsWebLNProvider) {
  provider.requestLnbits('GET', '/api/v1/wallet');
}
```

## Demos

### Pure HTML Demo

See [Pure HTML](./demos/html/README.md)

> [Example codepen](https://codepen.io/rolznz/pen/ZEmXGLd)

### React Demo

See [React](./demos/react/README.md)

> [Example replit](https://replit.com/@rolznz/make-me-an-image-nwc-version)

### More demos

Open [demos](demos/README.md)

## 🛠️ Development

### Install

Run `yarn install && (cd dev/vite && yarn install)`

### Run Vite

Run `yarn dev`

### Other dev options

Open [dev](dev/README.md)

### Production Build

`yarn build`

### Build (Watch mode - no pure html support)

`yarn dev:build`

### Build (Watch mode - with pure html support)

`yarn dev:build:browser`

### Testing

`yarn test`

## Need help?

We are happy to help, please contact us or create an issue.

- [Twitter: @getAlby](https://twitter.com/getAlby)
- [Telegram group](https://t.me/getAlby)
- support at getalby.com
- [bitcoin.design](https://bitcoin.design/) Discord community (find us on the #alby channel)
- Read the [Alby developer guide](https://guides.getalby.com/overall-guide/alby-for-developers/getting-started) to better understand how Alby packages and APIs can be used to power your app.

## FAQ

### How does it work?

Bitcoin Connect provides multiple options to the user to connect to a lightning wallet, each compatible with WebLN. Any already-existing providers of WebLN (such as an installed WebLN extension like Alby) are detected and offered, as well as options to create a new WebLN provider through protocols such as NWC. No matter which option you choose, a WebLN provider will become available for the website to use to interact with your lightning wallet. Similar to the Alby extension, new options (called Connectors) can be easily added as they all follow a common, simple interface. As long as there is a way to connect to a lightning wallet through Javascript, a connector can be created for it in Bitcoin Connect. We welcome any and all contributions for new connectors!

### Does this work on mobile browsers and mobile PWAs, or desktop browsers without a WebLN extension?

Yes! that's the main benefit.

### Does it work with a desktop extension enabled?

Yes. It will use the desktop extension as the default connector if it exists.

### Can I connect it to my mobile wallet?

That depends. The connection to your lightning node / wallet needs to be asynchronous so that you can use Bitcoin Connect natively on mobile websites or PWAs.

### Can a user connect any lightning wallet?

It will only work for the connectors that are shown in the modal. Some of these connectors (e.g. the Alby Browser Extension) allow to connect multiple wallets themselves. Feel free to contribute to add a new connector.

### Does it "remember" the user if they leave the page or close the browser?

Yes. Your connection is saved to localStorage

### Is this safe?

You should have a certain level of trust on the website you decide to connect your wallet with, and that they ensure there is no malicious third-party scripts which would intend to read the wallet connection configuration, either from memory or storage. Connectors with budget controls or confirmation dialogs (Alby extension or NWC) are recommend so you have full control over your connection.

### What are the high level things I need to do to add this to my site?

1. add the "Connect Wallet" button
2. wait for a connection event (using window.addEventListener) and then request to pay the invoice with window.webln

### What connectors are supported?

- [Alby Browser extension](https://getalby.com)
- [Alby NWC](https://nwc.getalby.com)
- [LNC](https://github.com/lightninglabs/lightning-node-connect)
- [LNbits](https://lnbits.com/)
- [Mutiny NWC URL](https://www.mutinywallet.com/)
- [Generic NWC URL](https://github.com/nostr-protocol/nips/blob/master/47.md)

### If a user pays with another wallet why does the modal stay open?

Bitcoin Connect cannot detect payments made externally. It's up to your app to detect the payment and then programmatically close the modal using the exposed `closeModal` function.

### Why is window.webln not set after connecting?

The global `window.webln` object can be overridden if there are multiple providers, leading to unexpected behaviour. We recommend using the `requestProvider` function to obtain a WebLN provider instead of relying on the global window object.

### Why does Bitcoin Connect not work on some pages?

Bitcoin Connect must be imported at the root component or on every component that requires webln to ensure webln is available. If you only import the button in your settings page, you'll still need to import the library where you want to make a lightning payment. We recommend using the `requestProvider` function.

## Known Issues

- NWC connectors do not work on iOS in non-secure contexts because window.crypto.subtle is unavailable. If testing on your phone, please run an https server or use an https tunnel.

## 🔥 Lit

This project is powered by Lit.

See [Get started](https://lit.dev/docs/getting-started/) on the Lit site for more information.

## License

[MIT](./LICENSE)
