import React from "react"

const PreviewContainer = ({ isLoading, responseResult }) => {
  if (isLoading) {
    return (
      <article className="flex flex-col h-[60vh] lg:h-full bg-white dark:bg-black duration-200 overflow-hidden">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">Web Preview</h5>
        <div className="preview-thumbnail grow flex flex-col w-full" style={{ animation: "shimmer 1.5s ease-out infinite" }}>
          <section className="thumbnail-header w-full p-3 bg-black/50 dark:bg-white/50"></section>
          <section className="thumbnail-main grow flex w-full">
            <div className="aside flex flex-col w-1/5 border-r border-r-black/50 dark:border-r-white/50 p-4 overflow-y-auto">
              <div className="aspect-square w-full bg-black/50 dark:bg-white/50 rounded-xl p-2"></div>
              <br />
              <h3 className="flex flex-col items-center justify-between gap-1 grow w-full">
                <span className="w-full p-1.5 bg-black/50 dark:bg-white/50 rounded-md"></span>
                <span className="w-full p-1.5 bg-black/50 dark:bg-white/50 rounded-md"></span>
                <span className="w-full p-1.5 bg-black/50 dark:bg-white/50 rounded-md"></span>
                <span className="w-3/4 mr-auto p-1.5 bg-black/50 dark:bg-white/50 rounded-md"></span>
              </h3>
            </div>
            <div className="article flex flex-col w-4/5 p-2">
              <div className="flex items-center w-full h-1/6 pb-2">
                <div className="aspect-square h-full bg-black/50 dark:bg-white/50 rounded-md"></div>
                <h4 className="flex flex-col items-center justify-center grow w-3/4 px-2">
                  <span className="w-full mb-2 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-full p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                </h4>
              </div>
              <hr />
              <div className="w-full h-5/6 py-4">
                <p className="flex flex-col items-center justify-center grow w-full">
                  <span className="w-11/12 ml-auto mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-full mb-3 p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                  <span className="w-3/4 mr-auto p-1 bg-black/50 dark:bg-white/50 rounded-xl"></span>
                </p>
              </div>
            </div>
          </section>
          <section className="thumbnail-footer w-full p-2 bg-black/50 dark:bg-white/50"></section>
        </div>
      </article>
    )
  } else if (responseResult.includes('<html')) {
    const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    return (
      <article className="flex flex-col h-[60vh] lg:h-full bg-white dark:bg-black duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">Web Preview</h5>
        <iframe title="Web Preview" srcDoc={normalizedResponseResult} className="w-full grow" frameborder="0"></iframe>
      </article>
    )
  } else {
    return (
      <article className="flex flex-col h-[60vh] lg:h-full bg-white dark:bg-black duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">Web Preview</h5>
        <p className="grow grid items-center justify-center w-full text-center text-black dark:text-white">{responseResult}</p>
      </article>
    )
  }
}

export default PreviewContainer