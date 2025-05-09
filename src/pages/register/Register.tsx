import { SubmitHandler, useForm } from "react-hook-form";
import { User } from "../../types/user";
import OLF from "../../Olf/olf";
import ApiLinks from "../../constants/apilinks";
import NavbarModel from "../../components/NavbarModel/NavbarModel";
import FormErrorWrap from "../../components/FormError/FormErrorWrap";
import Regex from "../../constants/regex";
import FormErrorParahraph from "../../components/FormError/FormErrorParagraph";
import AuthConst from "../../constants/auth";
import LoginRegisterButton from "../../components/LoginRegisterButton/LoginRegisterButton";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.scss"; // Import styles module
import toast from "react-hot-toast";
import useUserContext from "../../contexts/userContextProvider";
import { useEffect } from "react";

export default function Login() {
  type formProps = Pick<User, "email" | "username"> & {
    password: string | null;
    repPassword: string | null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setError,
  } = useForm<formProps>({
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const { UserDispatch } = useUserContext();

  const navi = useNavigate();

  const onSubmit: SubmitHandler<formProps> = async (data) => {
    const response = fetch(ApiLinks.register, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });
    response
      .then((data) => {
        data.json().then((res) => {
          console.log(res.message);
          console.log(data.status);
          const message = res.message;
          localStorage.setItem("token", message.token);

          if (data.status == 400) {
            toast.error(message ?? "Error while registering");
          } else {
            toast.success("User registered successfully");
            UserDispatch({ type: "setUsername", value: message.user.username });
            UserDispatch({ type: "setId", value: message.user.id });
            UserDispatch({ type: "setEmail", value: message.user.email });

            UserDispatch({ type: "setToken", value: message.token });
            navi("/");
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
    // const navi = useNavigate();
    // navi("/");
  };

  return (
    <>
      <NavbarModel />
      <section className={styles.container}>
        <article className={styles.login_form}>
          <header className={styles.login_header}>Create WiBlue account</header>
          <form className={styles.login_form} onSubmit={handleSubmit(onSubmit)}>
            <FormErrorWrap>
              <input
                {...register("email", {
                  validate: (email) => {
                    const emailRegexResult = Regex.emailRegistration.test(
                      email ?? "",
                    );
                    if (!emailRegexResult) {
                      return "Email must be correct";
                    }
                    return true;
                  },
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                })}
                type="text"
                placeholder="Email"
                name="email"
                className={styles.input_field}
              />
              <FormErrorParahraph errorObject={errors.email} />
            </FormErrorWrap>

            <FormErrorWrap>
              <input
                {...register("username", {
                  minLength: {
                    value: AuthConst.minUsernameLength,
                    message: `Username must have at least ${AuthConst.minUsernameLength} characters`,
                  },
                  maxLength: {
                    value: AuthConst.maxUsernameLength,
                    message: `Username must have less than ${AuthConst.maxUsernameLength} characters`,
                  },
                  required: {
                    value: true,
                    message: "Username is required",
                  },
                })}
                type="text"
                placeholder="Username"
                name="username"
                className={styles.input_field}
              />
              <FormErrorParahraph errorObject={errors.username} />
            </FormErrorWrap>

            <FormErrorWrap>
              <input
                {...register("password", {
                  minLength: {
                    value: AuthConst.minPasswordLength,
                    message: `Password must have at least ${AuthConst.minPasswordLength} characters`,
                  },
                  required: {
                    value: true,
                    message: "Password is required",
                  },
                  validate: (password) => {
                    const passwordRegexResult = Regex.password.test(
                      password ?? "",
                    );
                    if (!passwordRegexResult || !password) {
                      return "Password must have letters numbers and special characters";
                    }
                    if (password?.toLowerCase() === password) {
                      return "Password must have at least one capital letter";
                    }
                    if (!/\d/.test(password)) {
                      return "Password must have at least one number";
                    }
                    if (
                      !/[!@#$%^&*(),.?":{}|<>[\]\\\/~'=_+\-]/.test(password)
                    ) {
                      return "Password must contain at least one special character";
                    }
                    return true;
                  },
                })}
                type="password"
                placeholder="Password"
                name="password"
                className={styles.input_field}
              />
              <FormErrorParahraph errorObject={errors.password} />
            </FormErrorWrap>

            <FormErrorWrap>
              <input
                {...register("repPassword", {
                  required: {
                    value: true,
                    message: "Password repeat is required",
                  },
                  minLength: {
                    value: AuthConst.minPasswordLength,
                    message: `Password must have at least ${AuthConst.minPasswordLength} characters`,
                  },
                  validate: (rep) => {
                    if (getValues().password !== rep) {
                      return "Passwords must match";
                    }
                    return true;
                  },
                })}
                type="password"
                placeholder="Repeat Password"
                name="repPassword"
                className={styles.input_field}
              />
              <FormErrorParahraph errorObject={errors.repPassword} />
            </FormErrorWrap>

            <LoginRegisterButton type="submit" value="Register" />
          </form>

          <figure className="flex flex-row items-center justify-center m-6">
            <p className="select-none ml-4 mr-4 text-center">
              Already have an account?
            </p>
            <Link to={"/login"} className={styles.link}>
              Login here
            </Link>
          </figure>

          <article className={styles.register_message}>
            You have registered successfully, you will be redirected
          </article>
        </article>
      </section>
    </>
  );
}
