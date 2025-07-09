# Sample IWA

<a href="https://studio.firebase.google.com/import?url=https%3A%2F%2Fgithub.com%2Fedman%2Fsample-iwa">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://cdn.firebasestudio.dev/btn/open_dark_32.svg">
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://cdn.firebasestudio.dev/btn/open_light_32.svg">
    <img
      height="32"
      alt="Open in Firebase Studio"
      src="https://cdn.firebasestudio.dev/btn/open_blue_32.svg">
  </picture>
</a>

This is a sample app intended to be used as a base for developing demo IWAs.

## Deploying the app

*   `pnpm run deploy` - builds and deploys the IWA.

The first time you deploy the helper will prompt you to create a new site in
Firebase Hosting, and will set it up in the code for you.

This deploys a static site that you can browse as a normal website or install as
an IWA "Dev Mode Proxy" at `https://your-site.web.app`.

## Releasing IWA bundles

*   `pnpm run build:release` - creates a new signed bundle for the IWA in
    `./releases`.
*   (optional) `pnpm run deploy` - deploy the IWA and the new bundle.

This also updates `./releases/update_manifest.json`.

## Installing the IWA

### Via dev mode proxy

*   (optional) Deploy the static files with `pnpm run deploy`
*   Navigate to `chrome://web-app-internals`
*   Find "Install IWA via Dev Mode Proxy"
*   Paste in the the addresss to your site `https://your-site.web.app`

### Via update manifest

*   (optional) Generate a new release bundle with `pnpm run build:release`
*   (optional) Deploy the bundle with `pnpm run deploy`
*   Navigate to `chrome://web-app-internals`
*   Find "Install IWA from Update Manifest"
*   Paste in the the addresss to your manifest
    `https://your-site.web.app/releases/update_manifest.json`

## How is the IWA signed?

When you first open this project in Firebase Studio, the `create-dot-env` hook
in `.idx/dev.nix` generates a `.env` file.

This `.env` includes the `SIGNING_KEY` used to sign the output IWA bundle.
Remember to keep this key somewhere safe as it uniquely identifies your IWA.
