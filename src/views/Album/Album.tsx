import React, { memo } from "react";
import { PageContainer } from "../../components";
import { Route, Routes } from "react-router-dom";
import { useView } from "../View";
import ExistingAlbumContent from "./ExistingAlbumContent";
import NewAlbumContent from "./NewAlbumContent";

/**
 * Page for viewing an album
 */
const Album = memo(() => {
  useView("Album");

  return (
    <PageContainer>
      <Routes>
        <Route path=":id/*" element={<ExistingAlbumContent />} />
        <Route path="new" element={<NewAlbumContent />} />
      </Routes>
    </PageContainer>
  );
});

export default Album;
