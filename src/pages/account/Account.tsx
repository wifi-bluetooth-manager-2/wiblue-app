import NavbarModel from "../../components/NavbarModel/NavbarModel";
import LoginRegisterButton from "../../components/LoginRegisterButton/LoginRegisterButton";
import useUserContext from "../../contexts/userContextProvider";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import { User } from "../../types/user";
import { SubmitHandler, useForm } from "react-hook-form";
import ApiLinks from "../../constants/apilinks";
import FormErrorWrap from "../../components/FormError/FormErrorWrap";
import Regex from "../../constants/regex";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const Account = () => {
  const { UserDispatch, User } = useUserContext();
  const navi = useNavigate();

  type InterfaceOption = string;

  const [interfaces, setInterfaces] = useState<InterfaceOption[]>([]);

  useEffect(() => {
    invoke("scan_interfaces")
      .then((res: any) => {
        console.log("Raw response from Tauri:", res);

        const parsed = JSON.parse(res);
        console.log("Parsed object:", parsed);

        const interfaces = JSON.parse(parsed.message);
        console.log("Interfaces:", interfaces);

        setInterfaces(interfaces);
      })
      .catch((err) => {
        console.error("Error parsing interface list:", err);
      });
  }, []);

  type formPropsUsername = Pick<User, "username">;
  type formPropsPassword = {
    oldPassword: string;
    newPassword: string;
    repPassword: string;
  };

  const {
    register: registerUsername,
    handleSubmit: handleSubmitUsername,
    formState: { errors: errorsUsername },
  } = useForm<formPropsUsername>({
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    getValues,
  } = useForm<formPropsPassword>({
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  // Change Username Handler
  const onSubmitUsername: SubmitHandler<formPropsUsername> = async (data) => {
    const response = await fetch(ApiLinks.change_username, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        username: data.username,
      }),
      credentials: "include",
    });
    const responseData = await response.json();

    if (response.ok) {
      toast.success(responseData.message);
      UserDispatch({ type: "setUsername", value: data.username });
    } else {
      toast.error(responseData.error ?? "Error changing username");
    }
  };

  // Change Password Handler
  const onSubmitPassword: SubmitHandler<formPropsPassword> = async (data) => {
    const response = await fetch(ApiLinks.change_password, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        old_password: data.oldPassword,
        new_password: data.newPassword,
      }),
      credentials: "include",
    });
    const responseData = await response.json();

    if (response.ok) {
      toast.success(responseData.message);
    } else {
      toast.error(responseData.error ?? "Error changing password");
    }
  };

  return (
    <>
      <NavbarModel />
      <section className={styles.container}>
        <div>
          <img
            src={User.profilePicture ?? "/default-user.png"}
            width={32}
            height={32}
            alt="pfp"
            className={styles.photo}
          />
        </div>

        <div className={styles.userinfo}>
          {User.userId ? (
            <>
              <p>Id: {User.userId ?? "Login first"}</p>
              <p>Username: {User.username ?? "Login first"}</p>
              <p>Email: {User.email ?? "Login first"}</p>
            </>
          ) : (
            <></>
          )}

          <p>Interface: {User.interface ?? "Not yet selected"}</p>
        </div>

        <div className={styles.interfaceWrapper}>
          <label htmlFor="interface">Select Interface</label>
          <select
            id="interface"
            className={styles.interfaceSelect}
            value={User.interface ?? "None"}
            onChange={(e) =>
              UserDispatch({ type: "setInterface", value: e.target.value })
            }
          >
            <option value="" disabled>
              Select an interface
            </option>
            {interfaces.map((iface, idx) => (
              <option key={idx} value={iface}>
                {iface}
              </option>
            ))}
          </select>
        </div>

        {/* Change Username Form */}
        <form
          className={styles.login_form}
          onSubmit={handleSubmitUsername(onSubmitUsername)}
        >
          <h3>Change Username</h3>
          <FormErrorWrap>
            <input
              {...registerUsername("username", {
                required: {
                  value: true,
                  message: "Username is required",
                },
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters long",
                },
              })}
              type="text"
              placeholder="New Username"
              className={styles.input_field}
            />
            {errorsUsername.username && (
              <p className={styles.error}>{errorsUsername.username.message}</p>
            )}
          </FormErrorWrap>

          <input
            type="submit"
            value="Change Username"
            className={styles.submit}
          />
        </form>

        {/* Change Password Form */}
        <form
          className={styles.login_form}
          onSubmit={handleSubmitPassword(onSubmitPassword)}
        >
          <h3>Change Password</h3>

          <FormErrorWrap>
            <input
              {...registerPassword("oldPassword", {
                required: {
                  value: true,
                  message: "Current password is required",
                },
              })}
              type="password"
              placeholder="Current Password"
              className={styles.input_field}
            />
            {errorsPassword.oldPassword && (
              <p className={styles.error}>
                {errorsPassword.oldPassword.message}
              </p>
            )}
          </FormErrorWrap>

          <FormErrorWrap>
            <input
              {...registerPassword("newPassword", {
                required: {
                  value: true,
                  message: "New password is required",
                },
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              type="password"
              placeholder="New Password"
              className={styles.input_field}
            />
            {errorsPassword.newPassword && (
              <p className={styles.error}>
                {errorsPassword.newPassword.message}
              </p>
            )}
          </FormErrorWrap>

          <FormErrorWrap>
            <input
              {...registerPassword("repPassword", {
                required: {
                  value: true,
                  message: "Please confirm your new password",
                },
                validate: (repPassword) => {
                  if (getValues().newPassword !== repPassword) {
                    return "Passwords must match";
                  }
                  return true;
                },
              })}
              type="password"
              placeholder="Repeat New Password"
              className={styles.input_field}
            />
            {errorsPassword.repPassword && (
              <p className={styles.error}>
                {errorsPassword.repPassword.message}
              </p>
            )}
          </FormErrorWrap>

          <input
            type="submit"
            value="Change Password"
            className={styles.submit}
          />
        </form>

        <div
          onClick={() => {
            UserDispatch({ type: "setUsername", value: null });
            UserDispatch({ type: "setTheme", value: "light" });
            UserDispatch({ type: "setProfilePicture", value: null });
            UserDispatch({ type: "setEmail", value: null });
            UserDispatch({ type: "setId", value: null });
            localStorage.clear();
            toast.success("Logged out");
            navi("/");
          }}
          className={styles.logout}
        >
          LOGOUT
        </div>
      </section>
    </>
  );
};

export default Account;
