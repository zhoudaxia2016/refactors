import type * as ts from "typescript/lib/tsserverlibrary"
import Refactor from './refactors/types'
import addCursorVarToParameterList from './refactors/add-cursor-var-to-parameter-list'
import addValueComment from './refactors/add-value.comment'
const refactors = [addCursorVarToParameterList, addValueComment]

export default class LspPlugin {
  private info?: ts.server.PluginCreateInfo
  private refactors: Refactor[] = []
  constructor(private readonly typescript: typeof ts) {
    this.typescript = typescript
    this.refactors = refactors.map(_ => new _(typescript))
  }

  log(info: any) {
    this.info?.project.projectService.logger.info('[**lsp-box**]: ' + JSON.stringify(info))
  }

  getTargetInfo(
    file: ts.SourceFile,
    pos: number
  ) {
    const ts = this.typescript

    const currentToken = ts.getTokenAtPosition(file, pos)
    return currentToken
  }

  getPositionOfPositionOrRange(
    positionOrRange: number | ts.TextRange
  ) {
    return typeof positionOrRange === "number"
      ? positionOrRange
      : positionOrRange.pos
  }

  getRefactorContext(fileName: string) {
    const program = this.info?.languageService.getProgram()
    if (!program) {
      this.log("Cannot find program")
      return undefined
    }
    const checker = program.getTypeChecker()

    const file = program.getSourceFile(fileName)
    if (!file) {
      this.log("Cannot find source file")
      return undefined
    }

    return {
      file,
      program,
      checker
    }
  }

  create(info: ts.server.PluginCreateInfo) {
    info.languageService.getReferencesAtPosition
    this.info = info
    return {
      ...info.languageService,
      getApplicableRefactors: (fileName: string, positionOrRange: number | ts.TextRange) => {
        const context = this.getRefactorContext(fileName)
        if (!context) {
          this.log("Cannot construct refactor context")
          return undefined
        }
        const { file } = context
        // 获取当前节点
        const currentToken = this.getTargetInfo(file, this.getPositionOfPositionOrRange(positionOrRange))
        return this.refactors.filter(_ => _.match(currentToken))
      },
      getEditsForRefactor: (fileName: string, formatOptions: ts.FormatCodeSettings, positionOrRange: number | ts.TextRange, refactorName: string, actionName: string, preferences: ts.UserPreferences) => {
        const refactor = this.refactors.find(_ => _.name === refactorName)
        if (!refactor) return
        // 初始化上下文，暂时不知道有什么用，传就是
        const formatContext = this.typescript.formatting.getFormatContext(
          formatOptions,
          info.languageServiceHost
        )
        const textChangesContext: ts.textChanges.TextChangesContext = {
          formatContext,
          host: info.languageServiceHost,
          preferences: preferences || {}
        }
        const context = this.getRefactorContext(fileName)
        if (!context) {
          this.log("Cannot construct refactor context")
          return undefined
        }

        const { file, checker, program } = context
        // 获取当前节点
        const currentToken = this.getTargetInfo(file, this.getPositionOfPositionOrRange(positionOrRange))
        return {
          edits: refactor.getEdits(currentToken, file, {
            textChangesContext,
            program,
            checker,
          })
        }
      }
    }
  }
}
