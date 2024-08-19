import React from "react"
import { isStorageExist } from "../utils/data"
import i18n from '../utils/localization'
import { Helmet } from "react-helmet"
import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import NoPage from "./pages/empty/NoPage"
import Swal from "sweetalert2"
import FullPreviewPage from "./pages/full_preview/FullPreviewPage"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      LANGUAGE_STORAGE_KEY: 'SWAG_LANG_STORAGE_KEY',
      DARK_MODE_STORAGE_KEY: 'SWAG_DARK_MODE_STORAGE_KEY',
      USER_API_STORAGE_KEY: 'USER_API_STORAGE_KEY',
      GEMINI_AI_TEMPERATURE_STORAGE_KEY: 'GEMINI_AI_TEMPERATURE_STORAGE_KEY',
      GEMINI_AI_MODEL_STORAGE_KEY: 'GEMINI_AI_MODEL_STORAGE_KEY',
      CHUNKED_PROMPTS_STORAGE_KEY: 'CHUNKED_PROMPTS_STORAGE_KEY',
      USER_PROMPTS_STORAGE_KEY: 'USER_PROMPTS_STORAGE_KEY',
      USER_RESULTS_STORAGE_KEY: 'USER_RESULTS_STORAGE_KEY',
      selectedLanguage: 'en',
      inputType: 'password',
      userName: '',
      geminiApiKey: null,
      isDarkMode: false,
      isUserDataEntered: false,
      isFocused: false,
      isDataWillBeSaved: false
    }
  }

  componentDidMount() {
    this.checkBrowserStorage()
  }

  checkBrowserStorage() {
    isStorageExist(i18n.t('browser_warning'))
    if (isStorageExist('')) {
      this.checkDisplayMode()
      this.checkLanguageData()
      this.checkTempUserData()
      this.checkSavedUserData()
    }
  }

  componentDidUpdate() {
    document.body.classList.toggle('dark', this.state.isDarkMode)
  }

  checkDisplayMode () {
    const getDisplayModeFromLocal = localStorage.getItem(this.state.DARK_MODE_STORAGE_KEY)
    try {
      const parsedDisplayMode = JSON.parse(getDisplayModeFromLocal)
      if (parsedDisplayMode !== undefined || parsedDisplayMode !== null) {
        this.setState({ isDarkMode: parsedDisplayMode })
      }
    } catch (error) {
      localStorage.removeItem(this.state.DARK_MODE_STORAGE_KEY)
      alert(`${i18n.t('error_alert')}: ${error.message}\n${i18n.t('error_solution')}.`)
    }
  }

  checkLanguageData () {
    const getLanguageFromLocal = localStorage.getItem(this.state.LANGUAGE_STORAGE_KEY)
    try {
      const parsedLanguage = JSON.parse(getLanguageFromLocal)
      if (parsedLanguage !== undefined || parsedLanguage !== null) {
        this.setState({ selectedLanguage: parsedLanguage }, () => this.changeLanguage(parsedLanguage))
      } else this.changeLanguage(this.state.selectedLanguage)
    } catch (error) {
      localStorage.removeItem(this.state.LANGUAGE_STORAGE_KEY)
      alert(`${i18n.t('error_alert')}: ${error.message}\n${i18n.t('error_solution')}.`)
    }
  }

  setDisplayMode () {
    this.setState(prevState => ({
      isDarkMode: !prevState.isDarkMode
    }), () => this.saveDisplayMode(this.state.isDarkMode))
  }

  changeLanguage (lang) {
    i18n.changeLanguage(lang)
    this.setState({ selectedLanguage: lang }, () => this.saveLanguageData(lang))
  }

  saveDisplayMode (selectedDisplayMode) {
    if (isStorageExist(i18n.t('browser_warning'))) {
      localStorage.setItem(this.state.DARK_MODE_STORAGE_KEY, JSON.stringify(selectedDisplayMode))
    }
  }

  saveLanguageData (selectedLanguage) {
    if (isStorageExist(i18n.t('browser_warning'))) {
      localStorage.setItem(this.state.LANGUAGE_STORAGE_KEY, JSON.stringify(selectedLanguage))
    }
  }

  checkTempUserData() {
    const getTempUserApiKey = sessionStorage.getItem(this.state.USER_API_STORAGE_KEY)
    try {
      if (getTempUserApiKey !== null) {
        const parsedUserApiKey = JSON.parse(getTempUserApiKey)
        this.setState({
          isUserDataEntered: true,
          userName: parsedUserApiKey.userName || this.state.userName,
          geminiApiKey: parsedUserApiKey.geminiApiKey
        })
      }
    } catch (error) {
      sessionStorage.removeItem(this.state.USER_API_STORAGE_KEY)
      alert(`${i18n.t('error_alert')}: ${error.message}\n${i18n.t('error_solution')}.`)
    }
  }

  checkSavedUserData() {
    const getSavedUserApiKey = localStorage.getItem(this.state.USER_API_STORAGE_KEY)
    try {
      const parsedUserApiKey = JSON.parse(getSavedUserApiKey)
      if (parsedUserApiKey !== null) {
        this.setState({
          isUserDataEntered: true,
          userName: parsedUserApiKey.userName || 'User',
          geminiApiKey: parsedUserApiKey.geminiApiKey
        })
      }
    } catch (error) {
      localStorage.removeItem(this.state.USER_API_STORAGE_KEY)
      alert(`${i18n.t('error_alert')}: ${error.message}\n${i18n.t('error_solution')}.`)
    }
  }

  handleNameChange(event) {
    if (event.target.value.length <= 50) {
      this.setState(prevState => ({ ...prevState, userName: event.target.value }))
    }
  }

  handleApiKeyChange(event) {
    this.setState(prevState => ({ ...prevState, geminiApiKey: event.target.value }))
  }

  changeVisibilityPassword (event) {
    event.preventDefault()
    if (this.state.inputType === 'password') {
      this.setState({ inputType: 'text' })
    } else this.setState({ inputType: 'password' })
  }

  changeUserDataSetting() {
    this.setState(prevState => ({ isDataWillBeSaved: !prevState.isDataWillBeSaved }))
  }

  saveUserData(event) {
    event.preventDefault()
    this.setState({ isUserDataEntered: true }, () => {
      if (isStorageExist(i18n.t('browser_warning'))) {
        const userData = {
          userName: this.state.userName || 'User',
          geminiApiKey: this.state.geminiApiKey
        }
        if (this.state.isDataWillBeSaved) {
          localStorage.setItem(this.state.USER_API_STORAGE_KEY, JSON.stringify(userData))
        } else sessionStorage.setItem(this.state.USER_API_STORAGE_KEY, JSON.stringify(userData))
      }
    })
  }

  resetUserData() {
    Swal.fire({
      title: i18n.t('reset_data_prompt.0'),
      text: i18n.t('reset_data_prompt.1'),
      icon: "warning",
      confirmButtonColor: "blue",
      showCancelButton: true,
      cancelButtonColor: "red",
      confirmButtonText: i18n.t('yes'),
      cancelButtonText: i18n.t('no')
    }).then(result => {
      if (result.isConfirmed) {
        sessionStorage.removeItem(this.state.USER_API_STORAGE_KEY)
        sessionStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_API_STORAGE_KEY)
        localStorage.removeItem(this.state.GEMINI_AI_TEMPERATURE_STORAGE_KEY)
        localStorage.removeItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY)
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        location.href = location.origin
      }
    })
  }

  onBlurHandler() {
    this.setState({ isFocused: false })
  }

  onFocusHandler() {
    this.setState({ isFocused: true })
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>{i18n.t('app_name')}</title>
          <meta name="description" content={i18n.t('app_description')} />
          <link rel="canonical" href={location.toString()} />
        </Helmet>
        <Routes>
          <Route path="/" element={
            <HomePage
              t={i18n.t}
              state={this.state}
              setDisplayMode={this.setDisplayMode.bind(this)}
              changeLanguage={this.changeLanguage.bind(this)}
              handleNameChange={this.handleNameChange.bind(this)}
              handleApiKeyChange={this.handleApiKeyChange.bind(this)}
              onFocusHandler={this.onFocusHandler.bind(this)}
              onBlurHandler={this.onBlurHandler.bind(this)}
              changeVisibilityPassword={this.changeVisibilityPassword.bind(this)}
              changeUserDataSetting={this.changeUserDataSetting.bind(this)}
              saveUserData={this.saveUserData.bind(this)}
              resetUserData={this.resetUserData.bind(this)}
            />
          }/>
          <Route path="/prompt" element={
            <HomePage
              t={i18n.t}
              state={this.state}
              setDisplayMode={this.setDisplayMode.bind(this)}
              changeLanguage={this.changeLanguage.bind(this)}
              handleNameChange={this.handleNameChange.bind(this)}
              handleApiKeyChange={this.handleApiKeyChange.bind(this)}
              onFocusHandler={this.onFocusHandler.bind(this)}
              onBlurHandler={this.onBlurHandler.bind(this)}
              changeVisibilityPassword={this.changeVisibilityPassword.bind(this)}
              changeUserDataSetting={this.changeUserDataSetting.bind(this)}
              saveUserData={this.saveUserData.bind(this)}
              resetUserData={this.resetUserData.bind(this)}
            />
          }/>
          <Route path="/preview" element={<FullPreviewPage t={i18n.t}/>}/>
          <Route path="*" element={<NoPage t={i18n.t}/>}/>
        </Routes>
      </React.Fragment>
    )
  }
}

export default App