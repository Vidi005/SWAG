import { Transition } from "@headlessui/react"
import React, { Fragment } from "react"
import { Link } from "react-router-dom"

const SidebarContainer = ({ t, isSidebarOpened, chunkedPrompts, searchHandler, closeSidebar, deleteSelectedPrompt, deleteAllPrompts }) => (
  <React.Fragment>
    {isSidebarOpened && (
      <section className="absolute w-full h-full bg-black/25 dark:bg-white/25 backdrop-blur-sm animate__animated animate__fadeIn" onClick={closeSidebar}></section>
    )}
    <Transition
      as={Fragment}
      show={isSidebarOpened}
      enter="transition ease-out duration-300"
      enterFrom="transform opacity-50 -translate-x-3/4"
      enterTo="transform opacity-100 translate-x-0"
      leave="transition ease-in duration-200"
      leaveFrom="transform opacity-100 translate-x-0"
      leaveTo="transform opacity-50 -translate-x-3/4"
    >
      <aside className="absolute left-0 inset-y-0 w-3/4 md:w-1/2 flex flex-col border-y border-r border-y-cyan-900/25 border-r-cyan-900/25 dark:border-y-white/25 dark:border-r-white/25 bg-cyan-100 dark:bg-gray-700 overflow-x-hidden">
        <h5 className="flex flex-nowrap w-full dark:text-white overflow-x-auto animate__animated animate__fadeInLeft animate__faster">
          <span className="grow p-1 text-base text-center font-bold">{t('prompt_history')}</span>
          <button title="Clear All Histories" className="inline-flex items-center justify-center bg-red-400 dark:bg-red-700 h-8 p-1 hover:bg-red-600 dark:hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-black/75 focus-visible:dark:ring-white/75 rounded-md duration-200" onClick={deleteAllPrompts}>
            <img className="object-contain h-full" src={`${import.meta.env.BASE_URL}images/delete-all-icon.svg`} alt="Clear All Histories" />
          </button>
        </h5>
        <hr />
        <section className="flex items-center p-2 animate__animated animate__fadeInLeft animate__faster">
          <input
            type="search"
            className="border border-cyan-900 dark:border-gray-50 bg-cyan-50 dark:bg-gray-500/25 w-full p-1 text-base text-cyan-700 dark:text-white rounded-lg shadow-inner dark:shadow-white/50 backdrop-blur-sm"
            placeholder={t('search_prompts')}
            onChange={searchHandler}
          />
        </section>
        <section className="flex-auto h-0 p-2 overflow-y-auto duration-200 animate__animated animate__fadeInLeft animate__faster">
          {chunkedPrompts.map(chunk => (
            <div key={chunk.id} className="group grid grid-flow-col items-center justify-between my-1 hover:bg-cyan-500/50 dark:hover:bg-gray-200/50 rounded-md duration-300">
              <Link to={`/prompt?id=${chunk.id}`} className="text-base text-cyan-900 dark:text-white truncate p-1.5" onClick={closeSidebar}>{chunk.promptChunk}</Link>
              <span className="h-8 w-8 aspect-square p-1 lg:group-hover:hidden"></span>
              <button title="Delete this prompt" className="lg:hidden lg:group-hover:block inline-flex items-center justify-center h-8 w-8 p-1.5 hover:bg-red-500 dark:hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-black/75 focus-visible:dark:ring-white/75 rounded-md duration-200" onClick={() => deleteSelectedPrompt(chunk.id)}>
                <img className="object-contain h-full w-full" src={`${import.meta.env.BASE_URL}images/delete-icon.svg`} alt="Delete this prompt" />
              </button>
            </div>
          ))}
        </section>
      </aside>
    </Transition>
  </React.Fragment>
)

export default SidebarContainer