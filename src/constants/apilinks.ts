const host = "http://localhost:8000";

const ApiLinks = {
  register: host + "/signup",
  loginEmail: host + "/login_email/",
  loginUsername: host + "/login_username/",
  seen_networks: host + "/add_seen_networks",
  check_token: host + "/test_token",
  user_by_token: host + "/user_by_token",
  change_username: host + "/change_username",
  change_password: host + "/change_password",
  add_network_stats: host + "/add_stats",
  get_network_stats: host + "/get_stats",
} as const;

export default ApiLinks;
