import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      USER_API_STORAGE_KEY: 'USER_API_STORAGE_KEY',
      USER_CHATS_STORAGE_KEY: 'USER_CHATS_STORAGE_KEY',
      userChatData: null
    }
    this.inputRef = React.createRef()
  }

  render() {
    return (
      <main className="main-container relative h-full lg:grow w-full flex flex-col overflow-y-auto">
        <section className="grid grid-flow-row w-full lg:grid-cols-2 lg:h-3/5">
          <article className="h-[60vh] lg:h-full bg-cyan-100 dark:bg-gray-800 duration-200"></article>
          <article className="h-[60vh] lg:h-full bg-white dark:bg-black duration-200"></article>
        </section>
        <section className="grid grid-flow-row w-full lg:grid-cols-3 lg:grow">
          <article className="h-[40vh] lg:h-full bg-orange-100 dark:bg-orange-900 duration-200"></article>
          <article className="h-[40vh] lg:h-full bg-cyan-100 dark:bg-cyan-900 duration-200"></article>
          <article className="h-[40vh] lg:h-full bg-yellow-100 dark:bg-yellow-900 duration-200"></article>
        </section>
        <UserDataEntry
          t={this.props.t}
          inputRef={this.inputRef}
          isUserDataEntered={this.props.state.isUserDataEntered}
          isFocused={this.props.state.isFocused}
          isDataWillBeSaved={this.props.state.isDataWillBeSaved}
          userName={this.props.state.userName}
          geminiApiKey={this.props.state.geminiApiKey}
          handleNameChange={this.props.handleNameChange}
          handleApiKeyChange={this.props.handleApiKeyChange}
          onFocusHandler={this.props.onFocusHandler}
          onBlurHandler={this.props.onBlurHandler}
          changeUserDataSetting={this.props.changeUserDataSetting}
          saveUserData={this.props.saveUserData}
        />
      </main>
    )
  }
}

export default MainContainer