import ts from "typescript/lib/tsserverlibrary"

type ts = typeof ts
type Action = {
  name: string,
  description: string
}

export type Context = {
  program: ts.Program,
  textChangesContext: ts.textChanges.TextChangesContext,
  checker: ts.TypeChecker,
}

export default abstract class Refactor {
  ts: ts
  constructor(ts: ts) {
    this.ts = ts
  }
  abstract name: string
  abstract description: string
  abstract match(token: ts.Node): boolean
  abstract actions: Action[]
  abstract getEdits(token: ts.Node, file: ts.SourceFile, context: Context): ts.FileTextChanges[]
}
