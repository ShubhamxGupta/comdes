// --- Token Types ---

export type TokenType =
  | "KEYWORD"
  | "IDENTIFIER"
  | "NUMBER"
  | "OPERATOR"
  | "DELIMITER"
  | "STRING"
  | "COMMENT"
  | "WHITESPACE"
  | "UNKNOWN";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  length: number;
}

export interface LexerResult {
  tokens: Token[];
  symbolTable: SymbolEntry[];
  errors: LexerError[];
  stats: LexerStats;
}

export interface SymbolEntry {
  name: string;
  type: TokenType;
  occurrences: number;
  firstLine: number;
}

export interface LexerError {
  message: string;
  line: number;
  column: number;
  character: string;
}

export interface LexerStats {
  totalTokens: number;
  identifiers: number;
  keywords: number;
  numbers: number;
  operators: number;
  delimiters: number;
  strings: number;
  errors: number;
}

// --- Default keyword/operator sets ---

const DEFAULT_KEYWORDS = new Set([
  "if",
  "else",
  "while",
  "for",
  "do",
  "return",
  "break",
  "continue",
  "int",
  "float",
  "double",
  "char",
  "void",
  "string",
  "bool",
  "true",
  "false",
  "null",
  "const",
  "var",
  "let",
  "switch",
  "case",
  "default",
  "struct",
  "class",
  "new",
  "print",
  "input",
  "function",
  "def",
  "import",
  "from",
]);

const OPERATORS = new Set([
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
  "&&",
  "||",
  "!",
  "&",
  "|",
  "^",
  "~",
  "<<",
  ">>",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "->",
  ".",
  "::",
  "?",
  ":",
]);

const DELIMITERS = new Set(["(", ")", "{", "}", "[", "]", ";", ","]);

// --- Lexer ---

export function tokenize(
  input: string,
  customKeywords?: string[],
): LexerResult {
  const tokens: Token[] = [];
  const errors: LexerError[] = [];
  const keywords = customKeywords
    ? new Set([...DEFAULT_KEYWORDS, ...customKeywords])
    : DEFAULT_KEYWORDS;

  let pos = 0;
  let line = 1;
  let col = 1;

  const peek = (): string => (pos < input.length ? input[pos] : "");
  const advance = (): string => {
    const ch = input[pos++];
    if (ch === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  };

  while (pos < input.length) {
    const startLine = line;
    const startCol = col;
    const ch = peek();

    // Skip whitespace
    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    // Single-line comments: // ...
    if (ch === "/" && pos + 1 < input.length && input[pos + 1] === "/") {
      let comment = "";
      while (pos < input.length && peek() !== "\n") {
        comment += advance();
      }
      tokens.push({
        type: "COMMENT",
        value: comment,
        line: startLine,
        column: startCol,
        length: comment.length,
      });
      continue;
    }

    // Multi-line comments: /* ... */
    if (ch === "/" && pos + 1 < input.length && input[pos + 1] === "*") {
      let comment = advance() + advance(); // consume /*
      while (pos < input.length) {
        if (
          peek() === "*" &&
          pos + 1 < input.length &&
          input[pos + 1] === "/"
        ) {
          comment += advance() + advance(); // consume */
          break;
        }
        comment += advance();
      }
      tokens.push({
        type: "COMMENT",
        value: comment,
        line: startLine,
        column: startCol,
        length: comment.length,
      });
      continue;
    }

    // String literals
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let str = advance(); // consume opening quote
      while (pos < input.length && peek() !== quote) {
        if (peek() === "\\") str += advance(); // escape
        str += advance();
      }
      if (pos < input.length) str += advance(); // consume closing quote
      tokens.push({
        type: "STRING",
        value: str,
        line: startLine,
        column: startCol,
        length: str.length,
      });
      continue;
    }

    // Numbers (integer and float)
    if (/[0-9]/.test(ch)) {
      let num = "";
      while (pos < input.length && /[0-9]/.test(peek())) {
        num += advance();
      }
      if (
        pos < input.length &&
        peek() === "." &&
        pos + 1 < input.length &&
        /[0-9]/.test(input[pos + 1])
      ) {
        num += advance(); // consume .
        while (pos < input.length && /[0-9]/.test(peek())) {
          num += advance();
        }
      }
      tokens.push({
        type: "NUMBER",
        value: num,
        line: startLine,
        column: startCol,
        length: num.length,
      });
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = "";
      while (pos < input.length && /[a-zA-Z0-9_]/.test(peek())) {
        ident += advance();
      }
      const type: TokenType = keywords.has(ident) ? "KEYWORD" : "IDENTIFIER";
      tokens.push({
        type,
        value: ident,
        line: startLine,
        column: startCol,
        length: ident.length,
      });
      continue;
    }

    // Delimiters
    if (DELIMITERS.has(ch)) {
      advance();
      tokens.push({
        type: "DELIMITER",
        value: ch,
        line: startLine,
        column: startCol,
        length: 1,
      });
      continue;
    }

    // Multi-character operators (try 3-char, then 2-char, then 1-char)
    if (pos + 2 < input.length) {
      const three = input.substring(pos, pos + 3);
      if (OPERATORS.has(three)) {
        advance();
        advance();
        advance();
        tokens.push({
          type: "OPERATOR",
          value: three,
          line: startLine,
          column: startCol,
          length: 3,
        });
        continue;
      }
    }
    if (pos + 1 < input.length) {
      const two = input.substring(pos, pos + 2);
      if (OPERATORS.has(two)) {
        advance();
        advance();
        tokens.push({
          type: "OPERATOR",
          value: two,
          line: startLine,
          column: startCol,
          length: 2,
        });
        continue;
      }
    }
    if (OPERATORS.has(ch)) {
      advance();
      tokens.push({
        type: "OPERATOR",
        value: ch,
        line: startLine,
        column: startCol,
        length: 1,
      });
      continue;
    }

    // Unknown character
    advance();
    errors.push({
      message: `Unexpected character '${ch}'`,
      line: startLine,
      column: startCol,
      character: ch,
    });
    tokens.push({
      type: "UNKNOWN",
      value: ch,
      line: startLine,
      column: startCol,
      length: 1,
    });
  }

  // Build symbol table
  const symbolMap = new Map<string, SymbolEntry>();
  for (const token of tokens) {
    if (token.type === "IDENTIFIER" || token.type === "KEYWORD") {
      const existing = symbolMap.get(token.value);
      if (existing) {
        existing.occurrences++;
      } else {
        symbolMap.set(token.value, {
          name: token.value,
          type: token.type,
          occurrences: 1,
          firstLine: token.line,
        });
      }
    }
  }

  const stats: LexerStats = {
    totalTokens: tokens.length,
    identifiers: tokens.filter((t) => t.type === "IDENTIFIER").length,
    keywords: tokens.filter((t) => t.type === "KEYWORD").length,
    numbers: tokens.filter((t) => t.type === "NUMBER").length,
    operators: tokens.filter((t) => t.type === "OPERATOR").length,
    delimiters: tokens.filter((t) => t.type === "DELIMITER").length,
    strings: tokens.filter((t) => t.type === "STRING").length,
    errors: errors.length,
  };

  return {
    tokens,
    symbolTable: Array.from(symbolMap.values()),
    errors,
    stats,
  };
}

// Color map for token types (used by UI)
export const TOKEN_COLORS: Record<TokenType, string> = {
  KEYWORD: "text-purple-600 dark:text-purple-400",
  IDENTIFIER: "text-sky-600 dark:text-sky-400",
  NUMBER: "text-emerald-600 dark:text-emerald-400",
  OPERATOR: "text-amber-600 dark:text-amber-400",
  DELIMITER: "text-rose-600 dark:text-rose-400",
  STRING: "text-green-600 dark:text-green-400",
  COMMENT: "text-zinc-400 dark:text-zinc-500 italic",
  WHITESPACE: "text-muted-foreground",
  UNKNOWN: "text-red-500",
};

export const TOKEN_BG_COLORS: Record<TokenType, string> = {
  KEYWORD: "bg-purple-500/10",
  IDENTIFIER: "bg-sky-500/10",
  NUMBER: "bg-emerald-500/10",
  OPERATOR: "bg-amber-500/10",
  DELIMITER: "bg-rose-500/10",
  STRING: "bg-green-500/10",
  COMMENT: "bg-zinc-500/10",
  WHITESPACE: "bg-muted/10",
  UNKNOWN: "bg-red-500/10",
};
