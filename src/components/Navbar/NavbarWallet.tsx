import React, { ReactNode } from "react";
import NavbarUserInfo from "./NavbarUserInfo";
import useUserContext from "../../contexts/userContextProvider";

import styles from "./styles.module.scss";

type NavbarUserProps = {
  children?: ReactNode;
};

const NavbarWallet = ({ children }: NavbarUserProps) => {
  const { User } = useUserContext();

  return (
    <>
      {User.username && User.userId ? (
        <li className={styles.navbar__user}>
          <div className={styles.navbar__user__info}>
            <NavbarUserInfo
              username={User.username}
              userPropfilePicture={User.profilePicture ?? undefined}
            />
          </div>
        </li>
      ) : null}
    </>
  );
};

export default NavbarWallet;
