import type { CustomFontFace } from "unplugin-fonts/types";
import Unfonts from "unplugin-fonts/vite";
import type { Plugin } from "vite";

export const getFonts = (): Plugin | Plugin[] => {
  return Unfonts({
    custom: {
      display: "swap",
      preload: false,
      prefetch: false,
      injectTo: "head-prepend",
      families: [
        {
          name: "Proxima Nova",
          local: "Proxima Nova",
          src: "./src/shared/fonts/*.otf",
          transform(font): CustomFontFace {
            const fontNameMap: Record<string, number> = {
              proximanova_bold: 700,
            };

            if (fontNameMap[font.basename]) {
              font.weight = fontNameMap[font.basename];
            }

            return font;
          },
        },
        {
          name: "Proxima Nova",
          local: "Proxima Nova",
          src: "./src/shared/fonts/*.ttf",
          transform(font): CustomFontFace {
            const fontNameMap: Record<string, number> = {
              proximanova_regular: 400,
            };

            if (fontNameMap[font.basename]) {
              font.weight = fontNameMap[font.basename];
            }

            return font;
          },
        },
      ],
    },
  });
};
