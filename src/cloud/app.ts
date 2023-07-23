import path from "path";
import { Application } from "express";

declare const app: Application;

const frontendRoutes = [
  "album",
  "home",
  "login",
  "pictures",
  "settings",
  "signup",
  "share",
  "verify",
  "forgot-password",
  "",
];

app.enable("trust proxy");

app.use((req, res, next) => {
  req.secure || app.get("X-Forwarded-Proto") !== "http"
    ? next()
    : res.redirect("https://" + req.headers.host + req.url);
});

app.use((req, res, next) => {
  const pathParts = req.path.split("/").filter((pathPart) => pathPart !== "");
  const serveIndex =
    req.method === "GET" &&
    (frontendRoutes.includes(pathParts[0]) || pathParts.length === 0);
  if (serveIndex) {
    res
      .header("Cross-Origin-Opener-Policy", "same-origin")
      .header("Cross-Origin-Embedder-Policy", "credentialless")
      .header("Cross-Origin-Resource-Policy", "cross-origin")
      .sendFile(path.join(`${__dirname}/public/index.html`));
  } else {
    next();
  }
});
