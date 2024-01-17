import { STATUS_FINISHED, STATUS_PROCESSING, STATUS_ERROR, MESSAGE_START } from '$config';

self.onmessage = (e) => {
  // Check possible messages coming from the website
  switch (e.data.task) {
    case MESSAGE_START:
      const { time } = e.data;
      // Return a message that the task is about to start.
      postMessage({ status: STATUS_PROCESSING, message: `Task started with time = ${time}` });
      // Start the long running function.
      longRunningFunction(time);
      break;
    default:
      postMessage({ status: STATUS_ERROR, message: 'Unknown task name.' });
  }
};

async function longRunningFunction(time = 100) {
  const total = 100;
  for (let i = 0; i < total; i++) {
    // The next bit is just to put a delay in every loop
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
    // Send a message to the website with the current progress
    postMessage({ status: STATUS_PROCESSING, step: i + 1, total });
  }
  // Send a message that the task is finished
  postMessage({ status: STATUS_FINISHED, result: time * total, message: `Task finished with time = ${time}` });
}
