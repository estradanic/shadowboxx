const Strings: {[key: string]: (params?: any) => string} = {
  alreadyHaveAccount: () => "Already have an account?",
  appName: () => "Albums",
  back: () => "Back",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  email: () => "Email",
  firstName: () => "First Name",
  fullName: () => "Full Name",
  lastName: () => "Last Name",
  login: () => "Login",
  loginSignup: () => "Login / Sign Up",
  noAccount: () => "Don't have an account?",
  password: () => "Password",
  signup: () => "Sign Up",
  submit: () => "Submit",
};

export default Strings;
