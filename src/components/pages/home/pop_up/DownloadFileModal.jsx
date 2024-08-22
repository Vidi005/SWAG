import { Dialog, Transition } from "@headlessui/react"
import React, { Fragment } from "react"

const DownloadFileModal = ({ t, inputRef, isDialogOpened, downloadAsHTML, downloadAsZip, cancelDownload }) => (
  <Transition appear show={isDialogOpened} as={Fragment}>
    <Dialog initialFocus={inputRef} className={"download-file-dialog relative z-10"} onClose={cancelDownload}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      </Transition.Child>
      <Transition.Child
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-full scale-50"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-full scale-50"
        className={"fixed inset-0 md:w-3/4 lg:w-1/2 m-auto h-min"}
      >
        <Dialog.Panel className={"flex flex-col items-center min-h-full max-w-5xl mx-4 bg-cyan-500 dark:bg-gray-700 text-cyan-900 dark:text-white shadow-lg dark:shadow-white/50 rounded-lg duration-200 overflow-hidden"}>
          <section className="inline-flex w-full justify-between p-4 text-center dark:text-white duration-200">
            <h3 className="grow text-cyan-50">{t('download_file_confirmation')}</h3>
            <button className="px-2 font-mono text-white bg-cyan-100/50 hover:bg-cyan-50 dark:bg-white/20 dark:hover:bg-black/50 duration-200 rounded-full shadow dark:shadow-white/50" title="Close" onClick={cancelDownload}>
              <h4>X</h4>
            </button>
          </section>
          <section className="flex flex-col items-center w-full p-4 bg-cyan-50 dark:bg-gray-900 text-base lg:text-lg duration-200">
            <p className="text-justify text-cyan-900 dark:text-white leading-tight duration-200">{t('download_file_confirmation_desc')}</p>
            <br />
            <div className="flex w-full items-center justify-evenly text-sm md:text-base">
              <button className="m-2 px-4 py-2 bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-900 text-center text-white rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={downloadAsHTML}>{t('download_as_html')}</button>
              <button className="m-2 px-4 py-2 bg-cyan-500 dark:bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-900 text-center text-white rounded-md shadow-md dark:shadow-white/50 duration-200" onClick={downloadAsZip}>{t('download_as_zip')}</button>
            </div>
          </section>
        </Dialog.Panel>
      </Transition.Child>
    </Dialog>
  </Transition>
)

export default DownloadFileModal