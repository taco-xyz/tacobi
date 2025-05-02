import { FC } from "react";

/**
 * @description Default tooltip divider props.
 * @property dashed - Whether the divider should be dashed.
 */
export interface TooltipDividerProps {
  dashed?: boolean;
}

/**
 * @description Default tooltip divider component.
 */
export const TooltipDivider: FC<TooltipDividerProps> = ({ dashed }) => {
  return (
    <div
      className={`h-px w-full ${dashed ? "border-b border-dashed" : "border-b"} border-gray-200 dark:border-gray-800`}
    />
  );
};
