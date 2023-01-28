import React, { memo } from "react";
import Typography from "@material-ui/core/Typography";
import { useSearchParams } from "react-router-dom";
import {
  PageContainer,
  FancyTitleTypography,
  OtpField,
} from "../../components";
import { Strings } from "../../resources";
import { useView } from "../View";

const VerifyEmail = memo(() => {
  useView("VerifyEmail");
  const [search] = useSearchParams();
  const email = search.get("email");

  return (
    <PageContainer>
      {!!email && (
        <>
          <FancyTitleTypography>
            {Strings.verifyEmailTitle()}
          </FancyTitleTypography>
          <br />
          <br />
          <Typography>{Strings.verifyEmail(email)}</Typography>
          <br />
          <OtpField onCompleted={(otp) => alert(otp)} />
        </>
      )}
    </PageContainer>
  );
});

export default VerifyEmail;
