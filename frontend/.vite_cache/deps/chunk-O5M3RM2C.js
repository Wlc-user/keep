import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/vala.js
var require_vala = __commonJS({
  "node_modules/highlight.js/lib/languages/vala.js"(exports, module) {
    function vala(hljs) {
      return {
        name: "Vala",
        keywords: {
          keyword: (
            // Value types
            "char uchar unichar int uint long ulong short ushort int8 int16 int32 int64 uint8 uint16 uint32 uint64 float double bool struct enum string void weak unowned owned async signal static abstract interface override virtual delegate if while do for foreach else switch case break default return try catch public private protected internal using new this get set const stdout stdin stderr var"
          ),
          built_in: "DBus GLib CCode Gee Object Gtk Posix",
          literal: "false true null"
        },
        contains: [
          {
            className: "class",
            beginKeywords: "class interface namespace",
            end: /\{/,
            excludeEnd: true,
            illegal: "[^,:\\n\\s\\.]",
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: "string",
            begin: '"""',
            end: '"""',
            relevance: 5
          },
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.C_NUMBER_MODE,
          {
            className: "meta",
            begin: "^#",
            end: "$",
            relevance: 2
          }
        ]
      };
    }
    module.exports = vala;
  }
});

export {
  require_vala
};
//# sourceMappingURL=chunk-O5M3RM2C.js.map
