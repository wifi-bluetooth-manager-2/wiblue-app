import { SubmitHandler, useForm } from "react-hook-form";
import FormErrorParahraph from "../FormError/FormErrorParagraph";
import FormErrorWrap from "../FormError/FormErrorWrap";
import LoginRegisterButton from "../LoginRegisterButton/LoginRegisterButton";
import styles from "./styles.module.scss";
import toast, { Toast } from "react-hot-toast";

type ToastFormNetworkPasswordProps = {
  t: Toast;
  // setPassword: React.Dispatch<React.SetStateAction<string>>;
  _bssid: string;
  connect: (_bssid: string, p: string) => void;
};

const ToastFormNetworkPassword = ({
  t,
  _bssid,
  connect,
}: ToastFormNetworkPasswordProps) => {
  type formProps = {
    password: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formProps>();

  const onSubmit: SubmitHandler<formProps> = async (data) => {
    connect(_bssid, data.password); // Pass the BSSID and password back to `connect`
    toast.dismiss(t.id); // Dismiss the toast once submitted
  };

  return (
    <div className={styles.toast_container}>
      <form className={styles.login_form} onSubmit={handleSubmit(onSubmit)}>
        <FormErrorWrap>
          <input
            {...register("password", {
              required: {
                value: true,
                message: "Password is required",
              },
            })}
            type="password"
            placeholder="Password"
            name="password"
            className={styles.input_field}
          />
          <FormErrorParahraph errorObject={errors.password} />
        </FormErrorWrap>
        <input type="submit" value="Connect" className={styles.connect} />
      </form>
      <input
        type="button"
        value="Cancel"
        className={styles.cancel}
        onClick={() => toast.dismiss(t.id)}
      />
    </div>
  );
};

export default ToastFormNetworkPassword;
