import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/refractor/lang/arff.js
var require_arff = __commonJS({
  "node_modules/refractor/lang/arff.js"(exports, module) {
    module.exports = arff;
    arff.displayName = "arff";
    arff.aliases = [];
    function arff(Prism) {
      Prism.languages.arff = {
        comment: /%.*/,
        string: {
          pattern: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
          greedy: true
        },
        keyword: /@(?:attribute|data|end|relation)\b/i,
        number: /\b\d+(?:\.\d+)?\b/,
        punctuation: /[{},]/
      };
    }
  }
});

export {
  require_arff
};
//# sourceMappingURL=chunk-NC3K2NC6.js.map
