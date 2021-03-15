const Strings: {[key: string]: (params?: any) => string} = {
  appName: () => "Albums",
  back: () => "Back",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  email: () => "Email",
  login: () => "Login",
  loginSignup: () => "Login / Sign Up",
  password: () => "Password",
  signup: () => "Sign Up",
};

export default Strings;
