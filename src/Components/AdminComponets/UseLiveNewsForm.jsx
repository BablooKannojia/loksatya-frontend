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
    const [imageUpdated, setImageUpdated] = useState(false);

    // Category/Sub-category — ab bilkul useArticleForm jaise hi fetch hote hain
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [role, setRole] = useState("");
    const [userCategoryData, setUserCategoryData] = useState([]);

    // Tags — selected tags (post par lagne wale) alag hain, available tag
    // options (search/select karne ke liye) alag hain — jaise ArticleForm me
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [tagOptions, setTagOptions] = useState([]);
    const [tagSearch, setTagSearch] = useState("");

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

    // ---------------- Categories (Upload/BreakingNews wale pattern se) ----------------
    useEffect(() => {
        axios
            .get(`${API_URL}/content?type=category&page=1&limit=100`)
            .then((response) => {
                const cats = response.data?.data || [];

                setCategories(
                    cats.map((el) => ({
                        key: el._id,
                        value: el.text,
                        label: el.text,
                    }))
                );
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setCategories([]);
            });
    }, []);

    // ---------------- Sub-categories: selected category badalte hi reload ----------------
    useEffect(() => {
        if (!category) {
            setSubCategories([]);
            return;
        }

        axios
            .get(`${API_URL}/subcategory?category=${category}`)
            .then((content) => {
                setSubCategories(
                    (content.data || []).map((el) => ({
                        key: el._id,
                        value: el.text,
                        label: el.text,
                    }))
                );
            })
            .catch((err) => console.error(err));
    }, [category]);

    // ---------------- Tags: available options + search (debounced) ----------------
    const fetchTagOptions = async (search = "") => {
        try {
            const params = new URLSearchParams();

            params.set("type", "tag");
            params.set("page", "1");
            params.set("limit", "50");

            if (search.trim()) {
                params.set("search", search.trim());
            }

            const response = await axios.get(
                `${API_URL}/content?${params.toString()}`
            );

            const items = response.data?.data || response.data || [];

            setTagOptions(
                items.map((el) => ({
                    key: el._id,
                    value: el.text,
                    label: el.text,
                }))
            );
        } catch (error) {
            console.error("Error fetching tags:", error);
            setTagOptions([]);
        }
    };

    useEffect(() => {
        fetchTagOptions("");
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTagOptions(tagSearch);
        }, 400);

        return () => clearTimeout(timer);
    }, [tagSearch]);

    // Existing tag ko select/deselect karne ke liye (jaise ArticleForm ke tag buttons)
    const toggleTag = (tagValue) => {
        setTags((prev) =>
            prev.includes(tagValue)
                ? prev.filter((t) => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    // Bilkul naya tag banana ho to (API me save hoke turant selected bhi ho jaata hai)
    const addTag = async () => {
        if (!tagInput.trim()) {
            notify("Please enter a tag name.", "warning");
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/content?id=${localStorage.getItem("id")}`,
                { type: "tag", text: tagInput.trim() }
            );

            const newTag = {
                value: response.data.text,
                label: response.data.text,
                key: response.data._id,
            };

            setTagOptions((prev) => [...prev, newTag]);
            setTags((prev) => [...prev, newTag.value]);
            setTagInput("");
            notify("Tag added successfully!", "success");
        } catch (error) {
            console.error("Error adding tag:", error);
            notify("Failed to add tag.", "error");
        }
    };

    const removeTag = (tag) => {
        setTags((prev) =>
            prev.filter((item) => item !== tag)
        );
    };

    const resetTags = () => {
        setTags([]);
    };

    // ---------------- Publisher / role (Reported By/Publish By ke liye) ----------------
    useEffect(() => {
        const userId =
            typeof window !== "undefined" ? localStorage.getItem("id") : null;
        if (!userId) return;

        axios
            .get(`${API_URL}/user?id=${userId}`)
            .then((user) => {
                const u = user.data?.[0];
                if (u) {
                    setPublishBy(u.email || "");
                    setRole(u.role || "");
                    setUserCategoryData(u.selectedKeywords || []);
                }
            })
            .catch((err) => console.error(err));
    }, []);

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
        setStatus("online");
        setLive(true);

        setImage(null);

        setTags([]);
        setTagInput("");
        setTagSearch("");

        setImageUpdated(false);

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
            console.log("===== FORM DATA =====");
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }
            await axios.post(
                `${API_URL}/live-news`,
                formData
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

            const data = res.data?.news;

            setTitle(data.title || "");
            setSlug(data.slug || "");
            setCategory(data.category || "");
            setSubCategory(data.subCategory || "");
            setDescription(data.description || "");
            setReportedBy(data.reportedBy || "");
            setStatus(data.status || "online");
            setLive(Boolean(data.live));

            setImage(data.image || null);

            setTags(data.tags || []);

        } catch (err) {
            console.error(err);
            notify("Unable to load Live News", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (onEdit && shouldLoadForEdit) {
            loadLiveNews();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onEdit, shouldLoadForEdit, editId, id]);

    // Category select role ke hisaab se (admin = sab categories, warna user ki apni list)
    const categoriesToDisplay =
        role === "admin"
            ? categories
            : userCategoryData.map((cat) => ({ value: cat, label: cat }));

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
        tags,
        tagInput,
        tagSearch,
        tagOptions,
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
        setTags,
        setTagInput,
        setTagSearch,
        addTag,
        toggleTag,
        removeTag,
        insertTweet,
        createSlug,
        joditConfig,
        createLiveNews,
        updateLiveNews,
        previewOpen,
        setPreviewOpen,
        setImageUpdated,
        imageUpdated,
        categories,
        categoriesToDisplay,
        subCategories,
        role,
        resetTags,
        publishLoading,
        toastMessage,
        editor,
        onEdit,
        setOnEdit,
        router
    };
}