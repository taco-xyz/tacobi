import { FC } from "react";

/**
 * @description Default tooltip date props.
 * @property date - The date to display in the tooltip.
 */
export interface TooltipDateProps {
  date: string;
}

/**
 * @description Default tooltip date component.
 */
export const TooltipDate: FC<TooltipDateProps> = ({ date }) => {
  return <p className="font-semibold">{date}</p>;
};
