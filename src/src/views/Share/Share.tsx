import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useView} from "../View";
import { ActionDialog, PageContainer } from "../../components";

const useStyles = makeStyles((theme: Theme) => ({

}));

/**
 * View for the share target. Select which album to share image to.
 */
const Share = () => {
  useView("Share");
  return (
    <PageContainer>
    </PageContainer>
  );
};

export default Share;
