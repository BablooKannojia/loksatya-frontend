"use client";

import { useState, useEffect, useMemo, useRef, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_URL } from "../../API";
import { OnEdit as OnEditContext } from "../../Context/index";
import {
    isValidTweetUrl,
    buildTweetEmbedHtml,
    ensureTwitterWidgetsScript,
} from "./TwitterEmbed";

export function useLiveNewsForm({
    editId,
    shouldLoadForEdit = false,
} = {}) {

    const router = useRouter();
    const { onEdit, setOnEdit, id } = useContext(OnEditContext);
    const [loading, setLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [description, setDescription] = useState("");
    const [reportedBy, setReportedBy] = useState("");
    const [publishBy, setPublishBy] = useState("");
    const [status, setStatus] = useState("online");
    const [live, setLive] = useState(true);
    const [image, setImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [imageUpdated, setImageUpdated] = useState(false);
    const [galleryUpdated, setGalleryUpdated] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState({
        text: "",
        type: "",
    });
    const editor = useRef(null);
    const notify = (text, type = "success") => {
        setToastMessage({
            text,
            type,
        });
        setTimeout(() => {
            setToastMessage({
                text: "",
                type: "",
            });
        }, 3000);
    };

    const createSlug = (text = "") => {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/--+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    };

    const joditConfig = useMemo(
        () => ({
            readonly: false,
            height: 500,
            placeholder: "Write Live News Description...",
            uploader: {
                insertImageAsBase64URI: false,
                customBuild: async function (data, form, files) {
                    if (!files || files.length === 0) return;
                    notify(`Uploading ${files.length} image(s)...`, "info");
                    for (const file of files) {
                        try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await axios.post(
                                `${API_URL}/image`,
                                formData
                            );
                            this.s.insertHTML(`
                                <p>
                                    <img
                                        src="${res.data.image}"
                                        alt="Image"
                                        style="max-width:100%;height:auto;"
                                    />
                                </p>
                            `);
                        } catch (err) {
                            console.error(err);
                            notify(
                                `Failed to upload ${file.name}`,
                                "error"
                            );
                        }
                    }
                    notify("Images Uploaded Successfully");
                },
            },
        }),
        []
    );

    const insertTweet = () => {
        const url = window.prompt(
            "Paste Twitter / X Post URL"
        );
        if (!url) return;
        if (!isValidTweetUrl(url)) {
            notify(
                "Please enter a valid Tweet URL.",
                "warning"
            );
            return;
        }

        const html = buildTweetEmbedHtml(url);
        const instance = editor.current;
        if (
            instance &&
            instance.s &&
            typeof instance.s.insertHTML === "function"
        ) {
            instance.s.insertHTML(html);
        } else {
            setDescription((prev) => prev + html);
        }
        ensureTwitterWidgetsScript();
        notify("Tweet Embedded Successfully");
    };

    const removeGalleryImage = (index) => {
        setGallery((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const clearGallery = () => {
        setGallery([]);
    };

    const addTag = () => {
        const value = tagInput.trim();
        if (!value) return;
        if (tags.includes(value)) {
            notify("Tag already exists.", "warning");
            return;
        }
        setTags((prev) => [...prev, value]);
        setTagInput("");
    };

    const removeTag = (tag) => {
        setTags((prev) =>
            prev.filter((item) => item !== tag)
        );
    };

    const resetTags = () => {
        setTags([]);
    };
    const showPreview = () => {
        if (!title.trim()) {
            notify("Please enter title", "warning");
            return;
        }

        if (!description.trim()) {
            notify("Please enter description", "warning");
            return;
        }

        setPreviewOpen(true);
    };
    const resetForm = () => {
        setTitle("");
        setSlug("");
        setCategory("");
        setSubCategory("");
        setDescription("");
        setReportedBy("");
        setPublishBy("");
        setStatus("online");
        setLive(true);

        setImage(null);
        setGallery([]);

        setTags([]);
        setTagInput("");

        setImageUpdated(false);
        setGalleryUpdated(false);

        setPreviewOpen(false);
    };

    const createLiveNews = async () => {
        try {
            setPublishLoading(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("slug", slug);
            formData.append("category", category);
            formData.append("subCategory", subCategory);
            formData.append("description", description);
            formData.append("reportedBy", reportedBy);
            formData.append("publishBy", publishBy);
            formData.append("status", status);
            formData.append("live", live);
            formData.append("tags", JSON.stringify(tags));

            if (image instanceof File) {
                formData.append("image", image);
            }

            gallery.forEach((item) => {
                if (item instanceof File) {
                    formData.append("gallery", item);
                }
            });

            await axios.post(
                `${API_URL}/live-news`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            notify("Live News Created Successfully");

            resetForm();

            setPreviewOpen(false);

            router.push("/dashboard/live-news");

        } catch (err) {
            console.error(err);

            notify(
                err?.response?.data?.message ||
                "Unable to create Live News",
                "error"
            );
        } finally {
            setPublishLoading(false);
        }
    };

    const updateLiveNews = async () => {
        try {
            setPublishLoading(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("slug", slug);
            formData.append("category", category);
            formData.append("subCategory", subCategory);
            formData.append("description", description);
            formData.append("reportedBy", reportedBy);
            formData.append("publishBy", publishBy);
            formData.append("status", status);
            formData.append("live", live);
            formData.append("tags", JSON.stringify(tags));

            if (imageUpdated && image instanceof File) {
                formData.append("image", image);
            }

            if (galleryUpdated) {
                gallery.forEach((item) => {
                    if (item instanceof File) {
                        formData.append("gallery", item);
                    }
                });
            }

            await axios.put(
                `${API_URL}/live-news/${editId || id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            notify("Live News Updated Successfully");
            setPreviewOpen(false);
            router.push("/dashboard/live-news");

        } catch (err) {
            console.error(err);
            notify(
                err?.response?.data?.message ||
                "Unable to update Live News",
                "error"
            );
        } finally {
            setPublishLoading(false);
        }
    };

    const loadLiveNews = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${API_URL}/live-news/${editId || id}`
            );

            const data = res.data;

            setTitle(data.title || "");
            setSlug(data.slug || "");
            setCategory(data.category || "");
            setSubCategory(data.subCategory || "");
            setDescription(data.description || "");
            setReportedBy(data.reportedBy || "");
            setPublishBy(data.publishBy || "");
            setStatus(data.status || "online");
            setLive(Boolean(data.live));

            setImage(data.image || null);
            setGallery(data.gallery || []);

            setTags(data.tags || []);

        } catch (err) {
            console.error(err);
            notify("Unable to load Live News", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();

        if (onEdit || shouldLoadForEdit) {
            loadLiveNews();
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/common`);

            setCategories(res.data.category || []);
            setSubCategories(res.data.subCategory || []);
        } catch (err) {
            console.error(err);
        }
    };

    return {
        loading,
        title,
        slug,
        category,
        subCategory,
        description,
        reportedBy,
        publishBy,
        status,
        live,
        image,
        gallery,
        tags,
        tagInput,
        showPreview,
        resetForm,
        setTitle,
        setSlug,
        setCategory,
        setSubCategory,
        setDescription,
        setReportedBy,
        setPublishBy,
        setStatus,
        setLive,
        setImage,
        setGallery,
        setTags,
        setTagInput,
        addTag,
        removeTag,
        insertTweet,
        createSlug,
        joditConfig,
        createLiveNews,
        updateLiveNews,
        previewOpen,
        setPreviewOpen,
        setImageUpdated,
        setGalleryUpdated,
        imageUpdated,
        galleryUpdated,
        categories,
        subCategories,
        removeGalleryImage,
        clearGallery,
        resetTags,
        publishLoading,
        toastMessage,
        editor,
        onEdit,
        setOnEdit,
        router
    };
}