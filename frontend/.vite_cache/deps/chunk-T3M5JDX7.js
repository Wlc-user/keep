import {
  require_t4_templating
} from "./chunk-QVZC2IFK.js";
import {
  require_vbnet
} from "./chunk-726T57IR.js";
import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/refractor/lang/t4-vb.js
var require_t4_vb = __commonJS({
  "node_modules/refractor/lang/t4-vb.js"(exports, module) {
    var refractorT4Templating = require_t4_templating();
    var refractorVbnet = require_vbnet();
    module.exports = t4Vb;
    t4Vb.displayName = "t4Vb";
    t4Vb.aliases = [];
    function t4Vb(Prism) {
      Prism.register(refractorT4Templating);
      Prism.register(refractorVbnet);
      Prism.languages["t4-vb"] = Prism.languages["t4-templating"].createT4("vbnet");
    }
  }
});

export {
  require_t4_vb
};
//# sourceMappingURL=chunk-T3M5JDX7.js.map
