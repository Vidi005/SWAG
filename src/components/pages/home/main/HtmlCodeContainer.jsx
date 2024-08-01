import React from "react"
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula, lightfair } from "react-syntax-highlighter/dist/esm/styles/hljs"

const HtmlCodeContainer = ({ isDarkMode, isLoading, responseResult }) => {
  if (isLoading) {
    <article className="flex flex-col h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200 overflow-hidden">
      <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">index.html</h5>
      <div className="code-thumbnail flex-auto h-0 flex flex-col w-full p-2" style={{ animation: "shimmer 1.5s ease-out infinite" }}>
        <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-5/6 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-4/5 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-3/4 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-2/3 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-2/3 ml-auto p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-3/4 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-4/5 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-5/6 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
        <span className="w-full p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
      </div>
    </article>
  } else if (responseResult.includes('<html')) {
    const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    const htmlOnly = normalizedResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
    return (
      <article className="flex flex-col h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200">
        <section className="flex flex-nowrap items-center justify-between border-b border-b-black dark:border-b-white py-0.5 overflow-x-auto">
          <h5 className="px-1 text-black dark:text-white">index.html</h5>
          <div className="flex items-center text-cyan-900 dark:text-gray-50">
            <button className="flex items-center justify-center px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200">
              <p className="hidden md:block text-xs pr-1">Wrap Text</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/wrap-text-icon.svg`} alt="Wrap Text" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/wrap-text-icon-dark.svg`} alt="Wrap Text" />
            </button>
            <button className="flex items-center justify-center mx-0.5 px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200">
              <p className="hidden md:block text-xs pr-1">Copy</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/copy-icon.svg`} alt="Copy Code" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/copy-icon-dark.svg`} alt="Copy Code" />
            </button>
            <button className="flex items-center justify-center px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200">
              <p className="hidden md:block text-xs pr-1">Download</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/download-icon.svg`} alt="Download Code" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/download-icon-dark.svg`} alt="Download Code" />
            </button>
          </div>
        </section>
        <div className="code-content flex-auto h-0 w-full text-sm leading-tight">
          <SyntaxHighlighter language="html" style={isDarkMode ? darcula : lightfair} customStyle={{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }} showLineNumbers>
            {htmlOnly}
          </SyntaxHighlighter>
        </div>
      </article>
    )
  } else {
    return (
      <article className="h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">index.html</h5>
      </article>
    )
  }
}

export default HtmlCodeContainer