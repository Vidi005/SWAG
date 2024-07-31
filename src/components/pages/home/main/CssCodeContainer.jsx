import React from "react"
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter"
import { darcula, lightfair } from "react-syntax-highlighter/dist/esm/styles/hljs"

const CssCodeContainer = ({ isDarkMode, isLoading, responseResult }) => {
  if (isLoading) {
    <article className="flex flex-col h-[40vh] lg:h-full bg-cyan-100 dark:bg-cyan-900 duration-200 overflow-hidden">
      <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">style.css</h5>
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
  } else if (responseResult.includes('<style>')) {
    const cssOnly = `${responseResult.replace(/^[\s\S]*?<style>|<\/style>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```/gm, '').trim()}`
    return (
      <article className="flex flex-col h-[40vh] lg:h-full bg-cyan-100 dark:bg-cyan-900 duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">style.css</h5>
        <div className="code-content flex-auto h-0 w-full">
          <SyntaxHighlighter language="css" style={isDarkMode ? darcula : lightfair} customStyle={{ maxHeight: '100%', width: '100%', padding: '4px', overflow: 'auto' }} showLineNumbers>
            {cssOnly}
          </SyntaxHighlighter>
        </div>
      </article>
    )
  } else {
    return (
      <article className="h-[40vh] lg:h-full bg-cyan-100 dark:bg-cyan-900 duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">style.css</h5>
      </article>
    )
  }
}

export default CssCodeContainer