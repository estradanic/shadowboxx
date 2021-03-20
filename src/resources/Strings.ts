/**
 * Object providing dynamic access to strings used throughout the site.
 * Needed to avoid string literals for consistency.
 */
const Strings: {[key: string]: (params?: any) => string} = {
  alreadyHaveAccount: () => "Already have an account?",
  appName: () => "Albums",
  back: () => "Back",
  commonError: () => "Something went wrong!",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  email: () => "Email",
  emailExists: (email: string) => `User with email already exists (${email})`,
  firstName: () => "First Name",
  fullName: () => "Full Name",
  home: () => "Home",
  incorrectPassword: () => "Incorrect password",
  invalidEmail: (email: string) => `Invalid email (${email})`,
  invalidPassword: (password: string) => `Invalid password (${password})`,
  lastName: () => "Last Name",
  login: () => "Login",
  logout: () => "Logout",
  loginSignup: () => "Login / Sign Up",
  noAccount: () => "Don't have an account?",
  noEmailExists: (email: string) => `Email doesn't exist (${email})`,
  password: () => "Password",
  pleaseEnterA: (field: string) => `Please enter a ${field}`,
  settings: () => "Settings",
  signup: () => "Sign Up",
  submit: () => "Submit",
  welcomeUser: (name: {firstName: string; lastName: string}) =>
    `Welcome, ${name.firstName} ${name.lastName}!`,
};

export default Strings;
