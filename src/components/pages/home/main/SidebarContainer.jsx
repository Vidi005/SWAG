import { Listbox, Transition } from "@headlessui/react"
import React, { Fragment } from "react"
import { Link } from "react-router-dom"
import en from "../../../../locales/en.json"

const SidebarContainer = ({ t, isSidebarOpened, sortBy, sortHandler, chunkedPrompts, searchHandler, closeSidebar, deleteSelectedPrompt, deleteAllPrompts }) => (
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
        <h5 className="flex flex-nowrap w-full dark:text-white overflow-x-auto duration-200 animate__animated animate__fadeInLeft animate__faster">
          <span className="grow p-1 text-base text-center font-bold">{t('prompt_history')}</span>
          <button title="Clear All Histories" className="inline-flex items-center justify-center bg-red-400 dark:bg-red-700 h-8 p-1 hover:bg-red-600 dark:hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-black/75 focus-visible:dark:ring-white/75 rounded-md duration-200" onClick={deleteAllPrompts}>
            <img className="object-contain h-full" src={`${import.meta.env.BASE_URL}images/delete-all-icon.svg`} alt="Clear All Histories" />
          </button>
        </h5>
        <hr />
        <section className="relative flex items-center p-2 z-10 animate__animated animate__fadeInLeft animate__faster">
          <input
            type="search"
            className="grow border border-cyan-900 dark:border-gray-50 bg-cyan-50 dark:bg-gray-500/25 w-full mr-1 p-1 text-base text-cyan-700 dark:text-white rounded-lg shadow-inner dark:shadow-white/50 backdrop-blur-sm duration-200"
            placeholder={t('search_prompts')}
            onChange={searchHandler}
          />
          <Listbox value={sortBy} onChange={sortHandler}>
            <Listbox.Button title="Sort by" className={"flex items-center justify-center p-1 bg-cyan-200 dark:bg-gray-500 hover:bg-cyan-900/25 active:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 focus-visible:ring focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 rounded-md shadow dark:shadow-white/25 duration-200"}>
              <img className="object-contain h-6 dark:invert duration-200" src={`${import.meta.env.BASE_URL}images/sort-icon.svg`} alt="Sort Prompts" />
            </Listbox.Button>
            <Transition
              className={"relative"}
              enter="transition ease-out duration-300"
              enterFrom="transform opacity-0 scale-95 -translate-y-1/4"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-200"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 -translate-y-1/4"
            >
              <Listbox.Options className="absolute max-h-96 flex flex-col items-center bg-cyan-100/75 dark:bg-gray-700/75 top-5 right-0 p-1 ring-1 ring-cyan-900/50 dark:ring-white/50 backdrop-blur-sm rounded-md shadow-md duration-200 dark:shadow-white/50 overflow-y-auto">
                {en.sort_chunked_prompts.map((_, index) => (
                  <Listbox.Option
                    key={index}
                    value={t(`sort_chunked_prompts.${index}`)}
                    className={({ active }) => `${active ? 'bg-cyan-500 text-white' : 'text-cyan-700 dark:text-gray-300'} flex flex-nowrap items-center cursor-pointer select-none p-1 text-sm rounded-md duration-200`}>
                    {({ selected }) => (
                      <>
                        {selected
                          ? <>
                              <img className="dark:hidden object-contain h-5 px-1 duration-200" src={`${import.meta.env.BASE_URL}images/checked-icon.svg`} alt="Checkmark" />
                              <img className="hidden dark:block object-contain h-5 px-1 duration-200" src={`${import.meta.env.BASE_URL}images/checked-icon-dark.svg`} alt="Checkmark" />
                            </>
                          : <span className="h-5 w-5 px-3"></span>
                        }
                        <span className={`${selected ? "font-bold px-0.5" : "font-normal px-1.5"} block truncate duration-200`}>{t(`sort_chunked_prompts.${index}`)}</span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </Listbox>
        </section>
        <section className="flex-auto h-0 p-2 overflow-y-auto duration-200 animate__animated animate__fadeInLeft animate__faster">
          {chunkedPrompts.map(chunk => (
            <div key={chunk.id} className="group grid grid-flow-col items-center justify-between my-1 hover:bg-cyan-500/50 dark:hover:bg-gray-200/50 rounded-md duration-300 animate__animated animate__fadeInLeft animate__faster">
              <Link to={`/prompt?id=${chunk.id}`} className="text-base text-cyan-900 dark:text-white truncate p-1.5 duration-200" onClick={closeSidebar}>{chunk.promptChunk}</Link>
              <span className="hidden lg:inline-block h-8 w-8 aspect-square p-1 lg:group-hover:hidden"></span>
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