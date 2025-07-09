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

## Deploying to Firebase Hosting

You can run `pnpm run deploy` to build and deploy the IWA.

The first time you deploy, the helper script `setup-site.sh` will prompt you to
create a new site in Firebase Hosting, and will set it up in `firebase.json` for
you.

This builds the project both as a static site and as the `iwa.swbn` bundle, and
deploys both to the Firebase Hosting site. The bundle will be available at
`https://your-site.web.app/iwa.swbn`.

## Signing the IWA

The `create-dot-env` hook in `.idx/dev.nix` creates a `.env` file when you first
open this project in Firebase Studio.

The `.env` includes the `SIGNING_KEY` used to sign the output IWA bundle.
Remember to keep this key somewhere safe as it uniquely identifies your IWA.

## Installing the IWA

Navigate to `chrome://web-app-internals`, find "Install IWA via Dev Mode Proxy",
and paste in the the addresss to your site `https://your-site.web.app`.
