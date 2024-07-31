// import { highlight, languages } from 'prismjs/components/prism-core'
// import 'prismjs/components/prism-javascript'
// import 'prismjs/themes/prism.css'

// import { Prism } from "react-syntax-highlighter"
// import style from "react-syntax-highlighter/dist/esm/styles/hljs/dracula"

// const createSyntaxHighlighterWorker = () => {
//   // const prism = new Prism('text', { language:"html", style:style, customStyle:{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }, showLineNumbers })
//   // prism
//   // const workerScript = `
//   //   importScripts(${Prism.toString()})
//   //   self.onmessage = function(e) {
//   //     const { codeString, language, style } = e.data
//   //     const highlightedCode = new Prism(codeString, { language:"html", customStyle:{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }, showLineNumbers })
//   //     self.postMessage(highlightedCode)
//   //   }
//   // `
//   const workerScript = `
//     self.onmessage = function(e) {
//       const { codeString } = e.data
//       const highlightedCode = 
//       self.postMessage(highlightedCode)
//     }
//   `
//   const blob = new Blob([workerScript], { type: 'application/javascript' })
//   return new Worker(URL.createObjectURL(blob))
// }

/*
  const result = await model.generateContentStream([`${userPrompt}.\n${this.state.filteredPrompt}`, ...imageParts], { signal: signal.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (signal.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({ currentPrompt: '', responseResult: text, isLoading: false, isGenerating: true })
          }
          this.setState({ isGenerating: false })
*/

const createStreamingMultiModalWorker = () => {
  const workerScript = `
    self.onmessage = function(e) {
      const { generatedPrompt, imagePart, model } = e.data
      const result = model.generateContentStream([generatedPrompt, ...imagePart])
      let text = ''
      for (const chunk of result.stream) {
        const chunkText = chunk.text()
        text += chunkText
        self.postMessage(text)
      }
    }
  `
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

const createStreamingTextOnlyWorker = () => {
  const workerScript = `
    self.onmessage = function(e) {
      const { generatedPrompt, model } = e.data
        const result = model.generateContentStream(generatedPrompt)
        let text = ''
        for (const chunk of result.stream) {
          const chunkText = chunk.text()
          text += chunkText
          self.postMessage(text)
        }
    }
  `
  const blob = new Blob([workerScript], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

// const createHtmlHighlighterWorker = () => {
//   const workerScript = `
//     self.onmessage = function(e) {
//       const { codeString } = e.data
//       const highlightedCode = codeString.replace(/<style>[\\s\\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\\s\\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\\s\\S]*?<\/style>/gi, '').trim()
//       self.postMessage(highlightedCode)
//     }
//   `
//   const blob = new Blob([workerScript], { type: 'application/javascript' })
//   return new Worker(URL.createObjectURL(blob))
// }

// const createCssHighlighterWorker = () => {
//   const workerScript = `
//     self.onmessage = function(e) {
//       const { codeString } = e.data
//       const highlightedCode = codeString.replace(/^[\\s\\S]*?<style>|<\/style>[\\s\\S]*$/gm, '')
//       .replace(/\\n    /gm, '\\n'
//       .trim()
//       self.postMessage(highlightedCode)
//     }
//   `
//   const blob = new Blob([workerScript], { type: 'application/javascript' })
//   return new Worker(URL.createObjectURL(blob))
// }

// const createJsHighlighterWorker = () => {
//   const workerScript = `
//     self.onmessage = function(e) {
//       const { codeString } = e.data
//       const highlightedCode = codeString.replace(/^[\\s\\S]*?<script>|<\/script>[\\s\\S]*$/gm, '')
//       .replace(/\\n    /gm, '\\n')
//       .replace(/\`\`\`[\\s\\S]*$/gm, '')
//       .trim()
//       self.postMessage(highlightedCode)
//     }
//   `
//   const blob = new Blob([workerScript], { type: 'application/javascript' })
//   return new Worker(URL.createObjectURL(blob))
// }

export { createStreamingMultiModalWorker, createStreamingTextOnlyWorker }