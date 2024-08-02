import React from "react"
import DropZoneContainer from "./DropZoneContainer"

const PromptContainer = ({ t, state, handleCurrentPromptChange, handleLastPromptChange, pickImage, removeImage, generatePrompt, regeneratePrompt, stopPrompt, onEditHandler, onCancelHandler }) => (
  <article className="flex flex-auto flex-col h-[60vh] lg:h-full bg-cyan-100 dark:bg-gray-800 duration-200">
    <h5 className="border-b border-b-cyan-900 dark:border-b-white p-1 text-cyan-900 dark:text-white">Prompt Generator</h5>
    <div className="prompt-container flex flex-nowrap items-stretch grow p-2">
      <img className="object-contain w-8 mb-auto pr-1 invert dark:invert-0 duration-200" src={`${import.meta.env.BASE_URL}images/sidebar-icon.svg`} alt="View Sidebar" />
      <div className="w-0 flex-auto flex flex-col h-full items-center justify-end p-1 bg-cyan-50 dark:bg-gray-900 rounded shadow-inner duration-200">
        {
          state.lastPrompt.length < 1
            ? null
            : <React.Fragment>
                {
                  state.isEditing
                    ? (
                        <div className="flex flex-col flex-auto h-0 items-end justify-end w-full px-12 py-2 duration-200 overflow-y-auto">
                          <textarea onChange={handleLastPromptChange} value={state.lastPrompt} className="grow w-full border border-cyan-900 dark:border-none bg-cyan-100 dark:bg-gray-700 p-2 text-justify text-cyan-900 dark:text-gray-100 duration-200 overflow-x-hidden overflow-y-auto rounded-md" required></textarea>
                          <span className="flex pt-1 items-center text-cyan-900 dark:text-white">
                            <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 active:bg-gray-500 dark:hover:bg-gray-900 dark:active:bg-gray-500 mr-3 px-2 py-1.5 text-xs rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={onCancelHandler}>Cancel</button>
                            <button className="bg-cyan-300 dark:bg-cyan-700 hover:bg-cyan-500 active:bg-cyan-700 dark:hover:bg-cyan-900 dark:active:bg-cyan-500 px-2 py-1.5 text-xs rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={regeneratePrompt} disabled={state.isLoading || state.lastPrompt.length < 1}>Regenerate</button>
                          </span>
                        </div>
                      )
                    : (
                      <div className="group flex flex-col items-end justify-end flex-auto h-0 w-full px-12 py-2 duration-200">
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
        <div className="flex flex-col items-stretch justify-between w-full h-1/2 p-1 overflow-y-auto">
          <DropZoneContainer t={t} pickImage={pickImage} imgFile={state.imgFile} removeImage={removeImage}/>
          <div className="flex items-center justify-between w-full pt-1">
            <label title="Upload Image" htmlFor="image-picker" className="btn-import hover:bg-cyan-100 dark:hover:bg-gray-700 active:bg-cyan-300 dark:active:bg-gray-500 cursor-pointer p-2 duration-200 rounded-full">
              <input className="hidden" type="file" id="image-picker" accept="image/*" onChange={(e) => pickImage(e.target.files)} />
              <img className="dark:hidden object-contain w-10" src={`${import.meta.env.BASE_URL}images/import-image-icon.svg`} alt="Import Image" />
              <img className="hidden dark:block object-contain w-10" src={`${import.meta.env.BASE_URL}images/import-image-icon-dark.svg`} alt="Import Image" />
            </label>
            <textarea onChange={handleCurrentPromptChange} placeholder="Create new prompt here..." value={state.currentPrompt} rows="2" className="grow border border-cyan-700 dark:border-gray-200 bg-white dark:bg-black w-full mx-2 p-2 text-black dark:text-white rounded-md md:rounded-lg duration-200" required></textarea>
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
      </div>
    </div>
  </article>
)

export default PromptContainer