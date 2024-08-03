import React from "react"

const PreviewContainer = ({ t, isLoading, responseResult, areCodesCopied, copyToClipboard, openDownloadModal, saveTempWebPreview }) => {
  if (isLoading) {
    return (
      <article className="flex flex-col h-[60vh] lg:h-full bg-white dark:bg-black duration-200 overflow-hidden">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">{t('web_preview_title')}</h5>
        <div className="preview-thumbnail grow flex flex-col w-full" style={{ animation: "shimmer 1s ease-out infinite" }}>
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
        <section className="flex flex-nowrap items-center justify-between border-b border-b-black dark:border-b-white py-0.5 overflow-x-auto">
          <h5 className="px-1 text-black dark:text-white">{t('web_preview_title')}</h5>
          <div className="flex items-center px-1 text-cyan-900 dark:text-gray-50">
            <button className="flex items-center justify-center px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200" onClick={event => {
              event.preventDefault()
              copyToClipboard('All')
            }}>
              <p className="hidden md:block text-xs pr-1">{areCodesCopied ? t('copy_all_code.0') : t('copy_all_code.1')}</p>
              <img className="dark:hidden h-5 object-contain" src={areCodesCopied ? `${import.meta.env.BASE_URL}images/checked-icon.svg` : `${import.meta.env.BASE_URL}images/copy-icon.svg`} alt="Copy Code" />
              <img className="hidden dark:block h-5 object-contain" src={areCodesCopied ? `${import.meta.env.BASE_URL}images/checked-icon-dark.svg` : `${import.meta.env.BASE_URL}images/copy-icon-dark.svg`} alt="Copy Code" />
            </button>
            <button className="flex items-center justify-center mx-1 px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200" onClick={openDownloadModal}>
              <p className="hidden md:block text-xs pr-1">{t('download_code_modal')}</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/download-icon.svg`} alt="Download Code" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/download-icon-dark.svg`} alt="Download Code" />
            </button>
            <a href={`${location.origin}/preview`} target="_blank" rel="noreferrer" className="flex items-center justify-center px-2 py-1 hover:bg-cyan-900/25 active:hover:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 rounded duration-200" onClick={saveTempWebPreview}>
              <p className="hidden md:block text-xs pr-1">{t('open_in_new_tab')}</p>
              <img className="dark:hidden h-5 object-contain" src={`${import.meta.env.BASE_URL}images/open-new-icon.svg`} alt="Open in New Tab" />
              <img className="hidden dark:block h-5 object-contain" src={`${import.meta.env.BASE_URL}images/open-new-icon-dark.svg`} alt="Open in New Tab" />
            </a>
          </div>
        </section>
        <iframe title="Web Preview" srcDoc={normalizedResponseResult} className="w-full grow duration-200" frameborder="0"></iframe>
      </article>
    )
  } else {
    return (
      <article className="flex flex-col h-[60vh] lg:h-full bg-white dark:bg-black duration-200">
        <h5 className="border-b border-b-black dark:border-b-white p-1 text-black dark:text-white">{t('web_preview_title')}</h5>
        <p className="grow grid items-center justify-center w-full text-center text-black dark:text-white">{responseResult}</p>
      </article>
    )
  }
}

export default PreviewContainer