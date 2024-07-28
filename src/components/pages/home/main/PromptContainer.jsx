import React from "react"

const PromptContainer = ({ state, handleCurrentPromptChange, handleLastPromptChange, generatePrompt, regeneratePrompt, onEditHandler, onCancelHandler }) => (
  <article className="flex flex-auto flex-col h-[60vh] lg:h-full bg-cyan-100 dark:bg-gray-800 duration-200">
    <h5 className="border-b border-b-cyan-900 dark:border-b-white p-1 text-cyan-900 dark:text-white">Prompt Generator</h5>
    <div className="prompt-container flex flex-nowrap items-stretch grow p-2">
      <img className="object-contain w-8 mb-auto pr-1 invert dark:invert-0 duration-200" src={`${import.meta.env.BASE_URL}images/sidebar-icon.svg`} alt="View Sidebar" />
      <div className="grow flex flex-col h-full items-center justify-end p-1 bg-cyan-50 dark:bg-gray-900 rounded shadow-inner duration-200">
        {
          state.isEditing
            ? (
                <div className="flex flex-col items-end justify-end w-full mr-24 duration-200">
                  <textarea onChange={handleLastPromptChange} rows="3" value={state.lastPrompt} className="max-h-full w-4/5 border border-cyan-900 dark:border-none bg-cyan-100 dark:bg-gray-700 p-2 text-justify text-cyan-900 dark:text-gray-100 duration-200 overflow-y-auto rounded-md" required></textarea>
                  <span className="flex pt-1 items-center text-cyan-900 dark:text-white">
                    <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 active:bg-gray-500 dark:hover:bg-gray-900 dark:active:bg-gray-500 mr-3 px-2 py-1.5 text-xs rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={onCancelHandler}>Cancel</button>
                    <button className="bg-cyan-300 dark:bg-cyan-700 hover:bg-cyan-500 active:bg-cyan-700 dark:hover:bg-cyan-900 dark:active:bg-cyan-500 px-2 py-1.5 text-xs rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={regeneratePrompt} disabled={state.isLoading || state.lastPrompt.length < 1}>Regenerate</button>
                  </span>
                </div>
              )
              : (
                <div className="flex flex-col items-end justify-end w-full mr-24 duration-200">
                  <p className="bg-white dark:bg-gray-700 max-h-full max-w-[80%] p-2 text-justify text-cyan-900 dark:text-gray-100 duration-200 overflow-y-auto shadow-md dark:shadow-white/50">{state.lastPrompt}</p>
                  <button className="border border-cyan-900 dark:border-gray-50 hover:bg-cyan-300 dark:hover:bg-gray-500 h-6 mt-1 p-1 rounded-md duration-200" onClick={onEditHandler}>
                    <img className="object-contain h-full dark:invert duration-200" src={`${import.meta.env.BASE_URL}images/edit-icon.svg`} alt="Edit Prompt" />
                  </button>
                </div>
              )
        }
        <br />
        <div className="flex items-center justify-between w-full">
          <textarea onChange={handleCurrentPromptChange} value={state.currentPrompt} rows="3" className="grow border border-cyan-700 dark:border-gray-200 bg-white dark:bg-black w-full p-2 text-black dark:text-white rounded-md md:rounded-lg duration-200" required></textarea>
          <button className="bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-900 active:bg-cyan-700 dark:hover:bg-cyan-900 dark:active:bg-cyan-500 ml-2 p-2 rounded-full shadow-md dark:shadow-white/50 duration-200" onClick={generatePrompt} disabled={state.isLoading || state.currentPrompt.length < 1}>
            {state.isLoading
            ? <div className="border-x-2 border-x-white w-8 h-8 aspect-square animate-spin rounded-full"></div>
            : <img className="object-contain w-8" src={`${import.meta.env.BASE_URL}images/post-icon.svg`} alt="Generate" />}
          </button>
        </div>
      </div>
    </div>
  </article>
)

export default PromptContainer