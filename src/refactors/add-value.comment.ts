import Refactor, {Context} from './types'
import ts from "typescript/lib/tsserverlibrary"
type ts = typeof ts

const name = 'Add comment for identifier value'
const description = 'Add comment for identifier value'

export default class R extends Refactor {
  match(token: ts.Node) {
    return this.ts.isIdentifier(token) && token.parent && this.ts.isPropertyAccessExpression(token.parent) && token.parent.getChildAt(0).getText() === 'lang'
  }
  name = name
  description = description
  actions = [{name, description}]
  getEdits(token: ts.Node, file: ts.SourceFile, {checker, textChangesContext}: Context): ts.FileTextChanges[] {
    if (token.parent.getChildAt(0) === token) {
      token = token.parent.getChildAt(2)
    }
    let s = checker.getSymbolAtLocation(token)
    if (s) {
      const varDecl = s.getDeclarations()![0]
      const comment = varDecl?.getText().split(/:\s?/)[1].replace(/^'|'$/g, '') || ''
      return this.ts.textChanges.ChangeTracker.with(textChangesContext, (changeTracker) => {
        changeTracker.replaceNode(file, token, this.ts.addSyntheticTrailingComment(token, ts.SyntaxKind.MultiLineCommentTrivia, comment, false))
      })
    }
    return []
  }
}
