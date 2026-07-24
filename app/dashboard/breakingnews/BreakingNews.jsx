"use client";

import React, { useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import ArticleFormBase from "../../../src/Components/AdminComponets/ArticleFormBase";

const BreakingNews = () => {
  const pathname = usePathname();
  const { id } = useContext(onEditContext);

  return (
    <ArticleFormBase
      heading="Create Breaking News"
      editHeading="Edit Article"
      subheading="Fill out the information below to publish a breaking news post."
      defaultNewsType="breakingNews"
      editId={id}
      shouldLoadForEdit={pathname !== "/dashboard/breakingnews"}
      enableScheduling={false}
      onCancelEdit={(router) => router.refresh()}
    />
  );
};

export default BreakingNews;