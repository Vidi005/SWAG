import React from "react"

const HtmlCodeContainer = ({ isLoading, responseResult }) => {
  if (isLoading) {
    <article className="flex flex-col h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200 overflow-hidden">
      <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">HTML Code</h5>
      <div className="code-thumbnail grow flex flex-col w-full p-2" style={{ animation: "shimmer 1.5s ease-out infinite" }}>
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
    const normalizedResponseResult = `<html>${responseResult.replace(/^[\s\S]*?<html>|<\/html>[\s\S]*$/gm, '').trim().replace(/```/gm, '').replace(/``/gm, '').replace(/html\s*/gm, '').replace(/<>\s*/gm, '')}</html>`
    const htmlOnly = normalizedResponseResult.replace(/<script>[\s\S]*?<\/script>/gi, '').replace(/<style>[\s\S]*?<\/style>/gi, '')
    return (
      <article className="flex flex-col h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">HTML Code</h5>
        <pre className="flex-auto h-0 w-full p-2 font-mono text-orange-900 dark:text-orange-50 overflow-auto">{htmlOnly}</pre>
      </article>
    )
  } else {
    return (
      <article className="h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">HTML Code</h5>
      </article>
    )
  }
}

export default HtmlCodeContainer