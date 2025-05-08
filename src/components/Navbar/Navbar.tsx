import { ReactNode } from "react";
import styles from "./styles.module.scss";
import useUserContext from "../../contexts/userContextProvider";

export type NavbarProps = {
  children: ReactNode;
};

function Navbar({ children, ...props }: NavbarProps) {
  return (
    <nav {...props} className={styles.navbar}>
      {children}
    </nav>
  );
}

export default Navbar;
