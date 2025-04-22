// React Imports
import { FC } from "react";

// Image Imports
import Image from "next/image";

/**
 * @function Logo
 * @description A component that displays the logo.
 */
export const Logo: FC = () => {
  return (
    <Image
      src="/morpho-logo-light-mode.svg"
      alt="logo"
      width={74}
      height={69}
      className="size-8 flex-shrink-0 lg:size-10"
    />
  );
};
