import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/nginx.js
var require_nginx = __commonJS({
  "node_modules/highlight.js/lib/languages/nginx.js"(exports, module) {
    function nginx(hljs) {
      const VAR = {
        className: "variable",
        variants: [
          {
            begin: /\$\d+/
          },
          {
            begin: /\$\{/,
            end: /\}/
          },
          {
            begin: /[$@]/ + hljs.UNDERSCORE_IDENT_RE
          }
        ]
      };
      const DEFAULT = {
        endsWithParent: true,
        keywords: {
          $pattern: "[a-z/_]+",
          literal: "on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"
        },
        relevance: 0,
        illegal: "=>",
        contains: [
          hljs.HASH_COMMENT_MODE,
          {
            className: "string",
            contains: [
              hljs.BACKSLASH_ESCAPE,
              VAR
            ],
            variants: [
              {
                begin: /"/,
                end: /"/
              },
              {
                begin: /'/,
                end: /'/
              }
            ]
          },
          // this swallows entire URLs to avoid detecting numbers within
          {
            begin: "([a-z]+):/",
            end: "\\s",
            endsWithParent: true,
            excludeEnd: true,
            contains: [VAR]
          },
          {
            className: "regexp",
            contains: [
              hljs.BACKSLASH_ESCAPE,
              VAR
            ],
            variants: [
              {
                begin: "\\s\\^",
                end: "\\s|\\{|;",
                returnEnd: true
              },
              // regexp locations (~, ~*)
              {
                begin: "~\\*?\\s+",
                end: "\\s|\\{|;",
                returnEnd: true
              },
              // *.example.com
              {
                begin: "\\*(\\.[a-z\\-]+)+"
              },
              // sub.example.*
              {
                begin: "([a-z\\-]+\\.)+\\*"
              }
            ]
          },
          // IP
          {
            className: "number",
            begin: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"
          },
          // units
          {
            className: "number",
            begin: "\\b\\d+[kKmMgGdshdwy]*\\b",
            relevance: 0
          },
          VAR
        ]
      };
      return {
        name: "Nginx config",
        aliases: ["nginxconf"],
        contains: [
          hljs.HASH_COMMENT_MODE,
          {
            begin: hljs.UNDERSCORE_IDENT_RE + "\\s+\\{",
            returnBegin: true,
            end: /\{/,
            contains: [
              {
                className: "section",
                begin: hljs.UNDERSCORE_IDENT_RE
              }
            ],
            relevance: 0
          },
          {
            begin: hljs.UNDERSCORE_IDENT_RE + "\\s",
            end: ";|\\{",
            returnBegin: true,
            contains: [
              {
                className: "attribute",
                begin: hljs.UNDERSCORE_IDENT_RE,
                starts: DEFAULT
              }
            ],
            relevance: 0
          }
        ],
        illegal: "[^\\s\\}]"
      };
    }
    module.exports = nginx;
  }
});

export {
  require_nginx
};
//# sourceMappingURL=chunk-M4ECOA44.js.map
