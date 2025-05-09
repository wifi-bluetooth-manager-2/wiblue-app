import { Navbar, NavbarElement, NavbarMain } from "../Navbar/";
import NavbarWallet from "../Navbar/NavbarWallet";
import ApiLinks from "../../constants/apilinks";
import useUserContext from "../../contexts/userContextProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NavbarModel = () => {
  // this element allways will be on any sub-site
  const { User, UserDispatch } = useUserContext();
  const navi = useNavigate();

  const logout = () => {
    UserDispatch({ type: "setUsername", value: null });
    UserDispatch({ type: "setTheme", value: "light" });
    UserDispatch({ type: "setProfilePicture", value: null });
    UserDispatch({ type: "setEmail", value: null });
    UserDispatch({ type: "setId", value: null });
    UserDispatch({ type: "setToken", value: null });
    UserDispatch({ type: "setStatsNetwork", value: null });
    UserDispatch({ type: "setInterface", value: null });
    localStorage.clear();
    toast.error("Logged out");
    navi("/");
  };

  const getUserByToken = (tok: string) => {
    const response = fetch(ApiLinks.user_by_token, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ token: tok }),
    });

    response.then((data) => {
      data.json().then((res) => {
        const message = res.message;
        if (!data.ok) {
          logout();
          toast.error(message);
        } else {
          UserDispatch({ type: "setUsername", value: message.user.username });
          UserDispatch({ type: "setId", value: message.user.id });
          UserDispatch({ type: "setEmail", value: message.user.email });
          toast.success("User logged in successfully by token");
        }
      });
    });
  };

  const checkToken = () => {
    const token = localStorage.getItem("token");
    console.log(token);

    const response = fetch(ApiLinks.check_token, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + token,
      },
      method: "GET",
    });
    response.then((data) => {
      if (!data.ok) {
        logout();
        navi("/");
      } else {
        //        toast.success("Token correct");
        if (
          User.userId == null ||
          User.username == null ||
          User.email == null
        ) {
          getUserByToken(token ?? "");
        }
      }
    });
  };

  if (User.userId != null || User.username != null || User.email != null) {
    setInterval(() => {
      checkToken();
    }, 600000);
  }

  return (
    <Navbar>
      <NavbarMain>
        <NavbarElement link={"/"}>Home</NavbarElement>
        {!User.userId || !User.username || !User.email ? (
          <>
            <NavbarElement link={"/login"}>Login</NavbarElement>
            <NavbarElement link={"/register"}>Register</NavbarElement>
          </>
        ) : (
          <>
            <NavbarElement link={"/stats"}>Statistics</NavbarElement>
          </>
        )}
        <NavbarWallet />
      </NavbarMain>
    </Navbar>
  );
};

export default NavbarModel;
