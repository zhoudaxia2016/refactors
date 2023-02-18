import Refactor, {Context} from './types'
import ts from "typescript/lib/tsserverlibrary"
type ts = typeof ts

function getFunctionDeclaration(ts: ts, token: ts.Node) {
  if (ts.isIdentifier(token))
    return ts.findAncestor(token, ts.isFunctionDeclaration)
}

const name = 'Add a parameter for the function'
const description = 'Add a parameter for the function'

export default class R extends Refactor {
  match(token: ts.Node) {
    return !!getFunctionDeclaration(this.ts, token)
  }
  name = name
  description = description
  actions = [{name, description}]
  getEdits(token: ts.Node, file: ts.SourceFile, {textChangesContext}: Context): ts.FileTextChanges[] {
    if (!ts.isToken(token)) {
      return []
    }
    const functionDeclaration = getFunctionDeclaration(this.ts, token) as ts.FunctionDeclaration
    // @ts-ignore
    const parameter = this.ts.factory.createParameterDeclaration(undefined, undefined, undefined, token.escapedText.toString(), undefined, undefined)
    return this.ts.textChanges.ChangeTracker.with(textChangesContext, (changeTracker) => {
      changeTracker.replaceNode(file, functionDeclaration, this.ts.updateFunctionDeclaration(functionDeclaration, undefined, undefined, undefined, functionDeclaration.name, undefined, [...functionDeclaration.parameters, parameter], undefined, functionDeclaration.body))
    })
  }
}
