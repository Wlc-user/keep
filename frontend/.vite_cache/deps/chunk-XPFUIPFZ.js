import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/protobuf.js
var require_protobuf = __commonJS({
  "node_modules/highlight.js/lib/languages/protobuf.js"(exports, module) {
    function protobuf(hljs) {
      return {
        name: "Protocol Buffers",
        keywords: {
          keyword: "package import option optional required repeated group oneof",
          built_in: "double float int32 int64 uint32 uint64 sint32 sint64 fixed32 fixed64 sfixed32 sfixed64 bool string bytes",
          literal: "true false"
        },
        contains: [
          hljs.QUOTE_STRING_MODE,
          hljs.NUMBER_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: "class",
            beginKeywords: "message enum service",
            end: /\{/,
            illegal: /\n/,
            contains: [
              hljs.inherit(hljs.TITLE_MODE, {
                starts: { endsWithParent: true, excludeEnd: true }
                // hack: eating everything after the first title
              })
            ]
          },
          {
            className: "function",
            beginKeywords: "rpc",
            end: /[{;]/,
            excludeEnd: true,
            keywords: "rpc returns"
          },
          {
            // match enum items (relevance)
            // BLAH = ...;
            begin: /^\s*[A-Z_]+(?=\s*=[^\n]+;$)/
          }
        ]
      };
    }
    module.exports = protobuf;
  }
});

export {
  require_protobuf
};
//# sourceMappingURL=chunk-XPFUIPFZ.js.map
