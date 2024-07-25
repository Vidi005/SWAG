import { Menu, Switch, Transition } from "@headlessui/react"
import React, { Fragment } from "react"

const HeaderContainer = ({ headerTitle, changeLanguage, resetUserData, setDisplayMode, isDarkMode, isUserDataEntered, userName }) => (
  <header className="header-container flex flex-nowrap items-center justify-between bg-cyan-500 dark:bg-cyan-700 w-full p-1 shadow-xl z-10">
    <section className="header-title grow flex items-center p-1">
      <h2 className="grow text-white">S-W-A-G</h2>
    </section>
    <section className="w-fit flex items-center pl-1">
      <a href="https://github.com/Vidi005/SWAG" title="Repository" target="_blank" rel="noreferrer noopener">
        <img className="h-10 mr-1 md:mr-2 p-2 object-contain hover:bg-black/25 focus-visible:ring-2 focus-visible:ring-white/75 duration-200 rounded-md" src={`${import.meta.env.BASE_URL}images/github-icon.png`} alt="Github" />
      </a>
      <Switch
        checked={isDarkMode}
        onChange={setDisplayMode}
        title="Theme Setting"
        className={`${
          isDarkMode
            ? "bg-cyan-800"
            : "bg-cyan-600"
        } relative inline-flex h-6 w-12 px-1 items-center cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 rounded-full`}
      >
        <span className="sr-only">Theme Setting</span>
        <span className={`${isDarkMode ? "translate-x-6" : "translate-x-0"} inline-block h-4 w-4 transform rounded-full bg-white transition duration-300`}>
          <img className="h-full p-0.5 object-contain object-center duration-200 animate__animated animate__fadeIn" src={`${isDarkMode ? `${import.meta.env.BASE_URL}images/moon-icon.svg` : `${import.meta.env.BASE_URL}images/sun-icon.svg`}`} alt="Theme Setting" />
        </span>
      </Switch>
      <Menu as={"menu"} className={"inline-block h-10 pl-2"}>
        <Menu.Button className={"inline-flex w-full items-center justify-center h-full p-2 hover:bg-black/25 focus-visible:ring-2 focus-visible:ring-white/75 duration-200 rounded-md"} title="Languages">
          <img className="h-full object-contain" src={`${import.meta.env.BASE_URL}images/lang-icon.svg`} alt="Languages" />
          <img className="h-full object-contain" src={`${import.meta.env.BASE_URL}images/expand-icon.svg`} alt="Expand" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="transform opacity-0 scale-95 -translate-y-1/2"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="transform opacity-100 scale-100 translate-y-0"
          leaveTo="transform opacity-0 scale-95 -translate-y-1/2"
        >
          <Menu.Items className="absolute grid grid-flow-row gap-1 right-16 mt-2 w-40 origin-top-right divide-y divide-cyan-100 rounded-lg bg-cyan-500 dark:bg-cyan-700 shadow-lg ring-1 ring-cyan-100 ring-opacity-5 focus:outline-none text-base z-20 overflow-hidden">
            <Menu.Item as={"span"} className={"text-white hover:bg-cyan-300 hover:text-cyan-900 cursor-pointer p-2 duration-200 rounded-md animate__animated animate__fadeInRight animate__faster"} onClick={() => changeLanguage("en")}>English</Menu.Item>
            <Menu.Item as={"span"} className={"text-white hover:bg-cyan-300 hover:text-cyan-900 cursor-pointer p-2 duration-200 rounded-md animate__animated animate__fadeInRight animate__faster"} onClick={() => changeLanguage("id")}>Indonesian</Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
      {userName && isUserDataEntered &&
        <Menu as={"menu"} className={"h-10 overflow-hidden"}>
          <Menu.Button className={"inline-flex w-full items-center justify-center h-full p-2 hover:bg-black/25 focus-visible:ring-2 focus-visible:ring-white/75 duration-200 rounded-md animate__animated animate__fadeInRight"} title="Languages">
            <span className="hidden md:inline-block text-white text-sm font-serif pr-2">{userName}</span>
            <img className="h-full object-contain" src={`${import.meta.env.BASE_URL}images/user-setting-icon.svg`} alt="User Data Setting" />
            <img className="h-full object-contain" src={`${import.meta.env.BASE_URL}images/expand-icon.svg`} alt="Expand" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0 scale-95 -translate-y-1/2"
            enterTo="transform opacity-100 scale-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 scale-100 translate-y-0"
            leaveTo="transform opacity-0 scale-95 -translate-y-1/2"
          >
            <Menu.Items className="absolute grid grid-flow-row gap-1 right-1 mt-2 w-max origin-top-right divide-y divide-cyan-100 rounded-lg bg-cyan-500 dark:bg-cyan-700 shadow-lg ring-1 ring-cyan-100 ring-opacity-5 focus:outline-none text-base z-20 overflow-hidden">
              <Menu.Item as={"span"} className={"flex items-center text-white text-right hover:bg-cyan-300 hover:text-cyan-900 cursor-pointer p-2 duration-200 rounded-md animate__animated animate__fadeInRight animate__faster"} onClick={() => resetUserData()}>
                <img className="h-full object-contain pr-2" src={`${import.meta.env.BASE_URL}images/delete-all-icon.svg`} alt="Delete All" />
                <span>Reset User Data</span>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      }
    </section>
  </header>
)

export default HeaderContainer