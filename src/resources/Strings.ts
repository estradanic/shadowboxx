const Strings: {[key: string]: (params?: any) => string} = {
  appName: () => "Albums",
  back: () => "Back",
  copyright: () => `© Nicholas Estrada ${new Date().getFullYear()}`,
  login: () => "Login / Sign Up",
};

export default Strings;
