import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/highlight.js/lib/languages/rsl.js
var require_rsl = __commonJS({
  "node_modules/highlight.js/lib/languages/rsl.js"(exports, module) {
    function rsl(hljs) {
      return {
        name: "RenderMan RSL",
        keywords: {
          keyword: "float color point normal vector matrix while for if do return else break extern continue",
          built_in: "abs acos ambient area asin atan atmosphere attribute calculatenormal ceil cellnoise clamp comp concat cos degrees depth Deriv diffuse distance Du Dv environment exp faceforward filterstep floor format fresnel incident length lightsource log match max min mod noise normalize ntransform opposite option phong pnoise pow printf ptlined radians random reflect refract renderinfo round setcomp setxcomp setycomp setzcomp shadow sign sin smoothstep specular specularbrdf spline sqrt step tan texture textureinfo trace transform vtransform xcomp ycomp zcomp"
        },
        illegal: "</",
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.QUOTE_STRING_MODE,
          hljs.APOS_STRING_MODE,
          hljs.C_NUMBER_MODE,
          {
            className: "meta",
            begin: "#",
            end: "$"
          },
          {
            className: "class",
            beginKeywords: "surface displacement light volume imager",
            end: "\\("
          },
          {
            beginKeywords: "illuminate illuminance gather",
            end: "\\("
          }
        ]
      };
    }
    module.exports = rsl;
  }
});

export {
  require_rsl
};
//# sourceMappingURL=chunk-35PFNUAA.js.map
