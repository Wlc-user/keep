import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/tcl.js
var require_tcl = __commonJS({
  "node_modules/highlight.js/lib/languages/tcl.js"(exports, module) {
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;
      return re.source;
    }
    function optional(re) {
      return concat("(", re, ")?");
    }
    function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
    }
    function tcl(hljs) {
      const TCL_IDENT = /[a-zA-Z_][a-zA-Z0-9_]*/;
      const NUMBER = {
        className: "number",
        variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]
      };
      return {
        name: "Tcl",
        aliases: ["tk"],
        keywords: "after append apply array auto_execok auto_import auto_load auto_mkindex auto_mkindex_old auto_qualify auto_reset bgerror binary break catch cd chan clock close concat continue dde dict encoding eof error eval exec exit expr fblocked fconfigure fcopy file fileevent filename flush for foreach format gets glob global history http if incr info interp join lappend|10 lassign|10 lindex|10 linsert|10 list llength|10 load lrange|10 lrepeat|10 lreplace|10 lreverse|10 lsearch|10 lset|10 lsort|10 mathfunc mathop memory msgcat namespace open package parray pid pkg::create pkg_mkIndex platform platform::shell proc puts pwd read refchan regexp registry regsub|10 rename return safe scan seek set socket source split string subst switch tcl_endOfWord tcl_findLibrary tcl_startOfNextWord tcl_startOfPreviousWord tcl_wordBreakAfter tcl_wordBreakBefore tcltest tclvars tell time tm trace unknown unload unset update uplevel upvar variable vwait while",
        contains: [
          hljs.COMMENT(";[ \\t]*#", "$"),
          hljs.COMMENT("^[ \\t]*#", "$"),
          {
            beginKeywords: "proc",
            end: "[\\{]",
            excludeEnd: true,
            contains: [
              {
                className: "title",
                begin: "[ \\t\\n\\r]+(::)?[a-zA-Z_]((::)?[a-zA-Z0-9_])*",
                end: "[ \\t\\n\\r]",
                endsWithParent: true,
                excludeEnd: true
              }
            ]
          },
          {
            className: "variable",
            variants: [
              {
                begin: concat(
                  /\$/,
                  optional(/::/),
                  TCL_IDENT,
                  "(::",
                  TCL_IDENT,
                  ")*"
                )
              },
              {
                begin: "\\$\\{(::)?[a-zA-Z_]((::)?[a-zA-Z0-9_])*",
                end: "\\}",
                contains: [
                  NUMBER
                ]
              }
            ]
          },
          {
            className: "string",
            contains: [hljs.BACKSLASH_ESCAPE],
            variants: [
              hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null })
            ]
          },
          NUMBER
        ]
      };
    }
    module.exports = tcl;
  }
});

export {
  require_tcl
};
//# sourceMappingURL=chunk-6FO3UBZW.js.map
