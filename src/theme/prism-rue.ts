Prism.languages.rue = {
  string: {
    pattern: /"(?:\\[^]|[^"\\])*"|'(?:\\[^]|[^'\\])*'/,
    greedy: true,
    inside: {
      escape: {
        pattern: /\\(?:x[0-9a-fA-F]{2}|u\{[0-9a-fA-F_]*\}|\r?\n\s*|[^])/,
        alias: "regex",
      },
    },
  },
  comment: {
    pattern: /\/\/.*|\/\*[^]*?\*\//,
    multiline: true,
    greedy: true,
  },
  attribute: {
    pattern: /#!?\[[^\]]*\]/,
    greedy: true,
    alias: "attr-name",
  },
  function: {
    pattern: /\b(fn)\s+[a-zA-Z_][a-zA-Z0-9_]*/,
    lookbehind: true,
  },
  "function-call": {
    pattern:
      /\b(?!(?:if|else|match|for|in|fold|return|raise|assert|debug|let|const|fn|as|is|mod|import|export|inline|super|project)\b)[a-zA-Z_][a-zA-Z0-9_]*\s*(?:::|\()/,
    alias: "function",
  },
  field: {
    pattern: /(?!\b(?:let|const))\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*:(?!:))/,
    alias: "property",
  },
  "field-access": {
    pattern: /\b(\.)([a-zA-Z_][a-zA-Z0-9_]*)/,
    lookbehind: true,
    alias: "property",
  },
  number: /\b(?:0x[0-9a-fA-F_]+|0b[01_]+|0o[0-7_]+|[0-9][0-9_]*)\b/,
  operator: /->|[+\-*/%\^~]|<[<=]?|>[>=]?|=[=>]?|!=?|\.{1,3}|::|&&?|\|\|?/,
  punctuation: /[(){}[\],:]/,
  "control-flow": {
    pattern: /\b(?:if|else|match|for|return|raise|assert|debug)\b/,
    alias: "keyword",
  },
  // `in` and `fold` are only keywords in a `for` header, and can be used as names elsewhere
  "for-clause": {
    pattern: /\b(?:in|fold)\b(?=\s+[\w(\[\-"'])/,
    alias: "keyword",
  },
  binding: {
    pattern: /\b(?:let|const|fn)\b/,
    alias: "keyword",
  },
  type: {
    pattern: /\b(?:type|struct|enum|as|is)\b/,
    alias: "keyword",
  },
  module: {
    pattern: /\b(?:import|from|mod|super|project)\b/,
    alias: "keyword",
  },
  modifier: { pattern: /\b(?:inline|export|extern|test)\b/, alias: "keyword" },
  boolean: /\b(?:false|true)\b/,
  null: {
    pattern: /\bnil\b/,
    alias: "constant",
  },
  builtin:
    /\b(?:Atom|Bytes|String|Bytes32|PublicKey|Signature|K1PublicKey|K1Signature|R1PublicKey|R1Signature|Int|Bool|Any|Never|List|AlternatingList)\b/,
  "class-name": /\b[A-Z][a-z][a-zA-Z0-9_]*\b/,
  constant: /\b[A-Z][A-Z0-9_]*\b/,
};
