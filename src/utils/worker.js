const createIframeWorker = () => {
  const workerScript = `
    self.onmessage = function(event) {
      const { htmlString } = event.data
      self.postMessage(htmlString)
    }
  `
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

const createPromptAndResultWorker = () => {
  const workerScript = `
  `
}

export { createIframeWorker, createPromptAndResultWorker }