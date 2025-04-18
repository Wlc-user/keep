import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/haxe.js
var require_haxe = __commonJS({
  "node_modules/highlight.js/lib/languages/haxe.js"(exports, module) {
    function haxe(hljs) {
      const HAXE_BASIC_TYPES = "Int Float String Bool Dynamic Void Array ";
      return {
        name: "Haxe",
        aliases: ["hx"],
        keywords: {
          keyword: "break case cast catch continue default do dynamic else enum extern for function here if import in inline never new override package private get set public return static super switch this throw trace try typedef untyped using var while " + HAXE_BASIC_TYPES,
          built_in: "trace this",
          literal: "true false null _"
        },
        contains: [
          {
            className: "string",
            // interpolate-able strings
            begin: "'",
            end: "'",
            contains: [
              hljs.BACKSLASH_ESCAPE,
              {
                className: "subst",
                // interpolation
                begin: "\\$\\{",
                end: "\\}"
              },
              {
                className: "subst",
                // interpolation
                begin: "\\$",
                end: /\W\}/
              }
            ]
          },
          hljs.QUOTE_STRING_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.C_NUMBER_MODE,
          {
            className: "meta",
            // compiler meta
            begin: "@:",
            end: "$"
          },
          {
            className: "meta",
            // compiler conditionals
            begin: "#",
            end: "$",
            keywords: {
              "meta-keyword": "if else elseif end error"
            }
          },
          {
            className: "type",
            // function types
            begin: ":[ 	]*",
            end: "[^A-Za-z0-9_ 	\\->]",
            excludeBegin: true,
            excludeEnd: true,
            relevance: 0
          },
          {
            className: "type",
            // types
            begin: ":[ 	]*",
            end: "\\W",
            excludeBegin: true,
            excludeEnd: true
          },
          {
            className: "type",
            // instantiation
            begin: "new *",
            end: "\\W",
            excludeBegin: true,
            excludeEnd: true
          },
          {
            className: "class",
            // enums
            beginKeywords: "enum",
            end: "\\{",
            contains: [hljs.TITLE_MODE]
          },
          {
            className: "class",
            // abstracts
            beginKeywords: "abstract",
            end: "[\\{$]",
            contains: [
              {
                className: "type",
                begin: "\\(",
                end: "\\)",
                excludeBegin: true,
                excludeEnd: true
              },
              {
                className: "type",
                begin: "from +",
                end: "\\W",
                excludeBegin: true,
                excludeEnd: true
              },
              {
                className: "type",
                begin: "to +",
                end: "\\W",
                excludeBegin: true,
                excludeEnd: true
              },
              hljs.TITLE_MODE
            ],
            keywords: {
              keyword: "abstract from to"
            }
          },
          {
            className: "class",
            // classes
            begin: "\\b(class|interface) +",
            end: "[\\{$]",
            excludeEnd: true,
            keywords: "class interface",
            contains: [
              {
                className: "keyword",
                begin: "\\b(extends|implements) +",
                keywords: "extends implements",
                contains: [
                  {
                    className: "type",
                    begin: hljs.IDENT_RE,
                    relevance: 0
                  }
                ]
              },
              hljs.TITLE_MODE
            ]
          },
          {
            className: "function",
            beginKeywords: "function",
            end: "\\(",
            excludeEnd: true,
            illegal: "\\S",
            contains: [hljs.TITLE_MODE]
          }
        ],
        illegal: /<\//
      };
    }
    module.exports = haxe;
  }
});

export {
  require_haxe
};
//# sourceMappingURL=chunk-G5O2ZAWH.js.map
