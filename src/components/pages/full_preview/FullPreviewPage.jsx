import React from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"

const FullPreviewPage = ({ t }) => {
  const getSavedWebPreview = () => {
    const getWebPreviewFromLocal = localStorage.getItem('TEMP_WEB_PREVIEW_STORAGE_KEY')
    try {
      const parsedWebPreview = JSON.parse(getWebPreviewFromLocal)
      if (parsedWebPreview !== undefined || parsedWebPreview !== null) {
        return parsedWebPreview
      }
      return ''
    } catch (error) {
      localStorage.removeItem('TEMP_WEB_PREVIEW_STORAGE_KEY')
      alert(`${t('error_alert')}: ${error.message}\n${t('error_solution')}.`)
      return ''
    }
  }
  if (getSavedWebPreview()?.includes('<html')) {
    return (
      <iframe title="Web Preview" srcDoc={getSavedWebPreview()} className="h-screen w-full overflow-auto duration-200" frameborder="0">
        <Helmet>
          <title>{t('preview_page_title')}</title>
          <link rel="canonical" href={location.toString()}/>
        </Helmet>
      </iframe>
    )
  } else if (getSavedWebPreview()?.length > 0) {
    return (
      <article className="w-full h-screen bg-cyan-50 dark:bg-gray-900 duration-200 p-4 md:p-8 lg:p-16 overflow-y-auto">
        <Helmet>
          <title>{t('preview_page_title')}</title>
          <link rel="canonical" href={location.toString()}/>
        </Helmet>
        <p className="w-full text-center text-cyan-700 dark:text-gray-200">{getSavedWebPreview()}</p>
      </article>
    )
  } else {
    return (
      <article className="grid grid-flow-row items-center justify-center gap-4 md:gap-8 lg:gap-16 w-full h-screen p-4 md:p-8 lg:p-16 bg-cyan-50 dark:bg-gray-900 duration-200 overflow-y-auto">
        <Helmet>
          <title>{t('preview_page_title')}</title>
          <link rel="canonical" href={location.toString()}/>
        </Helmet>
        <h1 className="text-center text-cyan-900 dark:text-white">{t('web_preview_title')}</h1>
        <h3 className="flex flex-col justify-center text-center">
          <span className="text-cyan-700 dark:text-gray-200 p-1">{t('web_preview_info')}</span>
          <Link to="/"><span className="text-blue-700 dark:text-gray-300 hover:text-blue-400 dark:hover:text-gray-500 active:text-purple-700 dark:active:text-purple-500 p-1 underline">{t('go_to_home')}</span></Link>
        </h3>
      </article>
    )
  }
}

export default FullPreviewPage