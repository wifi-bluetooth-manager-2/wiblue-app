import { ReactNode } from "react";

export type NavbarMainProps = {
  children: ReactNode;
  [key: string]: unknown;
};

export function NavbarMain({ children, ...props }: NavbarMainProps) {
  return (
    <ul className="navbar__main" {...props}>
      {children}
    </ul>
  );
}
