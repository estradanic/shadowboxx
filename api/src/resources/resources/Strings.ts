const Strings: {[key: string]: (params?: any) => string} = {
  alreadyHaveAccount: () => "Already have an account?",
  appName: () => "Albums",
  back: () => "Back",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  email: () => "Email",
  emailExists: (email: string) => `User with email already exists (${email})`,
  firstName: () => "First Name",
  fullName: () => "Full Name",
  invalidEmail: (email: string) => `Invalid email (${email})`,
  invalidPassword: (password: string) => `Invalid password (${password})`,
  lastName: () => "Last Name",
  login: () => "Login",
  loginSignup: () => "Login / Sign Up",
  noAccount: () => "Don't have an account?",
  password: () => "Password",
  pleaseEnterA: (field: string) => `Please enter a ${field}`,
  signup: () => "Sign Up",
  submit: () => "Submit",
};

export default Strings;
