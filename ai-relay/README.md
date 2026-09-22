# Logger.One AI relay

One serverless function. Its only job: let Logger.One's browser code call
OpenAI / Gemini / Claude / Perplexity, even though three of those four
block direct browser requests (CORS). This function does the same request
server-side instead (server-to-server calls aren't subject to CORS), and
hands the response back.

It stores nothing -- no API keys, no accounts. Every call carries its own
`endpoint`/`headers`/`body`, supplied fresh by Logger.One each time.

This lives as a subfolder of the main Logger.One repo, but is deployed as
its own separate Vercel project -- `cd` into `ai-relay` specifically
before running any `vercel` command below, not the repo root, or Vercel
will try to deploy the whole PWA instead of just this function.

## Deploy (one-time)

1. Install nothing globally -- `npx` runs the Vercel CLI without a
   permanent install.
2. From this folder (`Project 7 - LoggerDotOne\ai-relay`):
   ```
   npx vercel
   ```
3. It'll print a login URL -- open it, sign in (or create a free Vercel
   account), then come back to the terminal.
4. Answer its setup prompts with the defaults (link to a new project, keep
   the detected settings).
5. It deploys and prints a URL like `https://logger-one-ai-relay-xxxx.vercel.app`.
   For a stable one that doesn't change on redeploy, also run:
   ```
   npx vercel --prod
   ```
   and use the resulting `https://<project-name>.vercel.app` URL.
6. Paste that URL into Logger.One's AI settings as the relay endpoint.

## Updating

If `relay.js` ever changes, redeploy with `npx vercel --prod` from this
folder again -- no need to repeat the login/setup.

## Security note

`ALLOWED_ORIGIN` in `relay.js` is locked to
`https://kaebie17.github.io` -- only browser code running on that origin
can use this relay. `ALLOWED_HOSTS` further restricts what it will
forward requests to (only the four AI providers' actual API hosts), so it
can't be used as a general-purpose open proxy even by someone who finds
the URL directly.
