import Refactor, {Context} from './types'
import ts from "typescript/lib/tsserverlibrary"
type ts = typeof ts

const name = ''
const description = ''

export default class R extends Refactor {
  match(token: ts.Node) {
    return true
  }
  name = name
  description = description
  actions = [{name, description}]
  getEdits(token: ts.Node, file: ts.SourceFile, context: Context): ts.FileTextChanges[] {
    return []
  }
}
