<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { STATUS_FINISHED, STATUS_PROCESSING, STATUS_IDLE, MESSAGE_START } from '$config';

  /**
   * @type {Worker} Variable that will point to the web worker instance
   */
  let worker;
  /**
   * @type {Number} The delay each of the 100 loops in the worker has
   */
  let time = 300;
  /**
   * @type {Number} Counting the progress of the worker
   */
  let step = 0;
  /**
   * @type {Number} The total number of steps of the worker
   */
  let total = 0;
  /**
   * @type {Number|undefined} The end result the worker returns.
   */
  let result;
  /**
   * @type {String} The current status of the worker.
   */
  let workerStatus = STATUS_IDLE;
  /**
   * @type {String} Holds messages that are returend by the worker.
   */
  let workerMessage;

  async function initWebWorker() {
    // This function initiates the web worker
    if (browser) {
      // Check if we are in a browser
      if (window.Worker) {
        // Check if the browser supports web worker
        // We reset some values we use to visualise the progress
        workerStatus = STATUS_IDLE;
        step = 0;
        total = 0;
        result = undefined;
        // This is where we load the worker
        const MyWorker = await import('$workers/worker.js?worker');
        // And initiate the worker
        worker = new MyWorker.default();

        // The following part is called when the worker sends a message
        worker.onmessage = function (e) {
          // Let’s first get the status and the message from the event’s data
          const { status, message } = e.data;
          // We use these two variables on the website
          if (message) {
            workerMessage = message;
          }
          if (status) {
            workerStatus = status;
          }
          // This checks what the status of the message is
          switch (status) {
            case STATUS_FINISHED:
              // Save the result returned from the web worker
              result = e.data.result;
              break;
            case STATUS_PROCESSING:
              // Save the current step number and total number of steps
              step = e.data.step ?? 0; // Set to 0 instead of undefined if something went wrong
              total = e.data.total ?? 0;
              break;
          }
        };
      }
    }
  }

  onMount(() => {
    // Initiate the web worker when the component in mounted
    initWebWorker();
  });

  onDestroy(() => {
    // Terminate any web worker task that might be running when the component is destroyed.
    terminateWorker();
  });

  async function startWorker() {
    // This function first checks if any worker is present
    if (worker) {
      // If there is a worker currently running
      if (workerStatus === STATUS_PROCESSING) {
        // Stop the currently runnning worker
        await stopWorker();
      }
      // Start the (new) task
      worker.postMessage({ task: MESSAGE_START, time: time++ });
    }
  }

  async function stopWorker() {
    // This seams to be the least hacky way of stopping a worker.
    // It would be nice to just cancel the function instead of terminating and reinitiating the worker.
    terminateWorker();
    await initWebWorker();
  }

  function terminateWorker() {
    // Check if there is a worker present. This is sometimes nessecary when parts of the website reload.
    if (worker) {
      worker.terminate();
    }
  }
</script>

<svelte:head>
  <title>Web Worker in Sveltekit</title>
</svelte:head>

<div class="flex w-full h-dvh items-center justify-center">
  <div class="p-6 bg-gray-50 rounded flex flex-col gap-y-4 min-w-[500px] shadow-xl border border-gray-150">
    <h1 class="text-xl font-bold">Web Worker in Sveltekit</h1>
    <p class="max-w-prose text-sm">
      This is a simple setup that demonstrates the use of <a class="underline decoration-blue-700" href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers"
        >web workers</a
      > in Sveltekit.
    </p>

    <dl class="grid grid-cols-2 items-center text-sm">
      <dt>worker status</dt>
      <dd><pre>{workerStatus}</pre></dd>
      <dt>worker message</dt>
      <dd><pre>{workerMessage}</pre></dd>
      <dt>result</dt>
      <dd><pre>{result}</pre></dd>
    </dl>

    <progress class="accent-blue w-full bg-white border border-gray-200 rounded" max={total} value={step} />

    <div class="grid grid-cols-2 gap-x-2 w-full">
      <button disabled={!Boolean(worker)} on:click={startWorker}>start worker</button>
      <button disabled={Boolean(worker) && workerStatus !== STATUS_PROCESSING} on:click={stopWorker}>stop worker</button>
    </div>
    <footer>
      <span class="text-sm"
        >See the source code at <a class="underline decoration-blue-700" href="https://github.com/jnsprnw/webworker-sveltekit">https://github.com/jnsprnw/webworker-sveltekit</a>.</span
      >
    </footer>
  </div>
</div>

<style>
  button {
    @apply bg-blue-700 text-white rounded p-2 disabled:text-gray-200 disabled:bg-gray-400 hover:enabled:bg-blue-800 transition-colors;
  }

  pre {
    @apply text-xs font-mono;
  }
</style>
