import React from "react"
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula, lightfair } from "react-syntax-highlighter/dist/esm/styles/hljs"

const JsCodeContainer = ({ t, isDarkMode, isLoading, responseResult, areTextsWrapped, isJSCodeCopied, changeTextView, copyToClipboard }) => {
  if (isLoading) {
    return (
      <article className="flex flex-col h-[40vh] lg:h-full bg-yellow-100 dark:bg-yellow-900 duration-200 overflow-hidden">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">script.js</h5>
        <div className="code-thumbnail flex-auto h-0 flex flex-col w-full p-2 overflow-y-auto" style={{ animation: "shimmer 1s ease-out infinite" }}>
          <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-5/6 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-4/5 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-3/4 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-2/3 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-1/2 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-2/3 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-3/4 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-4/5 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-5/6 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
          <span className="w-full p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        </div>
      </article>
    )
  } else if (responseResult.includes('<script>')) {
    const jsOnly = `${responseResult.replace(/^[\s\S]*?<script>|<\/script>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```[\s\S]*$/gm, '').trim()}`
    const downloadJSOnly = () => {
      const blob = new Blob([jsOnly], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'script.js'
      link.click()
      URL.revokeObjectURL(url)
    }
    return (
      <article className="flex flex-col h-[40vh] lg:h-full bg-yellow-100 dark:bg-yellow-900 duration-200">
        <section className="flex flex-nowrap items-center justify-between border-b border-b-black dark:border-b-white py-0.5 overflow-x-auto">
          <h5 className="px-1 text-black dark:text-white">script.js</h5>
          <div className="flex items-center px-1 text-cyan-900 dark:text-gray-50">
            <button className={areTextsWrapped ? "flex items-center justify-center mx-0.5 px-2 py-1 bg-cyan-900/25 active:bg-cyan-900/50 dark:bg-white/50 dark:active:bg-white/25 rounded duration-200" : "flex items-center justify-center px-2 py-1 hover:bg-cyan-900/25 active:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200"} onClick={changeTextView}>
              <p className="hidden md:block text-xs pr-1">Wrap Text</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/wrap-text-icon.svg`} alt="Wrap Text" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/wrap-text-icon-dark.svg`} alt="Wrap Text" />
            </button>
            <button className="flex items-center justify-center mx-0.5 px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200" onClick={event => {
              event.preventDefault()
              copyToClipboard('JS')
            }}>
              <p className="hidden md:block text-xs pr-1">{isJSCodeCopied ? t('copy_code.0') : t('copy_code.1')}</p>
              <img className="dark:hidden h-5 object-contain" src={isJSCodeCopied ? `${import.meta.env.BASE_URL}images/checked-icon.svg` : `${import.meta.env.BASE_URL}images/copy-icon.svg`} alt="Copy Code" />
              <img className="hidden dark:block h-5 object-contain" src={isJSCodeCopied ? `${import.meta.env.BASE_URL}images/checked-icon-dark.svg` : `${import.meta.env.BASE_URL}images/copy-icon-dark.svg`} alt="Copy Code" />
            </button>
            <button className="flex items-center justify-center px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200" onClick={downloadJSOnly.bind(this)}>
              <p className="hidden md:block text-xs pr-1">{t('download_code')}</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/download-icon.svg`} alt="Download Code" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/download-icon-dark.svg`} alt="Download Code" />
            </button>
          </div>
        </section>
        <div className="js-code-content flex-auto h-0 w-screen lg:w-full text-sm leading-tight">
          <SyntaxHighlighter language="javascript" style={isDarkMode ? darcula : lightfair} customStyle={{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }} showLineNumbers wrapLongLines={areTextsWrapped} wrapLines={areTextsWrapped}>
            {jsOnly}
          </SyntaxHighlighter>
        </div>
      </article>
    )
  } else {
    return (
      <article className="h-[40vh] lg:h-full bg-yellow-100 dark:bg-yellow-900 duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">script.js</h5>
      </article>
    )
  }
}

export default JsCodeContainer