let path = require("path");
const unRoutedPaths = [
  "apps",
  "batch",
  "requestPasswordReset",
  "files",
  "login",
  "logout",
  "user",
  "users",
  "Roles",
  "parse",
  "schemas",
  "functions",
  "classes",
  "aggregate",
  "cloud_code",
  "config",
  "hooks",
  "push_audiences",
  "installations",
  "push",
  "sessions",
  "events",
  "jobs",
  "export_progress",
  "export_data",
];

app.enable("trust proxy");
app.use((req, res, next) => {
  req.secure || app.get("X-Forwarded-Proto") != "http"
    ? next()
    : res.redirect("https://" + req.headers.host + req.url);
});

app.use((req, res, next) => {
  const pathParts = req.path.split("/").filter((p) => p !== "");
  if (req.path.indexOf(".") > 0 || unRoutedPaths.includes(pathParts[0])) {
    next();
  } else {
    res.sendFile(path.join(`${__dirname}/public/index.html`));
  }
});
