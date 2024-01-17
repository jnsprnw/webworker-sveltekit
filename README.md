# Web Worker in Sveltekit

Find a live version on [Netlify](https://webworker-sveltekit.netlify.app/).

This is a simple setup that demonstrates the use of [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) in Sveltekit. Most parts apply to any framework.

Web workers allow you to run a task in a separate process from the rest of the website. This prevents the website from hanging and not allowing any user interaction.

Things you need to know to understand this demo

1. The website and it’s web workers communicate using messages.
2. The web worker must be imported and started asynchronously.
3. Web workers can only run in the browser.
4. The only elegant way to stop a running task that I could find is to kill the whole worker. Please let me know if you find a better way.

The interesting files are `src/routes/+page.svelte` and `src/lib/workers/worker.js`.

## Running this demo

Once you've created a project and installed dependencies with `bun install` (or `npm install`), start a development server:

```bash
bun run dev
```
