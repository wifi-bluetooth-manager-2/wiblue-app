import styles from "./styles.module.scss";
type ButtonProps = {
  type: "submit" | "button" | "image";
  value?: string;
  customWidth?: string;
  customHeight?: string;
  bgColor?: string;
  textColor?: string;
  rounded?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void | unknown;
  src?: string;
};

const LoginRegisterButton = ({
  type,
  value = undefined,
  customWidth = undefined,
  customHeight = undefined,
  bgColor = undefined,
  textColor = undefined,
  rounded = true,
  hoverEffect = false,
  onClick = undefined,
  src = undefined,
  ...props
}: ButtonProps) => {
  return (
    <input
      {...props}
      type={type}
      value={value}
      onClick={onClick}
      src={type === "image" ? src : ""}
      className={styles.login_register_button}
    />
  );
};

export default LoginRegisterButton;
