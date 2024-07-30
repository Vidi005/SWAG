import React from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { darcula, lightfair } from "react-syntax-highlighter/dist/esm/styles/hljs"

const HtmlCodeContainer = ({ isLoading, responseResult }) => {
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
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">index.html</h5>
        <div className="code-content dark:hidden flex-auto h-0 w-full">
          <SyntaxHighlighter language="html" style={lightfair} customStyle={{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }} showLineNumbers>
            {htmlOnly}
          </SyntaxHighlighter>
        </div>
        <div className="code-content hidden dark:block flex-auto h-0 w-full">
          <SyntaxHighlighter language="html" style={darcula} customStyle={{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }} showLineNumbers>
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