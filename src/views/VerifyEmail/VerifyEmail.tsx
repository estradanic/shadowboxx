import React, { memo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../components";
import { useView } from "../View";

const VerifyEmail = memo(() => {
  useView("VerifyEmail");
  const [search] = useSearchParams();
  const email = search.get("email");

  return (
    <PageContainer>
      <h1>Placeholder. Page under construction</h1>
    </PageContainer>
  );
});

export default VerifyEmail;
