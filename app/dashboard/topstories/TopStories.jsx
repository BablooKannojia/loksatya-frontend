"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import ArticleFormBase from "../../../src/Components/AdminComponets/ArticleFormBase";

const TopStories = () => {
  const pathname = usePathname();
  const { id } = useContext(onEditContext);

  return (
    <ArticleFormBase
      heading="Top Story"
      editHeading="Edit Article"
      subheading="Fill out the information below to publish a top story."
      defaultNewsType="topStories"
      editId={id}
      shouldLoadForEdit={pathname !== "/dashboard/topstories"}
      enableScheduling={true}
      onCancelEdit={() => window.location.reload()}
    />
  );
};

export default TopStories;