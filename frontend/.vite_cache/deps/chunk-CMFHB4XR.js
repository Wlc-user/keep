import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/dts.js
var require_dts = __commonJS({
  "node_modules/highlight.js/lib/languages/dts.js"(exports, module) {
    function dts(hljs) {
      const STRINGS = {
        className: "string",
        variants: [
          hljs.inherit(hljs.QUOTE_STRING_MODE, {
            begin: '((u8?|U)|L)?"'
          }),
          {
            begin: '(u8?|U)?R"',
            end: '"',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          {
            begin: "'\\\\?.",
            end: "'",
            illegal: "."
          }
        ]
      };
      const NUMBERS = {
        className: "number",
        variants: [
          {
            begin: "\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"
          },
          {
            begin: hljs.C_NUMBER_RE
          }
        ],
        relevance: 0
      };
      const PREPROCESSOR = {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: {
          "meta-keyword": "if else elif endif define undef ifdef ifndef"
        },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          {
            beginKeywords: "include",
            end: "$",
            keywords: {
              "meta-keyword": "include"
            },
            contains: [
              hljs.inherit(STRINGS, {
                className: "meta-string"
              }),
              {
                className: "meta-string",
                begin: "<",
                end: ">",
                illegal: "\\n"
              }
            ]
          },
          STRINGS,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      };
      const DTS_REFERENCE = {
        className: "variable",
        begin: /&[a-z\d_]*\b/
      };
      const DTS_KEYWORD = {
        className: "meta-keyword",
        begin: "/[a-z][a-z\\d-]*/"
      };
      const DTS_LABEL = {
        className: "symbol",
        begin: "^\\s*[a-zA-Z_][a-zA-Z\\d_]*:"
      };
      const DTS_CELL_PROPERTY = {
        className: "params",
        begin: "<",
        end: ">",
        contains: [
          NUMBERS,
          DTS_REFERENCE
        ]
      };
      const DTS_NODE = {
        className: "class",
        begin: /[a-zA-Z_][a-zA-Z\d_@]*\s\{/,
        end: /[{;=]/,
        returnBegin: true,
        excludeEnd: true
      };
      const DTS_ROOT_NODE = {
        className: "class",
        begin: "/\\s*\\{",
        end: /\};/,
        relevance: 10,
        contains: [
          DTS_REFERENCE,
          DTS_KEYWORD,
          DTS_LABEL,
          DTS_NODE,
          DTS_CELL_PROPERTY,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          NUMBERS,
          STRINGS
        ]
      };
      return {
        name: "Device Tree",
        keywords: "",
        contains: [
          DTS_ROOT_NODE,
          DTS_REFERENCE,
          DTS_KEYWORD,
          DTS_LABEL,
          DTS_NODE,
          DTS_CELL_PROPERTY,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          NUMBERS,
          STRINGS,
          PREPROCESSOR,
          {
            begin: hljs.IDENT_RE + "::",
            keywords: ""
          }
        ]
      };
    }
    module.exports = dts;
  }
});

export {
  require_dts
};
//# sourceMappingURL=chunk-CMFHB4XR.js.map
