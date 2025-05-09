import NavbarModel from "../../components/NavbarModel/NavbarModel";
import { Link, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import OLF from "../../Olf/olf";
import FormErrorWrap from "../../components/FormError/FormErrorWrap";
import FormErrorParagraph from "../../components/FormError/FormErrorParagraph";
import AuthConst from "../../constants/auth";
import ApiLinks from "../../constants/apilinks";
import styles from "./styles.module.scss";
import LoginRegisterButton from "../../components/LoginRegisterButton/LoginRegisterButton";
import Regex from "../../constants/regex";
import useUserContext from "../../contexts/userContextProvider";
import toast from "react-hot-toast";

const Login = () => {
  type formProps = {
    credential: string | null;
    password: string | null;
  };

  const loginOptions = {
    email: "email",
    username: "username",
  } as const;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
  } = useForm<formProps>({
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const navi = useNavigate();
  const { UserDispatch } = useUserContext();

  const [loginOption, setLoginOption] = useState<"email" | "username">("email");

  const onSubmit: SubmitHandler<formProps> = async (data) => {
    const loginLink =
      loginOption === loginOptions.email
        ? ApiLinks.loginEmail
        : ApiLinks.loginUsername;

    const response = fetch(loginLink, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        [loginOption === loginOptions.email
          ? loginOptions.email
          : loginOptions.username]: data.credential,
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

          if (data.status == 400 || data.status == 404) {
            toast.error(message ?? "Error while login");
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
  };

  return (
    <>
      <NavbarModel />
      <section className={styles.container}>
        <article>
          <header>Login to WiBlue account</header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormErrorWrap>
              <input
                {...register("credential", {
                  validate: (cred) => {
                    if (!cred) {
                      return "Credential is required";
                    }
                    if (cred.includes("@")) {
                      setLoginOption("email");
                      const regexResult = Regex.emailRegistration.test(cred);
                      if (!regexResult) {
                        return "Email must be correct";
                      }
                      return true;
                    } else {
                      setLoginOption("username");
                      const regexResult = Regex.usernameModification.test(cred);
                      if (!regexResult) {
                        return "Username must be correct";
                      }
                      return true;
                    }
                  },
                  required: {
                    value: true,
                    message: "Credential is required",
                  },
                })}
                type="text"
                placeholder="Email or Username"
                name="credential"
              />
              <FormErrorParagraph errorObject={errors.credential} />
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
                })}
                type="password"
                placeholder="Password"
                name="password"
              />
              <FormErrorParagraph errorObject={errors.password} />
            </FormErrorWrap>
            <LoginRegisterButton type="submit" value="Login" />
          </form>
          <figure>
            <p>Don't have an account?</p>
            <Link to="/register">Register here</Link>
          </figure>
        </article>
      </section>
    </>
  );
};

export default Login;
