"use client";

import React, { useContext } from "react";
import { useSearchParams } from "next/navigation";
import { OnEdit as onEditContext } from "../../../../src/Context/index";
import LiveNewsForm from "../../../../src/Components/AdminComponets/LiveNewsForm";

export default function CreateLiveNewsPage() {
    const searchParams = useSearchParams();
    const edit = searchParams.get("edit");
    const { id } = useContext(onEditContext);

    return (
        <LiveNewsForm
            heading="Create Live News"
            editHeading="Edit Live News"
            subheading="Publish and manage live news updates."
            editId={id}
            shouldLoadForEdit={!!edit}
            onCancelEdit={(router) => router.push("/dashboard/live-news")}
        />
    );
}