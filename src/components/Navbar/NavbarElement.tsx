import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";

export type NavbarElementProps = {
  children: ReactNode;
  link?: string | undefined;
  [key: string]: unknown;
};

export function NavbarElement({
  children,
  link = undefined,
  ...props
}: NavbarElementProps) {
  return (
    <li className={styles.navbar__element} {...props}>
      <Link to={link ?? ""} className={styles.navbar__element_a}>
        {children}
      </Link>
    </li>
  );
}
