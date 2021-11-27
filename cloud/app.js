let path = require("path");
let express = require("express");

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});
