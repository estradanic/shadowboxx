import React, {memo} from "react";
import Parse from "parse";
import {
  PageContainer
} from "../../components";
import {useView} from "../View";

const Share = memo(() => {
  useView("Share");
  navigator.serviceWorker.onmessage = (event) => {
    alert(JSON.stringify(event.data));
  };

  return (
    <PageContainer>
      <h1>Share</h1>
    </PageContainer>
  );
});

export default Share;
