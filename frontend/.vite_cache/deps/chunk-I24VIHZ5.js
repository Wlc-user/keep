import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/q.js
var require_q = __commonJS({
  "node_modules/highlight.js/lib/languages/q.js"(exports, module) {
    function q(hljs) {
      const KEYWORDS = {
        $pattern: /(`?)[A-Za-z0-9_]+\b/,
        keyword: "do while select delete by update from",
        literal: "0b 1b",
        built_in: "neg not null string reciprocal floor ceiling signum mod xbar xlog and or each scan over prior mmu lsq inv md5 ltime gtime count first var dev med cov cor all any rand sums prds mins maxs fills deltas ratios avgs differ prev next rank reverse iasc idesc asc desc msum mcount mavg mdev xrank mmin mmax xprev rotate distinct group where flip type key til get value attr cut set upsert raze union inter except cross sv vs sublist enlist read0 read1 hopen hclose hdel hsym hcount peach system ltrim rtrim trim lower upper ssr view tables views cols xcols keys xkey xcol xasc xdesc fkeys meta lj aj aj0 ij pj asof uj ww wj wj1 fby xgroup ungroup ej save load rsave rload show csv parse eval min max avg wavg wsum sin cos tan sum",
        type: "`float `double int `timestamp `timespan `datetime `time `boolean `symbol `char `byte `short `long `real `month `date `minute `second `guid"
      };
      return {
        name: "Q",
        aliases: [
          "k",
          "kdb"
        ],
        keywords: KEYWORDS,
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.C_NUMBER_MODE
        ]
      };
    }
    module.exports = q;
  }
});

export {
  require_q
};
//# sourceMappingURL=chunk-I24VIHZ5.js.map
