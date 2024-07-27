import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"
import PromptContainer from "./PromptContainer"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import PreviewContainer from "./PreviewContainer"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      USER_API_STORAGE_KEY: 'USER_API_STORAGE_KEY',
      USER_CHATS_STORAGE_KEY: 'USER_CHATS_STORAGE_KEY',
      isLoading: false,
      isEditing: false,
      currentPrompt: '',
      lastPrompt: '',
      filteredPrompt: 'Create a single HTML file without any backend code. If using front-end web libraries, import them only from a CDN and write the code within the <script> tag. If using native CSS, include it as inline CSS within the HTML code. If using JavaScript, write it as inline JavaScript within the HTML code. Provide only the complete HTML code without any additional explanations or descriptions.',
      responseResult: '',
      userChatData: null
    }
    this.inputRef = React.createRef()
  }

  handleCurrentPromptChange(event) {
    this.setState({ currentPrompt: event.target.value })
  }

  handleLastPromptChange(event) {
    this.setState({ lastPrompt: event.target.value })
  }
  
  async postPrompt(model, userPrompt) {
    const { totalTokens } = await model.countTokens(`${userPrompt}. ${this.state.filteredPrompt}`)
    if (totalTokens > 5000) {
      this.setState({
        responseResult: 'The prompt is too long. Please try again.',
        isLoading: false
      })
    } else {
      this.setState({ lastPrompt: userPrompt })
      const result = await model.generateContentStream(`${userPrompt}. ${this.state.filteredPrompt}`)
      let text = ''
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        text += chunkText
        this.setState({ currentPrompt: '', responseResult: text, isLoading: false })
      }
    }
  }

  generatePrompt() {
    this.setState({ isLoading: true, lastPrompt: '' })
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
      }
    ]
    const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings })
    this.postPrompt(model, this.state.currentPrompt)
  }

  regeneratePrompt() {
    this.setState({ isLoading: true, isEditing: false })
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
      }
    ]
    const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings })
    this.postPrompt(model, this.state.lastPrompt)
  }

  onEditHandler() {
    this.setState({ isEditing: true })
  }

  onCancelHandler() {
    this.setState({ isEditing: false })
  }

  render() {
    return (
      <main className="main-container relative h-full lg:grow w-full flex flex-col overflow-y-auto">
        <section className="grid grid-flow-row w-full lg:grid-cols-2 lg:h-3/5">
          <PromptContainer
            state={this.state}
            handleCurrentPromptChange={this.handleCurrentPromptChange.bind(this)}
            handleLastPromptChange={this.handleLastPromptChange.bind(this)}
            generatePrompt={this.generatePrompt.bind(this)}
            regeneratePrompt={this.regeneratePrompt.bind(this)}
            onEditHandler={this.onEditHandler.bind(this)}
            onCancelHandler={this.onCancelHandler.bind(this)}
          />
          <PreviewContainer isLoading={this.state.isLoading} responseResult={this.state.responseResult}/>
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