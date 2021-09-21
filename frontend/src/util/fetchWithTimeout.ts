// https://davidwalsh.name/fetch-timeout
export async function fetchWithTimeout(url: string, timeout: number = 3000) {
  let didTimeout = false;
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      reject(new Error("Request timed out."));
    }, timeout);

    fetch(url)
      .then((res) => {
        clearTimeout(timeoutId);
        if (!didTimeout) {
          resolve(res);
        }
      })
      .catch((err) => {
        if (didTimeout) return;
        reject(err);
      });
  });
}
