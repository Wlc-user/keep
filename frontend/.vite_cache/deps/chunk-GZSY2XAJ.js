import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/ocaml.js
var require_ocaml = __commonJS({
  "node_modules/highlight.js/lib/languages/ocaml.js"(exports, module) {
    function ocaml(hljs) {
      return {
        name: "OCaml",
        aliases: ["ml"],
        keywords: {
          $pattern: "[a-z_]\\w*!?",
          keyword: "and as assert asr begin class constraint do done downto else end exception external for fun function functor if in include inherit! inherit initializer land lazy let lor lsl lsr lxor match method!|10 method mod module mutable new object of open! open or private rec sig struct then to try type val! val virtual when while with parser value",
          built_in: (
            /* built-in types */
            "array bool bytes char exn|5 float int int32 int64 list lazy_t|5 nativeint|5 string unit in_channel out_channel ref"
          ),
          literal: "true false"
        },
        illegal: /\/\/|>>/,
        contains: [
          {
            className: "literal",
            begin: "\\[(\\|\\|)?\\]|\\(\\)",
            relevance: 0
          },
          hljs.COMMENT(
            "\\(\\*",
            "\\*\\)",
            {
              contains: ["self"]
            }
          ),
          {
            /* type variable */
            className: "symbol",
            begin: "'[A-Za-z_](?!')[\\w']*"
            /* the grammar is ambiguous on how 'a'b should be interpreted but not the compiler */
          },
          {
            /* polymorphic variant */
            className: "type",
            begin: "`[A-Z][\\w']*"
          },
          {
            /* module or constructor */
            className: "type",
            begin: "\\b[A-Z][\\w']*",
            relevance: 0
          },
          {
            /* don't color identifiers, but safely catch all identifiers with '*/
            begin: "[a-z_]\\w*'[\\w']*",
            relevance: 0
          },
          hljs.inherit(hljs.APOS_STRING_MODE, { className: "string", relevance: 0 }),
          hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null }),
          {
            className: "number",
            begin: "\\b(0[xX][a-fA-F0-9_]+[Lln]?|0[oO][0-7_]+[Lln]?|0[bB][01_]+[Lln]?|[0-9][0-9_]*([Lln]|(\\.[0-9_]*)?([eE][-+]?[0-9_]+)?)?)",
            relevance: 0
          },
          {
            begin: /->/
            // relevance booster
          }
        ]
      };
    }
    module.exports = ocaml;
  }
});

export {
  require_ocaml
};
//# sourceMappingURL=chunk-GZSY2XAJ.js.map
