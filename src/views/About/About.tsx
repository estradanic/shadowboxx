import React, {useState} from "react";

const About = () => {
  const [apiMessage, setApiMessage] = useState("");

  fetch("/api/test?name=Nicholas")
    .then((response) =>
      response.text().then((message) => setApiMessage(message)),
    )
    .catch((reason) => {
      console.error(reason);
    });

  return (
    <div>
      <h1>About</h1>
      <h4>{apiMessage}</h4>
    </div>
  );
};

export default About;
