import type { Ref } from "vue";
import { ref } from "vue";

// This should match the `shared/ui/theme/media.css` file
export const media = {
  mobile: "(max-width: 755px)",
  tablet: "(min-width: 756px)",
  desktop: "(min-width: 1024px)",
};

/**
 * A hook to dynamically check if the current screen size matches the given media type
 *
 * Example:
 * ```
 * <div v-if="isMobile">Mobile</div>
 *
 * const isMobile = useMedia('mobile');
 * ```
 */
export const useMedia = (type: keyof typeof media): Ref<boolean> => {
  const matches = ref(window.matchMedia(media[type]).matches);

  window.addEventListener("resize", () => {
    matches.value = window.matchMedia(media[type]).matches;
  });

  return matches;
};
