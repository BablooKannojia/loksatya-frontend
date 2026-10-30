"use client";

import React, { useContext } from "react";
import { useSearchParams } from "next/navigation";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import ArticleFormBase from "../../../src/Components/AdminComponets/ArticleFormBase";

const Upload = () => {
  const searchParams = useSearchParams();
  const edit = searchParams.get("edit");
  const { id } = useContext(onEditContext);
  // id URL me bhi rehti hai (?edit=true&id=...) taaki page refresh par article dobara load ho sake
  const editId = searchParams.get("id") || id;

  return (
    <ArticleFormBase
      heading="Create New Article"
      editHeading="Edit Article"
      subheading="Fill out the information below to manage your publication post."
      defaultNewsType="upload"
      editId={editId}
      shouldLoadForEdit={!!edit}
      enableScheduling={true}
      resetEditWhenNotLoading={true}
      onCancelEdit={() => { window.location.href = "/dashboard/upload"; }}
    />
  );
};

export default Upload;