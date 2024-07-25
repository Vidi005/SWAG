import React from "react"

const NoPage = ({ t }) => (
  <React.Fragment>
    <main className="no-page-main h-screen flex flex-col items-center justify-center bg-cyan-100 dark:bg-gray-900 p-8 dark:text-white">
      <article className="animate__animated animate__fadeInUpBig font-serif text-cyan-900 dark:text-cyan-100 text-center">
        <h1 className="text-7xl leading-snug"><strong>404</strong></h1>
        <h3>{t('not_found')}</h3>
        <br />
        <p>{t('page_not_found')}</p>
        <br />
        <a className="border border-cyan-700 bg-cyan-700 hover:bg-cyan-500 hover:dark:bg-cyan-300 dark:bg-cyan-500 active:bg-cyan-700 dark:active:bg-cyan-800 px-4 py-3 text-white dark:text-cyan-900 duration-200 rounded-lg shadow-lg dark:shadow-white/50" href="/">{t('back_to_home')}</a>
      </article>
    </main>
    <footer className="fixed bottom-0 w-full"></footer>
  </React.Fragment>
)

export default NoPage