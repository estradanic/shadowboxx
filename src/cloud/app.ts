import path from "path";
import express from "express";

const app = express();

const frontendRoutes = [
  "album",
  "home",
  "login",
  "images",
  "settings",
  "signup",
  "",
];

app.enable("trust proxy");

app.use((req, res, next) => {
  req.secure || app.get("X-Forwarded-Proto") != "http"
    ? next()
    : res.redirect("https://" + req.headers.host + req.url);
});

app.use((req, res, next) => {
  const pathParts = req.path.split("/").filter((pathPart) => pathPart !== "");
  const serveIndex =
    req.method === "GET" && frontendRoutes.includes(pathParts[0]);
  if (serveIndex) {
    res.sendFile(path.join(`${__dirname}/public/index.html`));
  } else {
    next();
  }
});