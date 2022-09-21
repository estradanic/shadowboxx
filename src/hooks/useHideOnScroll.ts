import { useLayoutEffect, useRef, useState } from "react";

export type UseHideOnScrollOptions = {
  /** Whether to allow untrusted events (e.g. from a browser extension) */
  allowUntrustedEvents?: boolean;
};

/**
 * Hook to return visibility state based on scrolling
 * (visible on scroll up, invisible on scroll down)
 */
const useHideOnScroll = ({
  allowUntrustedEvents,
}: UseHideOnScrollOptions = {}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const scrollTopRef = useRef<number>(0);

  // Set the header invisible when it's scrolled down
  // Set it visible again when scrolled up
  useLayoutEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      if (e.isTrusted || allowUntrustedEvents) {
        setVisible(scrollTopRef.current >= scrollTop);
      }
      scrollTopRef.current = scrollTop;
    };
    document.body.addEventListener("scroll", handleScroll);
    return () => document.body.removeEventListener("scroll", handleScroll);
  });

  return visible;
};

export default useHideOnScroll;
