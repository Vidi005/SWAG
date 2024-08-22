import React from 'react'
import { Helmet } from 'react-helmet'
import HeaderContainer from './header/HeaderContainer'
import MainContainer from './main/MainContainer'
import FooterContainer from './footer/FooterContainer'

const HomePage = ({ t, state, changeLanguage, setDisplayMode, handleNameChange, handleApiKeyChange, onFocusHandler, onBlurHandler, changeVisibilityPassword, changeUserDataSetting, saveUserData, resetUserData }) => (
  <div className="home-page h-screen w-full flex flex-col bg-cyan-100 dark:bg-black duration-200 animate__animated animate__fadeIn">
    <Helmet>
      <meta name="keywords" content="SWAG" />
    </Helmet>
    <HeaderContainer
      t={t}
      isDarkMode={state.isDarkMode}
      isUserDataEntered={state.isUserDataEntered}
      userName={state.userName}
      changeLanguage={changeLanguage}
      setDisplayMode={setDisplayMode}
      resetUserData={resetUserData}
    />
    <MainContainer
      t={t}
      state={state}
      handleNameChange={handleNameChange}
      handleApiKeyChange={handleApiKeyChange}
      onFocusHandler={onFocusHandler}
      onBlurHandler= {onBlurHandler}
      changeVisibilityPassword={changeVisibilityPassword}
      changeUserDataSetting={changeUserDataSetting}
      saveUserData={saveUserData}
    />
    <FooterContainer t={t}/>
  </div>
)

export default HomePage