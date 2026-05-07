import { Children, cloneElement, type ReactElement, type ReactNode } from "react";
import { useSectionZoom } from "@/hooks/useSectionZoom";

interface SectionZoomProps {
  children: ReactNode;
  scaleRange?: number;
  yRange?: number;
  className?: string;
}

export const SectionZoom = ({
  children,
  scaleRange,
  yRange,
  className,
}: SectionZoomProps) => {
  const { ref, scale, y, opacity } = useSectionZoom(scaleRange, yRange);

  const child = Children.only(children) as ReactElement;

  return cloneElement(child, {
    innerRef: ref,
    motionStyle: { scale, y, opacity },
  });
};
