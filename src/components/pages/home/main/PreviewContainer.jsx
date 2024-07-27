import React from "react"

const PreviewContainer = ({ isLoading, responseResult }) => {
  if (isLoading) {
    return (
      <article className="h-[60vh] lg:h-full bg-white dark:bg-black duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">Web Preview</h5>
        <h3 className="grid grid-flow-row items-center justify-center gap-1 h-1/3 w-3/4">
          <span className="w-full p-3 bg-black/50 dark:bg-white/50 rounded-xl animate-pulse duration-500"></span>
          <span className="w-full p-3 bg-black/50 dark:bg-white/50 rounded-xl animate-pulse duration-500"></span>
          <span className="w-5/6 p-3 bg-black/50 dark:bg-white/50 rounded-xl animate-pulse duration-500"></span>
        </h3>
      </article>
    )
  } else if (responseResult.includes('<html')) {
    const normalizedResponseResult = `<html>${responseResult.replace(/^[\s\S]*?<html>|<\/html>[\s\S]*$/gm, '').trim().replace(/```/gm, '').replace(/``/gm, '').replace(/html\s*/gm, '').replace(/<>\s*/gm, '')}</html>`
    return (
      <article className="flex flex-col h-[60vh] lg:h-full bg-white dark:bg-black duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">Web Preview</h5>
        <iframe title="Web Preview" srcDoc={normalizedResponseResult} className="w-full grow" frameborder="0"></iframe>
      </article>
    )
  } else {
    return (
      <article className="h-[60vh] lg:h-full bg-white dark:bg-black duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">Web Preview</h5>
        <p className="grid items-center justify-center w-full h-full text-center text-black dark:text-white">{responseResult}</p>
      </article>
    )
  }
}

export default PreviewContainer