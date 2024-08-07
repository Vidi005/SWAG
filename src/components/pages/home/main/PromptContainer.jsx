import React, { Fragment } from "react"
import DropZoneContainer from "./DropZoneContainer"
import { Listbox, Transition } from "@headlessui/react"
import SidebarContainer from "./SidebarContainer"

const PromptContainer = ({ t, state, fileInputRef, changeGeminiModel, handleCurrentPromptChange, handleLastPromptChange, pickCurrentImage, pickLastImage, removeCurrentImage, removeLastImage, generatePrompt, regeneratePrompt, stopPrompt, onEditHandler, onCancelHandler, toggleSidebar, closeSidebar, deleteAllPrompts, deleteSelectedPrompt }) => (
  <article className="flex flex-auto flex-col h-[60vh] lg:h-full bg-cyan-100 dark:bg-gray-800 duration-200">
    <section className="flex flex-nowrap items-center justify-between w-full border-b border-b-cyan-900 dark:border-b-white py-0.5 overflow-x-auto">
      <h5 className="px-1 text-cyan-900 dark:text-white">{t('prompt_generator')}</h5>
      <p className="grow align-middle text-cyan-900 dark:text-white text-xs md:text-sm text-right px-0.5">{t('select_model')} </p>
      <Listbox value={state.selectedModel?.variant} onChange={changeGeminiModel} className="w-max px-0.5 text-cyan-900 dark:text-white overflow-x-hidden duration-200">
        <div className="max-w-full overflow-x-hidden">
          <div className="btn-container flex flex-nowrap items-center px-1">
            <Listbox.Button className={"flex items-center justify-center px-2 py-1 bg-cyan-200 dark:bg-gray-500 hover:bg-cyan-900/25 active:bg-cyan-900/50 dark:hover:bg-white/50 dark:active:bg-white/25 focus-visible:ring focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 rounded-md shadow-md dark:shadow-white/50 cursor-default duration-200"}>
              <span className="max-w-xs text-xs md:text-sm truncate px-1">{state.selectedModel?.variant}</span>
              <img className="dark:hidden object-contain h-5 duration-200" src={`${import.meta.env.BASE_URL}images/unfold-more-icon.svg`} alt="Unfold More" />
              <img className="hidden dark:block object-contain h-5 duration-200" src={`${import.meta.env.BASE_URL}images/unfold-more-icon-dark.svg`} alt="Unfold More" />
            </Listbox.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0 scale-95 -translate-y-1/4"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 -translate-y-1/4"
          >
            <Listbox.Options className="absolute max-h-96 flex flex-col items-center bg-cyan-100 dark:bg-gray-700 origin-top-right right-0 lg:right-1/2 mt-1 mr-2 p-1 ring-1 ring-cyan-900/50 dark:ring-white/50 rounded-md shadow-md dark:shadow-white/50 overflow-y-auto z-10">
              {state.geminiAIModels.map(model => (
                <Listbox.Option
                  key={model.variant}
                  value={model.variant}
                  className={({ active }) => `${active ? 'bg-cyan-500 text-white' : 'text-cyan-700 dark:text-gray-300'} flex flex-nowrap items-center cursor-default select-none p-1 rounded-md duration-200`}>
                  {({ selected }) => (
                    <>
                      {selected
                        ? <>
                            <img className="dark:hidden object-contain h-5 px-1 duration-200" src={`${import.meta.env.BASE_URL}images/checked-icon.svg`} alt="Checkmark" />
                            <img className="hidden dark:block object-contain h-5 px-1 duration-200" src={`${import.meta.env.BASE_URL}images/checked-icon-dark.svg`} alt="Checkmark" />
                          </>
                        : <span className="h-5 w-5 px-3"></span>
                      }
                      <span className={`${selected ? "font-bold px-0.5" : "font-normal px-1.5"} block truncate duration-200`}>{model.variant}</span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </section>
    <div className="prompt-container flex flex-nowrap items-stretch grow p-2">
      <button className={"inline-flex items-center justify-center w-8 mb-auto pr-1 hover:bg-black/25 dark:hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-black/75 focus-visible:dark:ring-white/75 duration-200 rounded-md animate__animated animate__fadeInLeft"} title="Sidebar" onClick={toggleSidebar}>
        <img className="object-contain w-full invert dark:invert-0 duration-200" src={state.isSidebarOpened ? `${import.meta.env.BASE_URL}images/close-sidebar-icon.svg` : `${import.meta.env.BASE_URL}images/view-sidebar-icon.svg`} alt={state.isSidebarOpened ? "Close Sidebar" : "View Sidebar"} />
      </button>
      <div className="relative w-0 flex-auto flex flex-col h-full items-center justify-end bg-cyan-50 dark:bg-gray-900 rounded shadow-inner duration-200">
        {
          state.lastPrompt.length < 1
            ? null
            : <React.Fragment>
                {
                  state.isEditing
                    ? (
                        <div className="flex flex-col flex-auto h-0 items-end justify-end w-full px-12 py-2 duration-200 overflow-y-auto" onClick={closeSidebar}>
                          <textarea onChange={handleLastPromptChange} value={state.lastPrompt} className="grow w-full border border-cyan-900 dark:border-none bg-cyan-100 dark:bg-gray-700 p-2 text-justify text-cyan-900 dark:text-gray-100 duration-200 overflow-x-hidden overflow-y-auto rounded-md" required></textarea>
                          <span className="flex pt-1 items-center text-cyan-900 dark:text-white">
                            <input ref={fileInputRef} className="max-w-max text-cyan-700 dark:text-gray-200 truncate duration-200" id="last-image-picker" type="file" accept="image/*" onChange={(e) => pickLastImage(e.target.files)} disabled={state.isGenerating || state.isLoading || state.selectedModel?.input !== 'multimodal'} />
                            {state.lastImgFile && (
                              <div title="Remove Image" htmlFor="last-image-picker" className="btn-remove grid items-center justify-center text-center font-mono bg-gray-500/75 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-white aspect-square mr-3 px-1.5 cursor-pointer rounded-full duration-200" onClick={removeLastImage}>X</div>
                            )}
                            <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 active:bg-gray-500 dark:hover:bg-gray-900 dark:active:bg-gray-500 mr-3 px-2 py-1.5 text-xs rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={onCancelHandler}>{t('cancel')}</button>
                            <button className="bg-cyan-300 dark:bg-cyan-700 hover:bg-cyan-500 active:bg-cyan-700 dark:hover:bg-cyan-900 dark:active:bg-cyan-500 px-2 py-1.5 text-xs rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={regeneratePrompt} disabled={state.isLoading || state.lastPrompt.length < 1}>{t('regenerate')}</button>
                          </span>
                        </div>
                      )
                    : (
                      <div className="group flex flex-col items-end justify-end flex-auto h-0 w-full px-12 py-2 duration-200" onClick={closeSidebar}>
                        <p className="bg-white dark:bg-gray-700 max-h-full max-w-full p-2 text-justify text-cyan-900 dark:text-gray-100 duration-200 shadow-md rounded-md dark:shadow-white/50 overflow-x-hidden overflow-y-auto">{state.lastPrompt}</p>
                        <span className="h-8 mt-1 lg:group-hover:hidden"></span>
                        <button title="Edit" className="block lg:hidden lg:group-hover:block hover:bg-cyan-200 dark:hover:bg-gray-500 h-7 mt-1 p-1 rounded-md duration-200" onClick={onEditHandler}>
                          <img className="object-contain h-full dark:invert duration-200" src={`${import.meta.env.BASE_URL}images/edit-icon.svg`} alt="Edit Prompt" />
                        </button>
                      </div>
                    )
                }
              </React.Fragment>
        }
        <div className="flex flex-col items-stretch justify-between w-full h-1/2 p-1 overflow-y-auto" onClick={closeSidebar}>
          <DropZoneContainer
            t={t}
            isLoading={state.isLoading}
            isGenerating={state.isGenerating}
            genAIInput={state.selectedModel?.input}
            pickCurrentImage={pickCurrentImage}
            currentImgURL={state.currentImgURL}
            removeCurrentImage={removeCurrentImage}
          />
          <div className="flex items-center justify-between w-full pt-1">
            <label title="Upload Image" htmlFor="image-picker" className="btn-import hover:bg-cyan-100 dark:hover:bg-gray-700 active:bg-cyan-300 dark:active:bg-gray-500 cursor-pointer p-2 duration-200 rounded-full">
              <input className="hidden" type="file" id="image-picker" accept="image/*" onChange={(e) => pickCurrentImage(e.target.files)} disabled={state.isGenerating || state.isLoading || state.selectedModel?.input !== 'multimodal'} />
              <img className="dark:hidden object-contain w-10" src={`${import.meta.env.BASE_URL}images/import-image-icon.svg`} alt="Import Image" />
              <img className="hidden dark:block object-contain w-10" src={`${import.meta.env.BASE_URL}images/import-image-icon-dark.svg`} alt="Import Image" />
            </label>
            <textarea onChange={handleCurrentPromptChange} placeholder={t('create_new_prompt')} value={state.currentPrompt} rows="2" className="grow border border-cyan-700 dark:border-gray-200 bg-white dark:bg-black w-full mx-2 p-2 text-black dark:text-white rounded-md md:rounded-lg duration-200" disabled={state.isGenerating || state.isLoading} required></textarea>
            {
              state.isGenerating
                ? (
                    <button title="Stop Response" className="bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-900 active:bg-cyan-700 dark:hover:bg-cyan-900 dark:active:bg-cyan-500 p-2 rounded-full shadow-md dark:shadow-white/50 duration-200" onClick={stopPrompt} disabled={state.isLoading || state.currentPrompt.length > 0}>
                      <img className="object-contain w-8 animate-pulse" src={`${import.meta.env.BASE_URL}images/stop-icon.svg`} alt="Stop" />
                    </button>
                  )
                : (
                    <button title="Send Prompt" className="bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-900 active:bg-cyan-700 dark:hover:bg-cyan-900 dark:active:bg-cyan-500 p-2 rounded-full shadow-md dark:shadow-white/50 duration-200" onClick={generatePrompt} disabled={state.isLoading || state.currentPrompt.length < 1}>
                      {state.isLoading
                      ? <div className="border-x-2 border-x-white w-7 h-7 aspect-square animate-spin rounded-full"></div>
                      : <img className="object-contain w-8" src={`${import.meta.env.BASE_URL}images/post-icon.svg`} alt="Generate" />}
                    </button>
                  )
            }
          </div>
        </div>
        <SidebarContainer
          t={t}
          isSidebarOpened={state.isSidebarOpened}
          closeSidebar={closeSidebar}
          deleteSelectedPrompt={deleteSelectedPrompt}
          deleteAllPrompts={deleteAllPrompts}
        />
      </div>
    </div>
  </article>
)

export default PromptContainer