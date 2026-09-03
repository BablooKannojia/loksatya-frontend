"use client";

import { useState, useRef, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { OnEdit as onEditContext } from "../../Context/index";
import { API_URL } from "../../API";
import {
    isValidTweetUrl,
    buildTweetEmbedHtml,
    ensureTwitterWidgetsScript,
} from "./TwitterEmbed";

export function useArticleForm({
    defaultNewsType = "breakingNews",
    editId,
    shouldLoadForEdit,
    enableScheduling = false,
    resetEditWhenNotLoading = false,
} = {}) {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [Topic, setTopic] = useState("");
    const [desc, setdesc] = useState("");
    const [reported, setreported] = useState("");
    const [publish, setpublish] = useState("");
    const [type, setType] = useState("img");
    const [Language, setLanguage] = useState("Hindi");
    const [newType, setNewType] = useState(defaultNewsType);
    const [keyword, setKeyword] = useState([]);

    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [img, setImg] = useState(null);
    const [options, setOptions] = useState([]);
    const [subCategory, setSubCategory] = useState("");
    const [subCategoryData, setSubCategoryData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [role, setRole] = useState("");
    const [usercategoryData, setuserCategoryData] = useState([]);

    const { onEdit, setOnEdit, id } = useContext(onEditContext);
    const [Update, setUpdate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    const [comment, setComment] = useState(false);
    const [priority, setPriority] = useState(false);
    const [slider, setSlider] = useState(false);

    const [name, setName] = useState("");
    const [searchTag, setSearchTag] = useState("");
    const [scheduleDateTime, setScheduleDateTime] = useState("");
    const [key, setKey] = useState(0);
    const [toastMessage, setToastMessage] = useState({ text: "", type: "" });

    const inputRef = useRef(null);
    const editor = useRef(null);

    const notify = (text, type = "info") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage({ text: "", type: "" }), 3000);
    };

    const createSlugText = (text) =>
        (text || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/^-+/, "")
            .replace(/-+$/, "");

    // Ek hi jagah se image upload karne wala helper — toolbar aur drag&drop
    // dono isi function ko call karenge taaki Firebase URL hamesha use ho,
    // local file:/// path kabhi editor me na jaaye.
    // NOTE: 'this' ka bharosa nahi kar sakte (drop event me Jodit 'this' ko
    // editor instance se bind nahi karta), isliye hamesha 'editor' ref se
    // hi actual Jodit instance liya jaa raha hai.
    const uploadImagesToEditor = async (files) => {
        if (!files || files.length === 0) return;
        notify(`Uploading ${files.length} image(s)...`, "info");

        let allOk = true;

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);

            try {
                const res = await axios.post(`${API_URL}/image`, formData);
                const imageUrl = res.data.image;
                const imgHtml = `<p><img src="${imageUrl}" alt="Uploaded image" style="max-width:100%; height:auto;" /></p>`;

                const instance = editor.current;
                if (instance && instance.s && typeof instance.s.insertHTML === "function") {
                    instance.s.insertHTML(imgHtml);
                } else if (instance && typeof instance.selection?.insertHTML === "function") {
                    instance.selection.insertHTML(imgHtml);
                } else {
                    // Editor instance abhi ready nahi hai — content ko
                    // directly append kar do taaki image kho na jaaye
                    console.warn("Jodit instance not ready, appending to value directly");
                    if (instance) {
                        instance.value = (instance.value || "") + imgHtml;
                    }
                }
            } catch (err) {
                allOk = false;
                console.error("Image upload failed:", err);
                notify(`Failed to upload ${files[i].name}`, "error");
            }
        }

        if (allOk) {
            notify("All images uploaded successfully!", "success");
        }
    };

    // Jodit editor ke andar multiple image upload — dono jagah 100% same tha
    const joditConfig = useMemo(
        () => ({
            readonly: false,
            height: 450,
            uploader: {
                insertImageAsBase64URI: false,
                customBuild: async function (data, form, files) {
                    await uploadImagesToEditor(files);
                },
            },
            // Drag & drop se aane wali images Jodit ka default handler
            // (jo local file:/// path ya base64 daal deta hai) use karta
            // hai — isliye 'drop' event ko khud intercept karke usi
            // Firebase upload function se pass kar rahe hain.
            events: {
                drop: function (event) {
                    const dt = event.dataTransfer;
                    const files = dt && dt.files;
                    if (files && files.length > 0) {
                        const isAllImages = Array.from(files).every((f) =>
                            f.type.startsWith("image/")
                        );
                        if (isAllImages) {
                            event.preventDefault();
                            event.stopPropagation();
                            uploadImagesToEditor(files);
                            return false;
                        }
                    }
                },
            },
        }),
        []
    );

    const addItem = async () => {
        if (!name.trim()) {
            notify("Please enter a tag name.", "warning");
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/content?id=${localStorage.getItem("id")}`,
                { type: "tag", text: name.trim() }
            );

            const newTag = {
                value: response.data.text,
                label: response.data.text,
                key: response.data._id,
            };

            setOptions((prev) => [...prev, newTag]);
            setKeyword((prev) => [...prev, newTag.value]);
            setName("");
            notify("Tag added successfully!", "success");
        } catch (error) {
            console.error("Error adding tag:", error);
            notify("Failed to add tag.", "error");
        }
    };

    const handleTagToggle = (tagValue) => {
        setKeyword((prev) =>
            prev.includes(tagValue)
                ? prev.filter((t) => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    // Article content me ek ya multiple Twitter/X post embed karne ke liye.
    // Baar baar call karke jitne chahiye utne tweet daale ja sakte hain.
    const insertTweetEmbed = () => {
        const url = window.prompt("Tweet ya X post ka URL paste karein:");
        if (!url) return;

        if (!isValidTweetUrl(url)) {
            notify("Sahi Twitter/X post ka URL daaliye (status link).", "warning");
            return;
        }

        const embedHtml = buildTweetEmbedHtml(url);
        const instance = editor.current;

        if (instance && instance.s && typeof instance.s.insertHTML === "function") {
            instance.s.insertHTML(embedHtml);
        } else {
            // Editor instance abhi ready nahi hai to seedha content me jod do
            setdesc((prev) => `${prev || ""}${embedHtml}`);
        }

        ensureTwitterWidgetsScript();
        notify("Tweet/X post embed add ho gaya!", "success");
    };

    // Article edit data + tags + categories + user info — sab ek hi effect me
    useEffect(() => {
        if (onEdit && shouldLoadForEdit) {
            axios.get(`${API_URL}/article?id=${editId ?? id}`).then((item) => {
                const data = item.data?.[0];
                if (!data) return;
                setTitle(data.title || "");
                setTopic(data.topic || "");
                setdesc(data.discription || "");
                setKeyword(data.keyWord || []);
                setImg(data.image || null);
                setSubCategory(data.subCategory || "");
                setSlug(data.slug || "");
                setComment(!!data.comment);
                setPriority(!!data.priority);
                setSlider(!!data.slider);
                setLanguage(data.language || "Hindi");
                setpublish(data.publishBy || "");
                setreported(data.reportedBy || "");
                setNewType(data.newsType || defaultNewsType);
                setType(data.type || "img");
            });
        } else if (
            !shouldLoadForEdit &&
            resetEditWhenNotLoading &&
            typeof setOnEdit === "function"
        ) {
            setOnEdit(false);
        }

        const userId =
            typeof window !== "undefined" ? localStorage.getItem("id") : null;
        if (userId) {
            axios
                .get(`${API_URL}/user?id=${userId}`)
                .then((user) => {
                    const u = user.data?.[0];
                    if (u) {
                        setpublish(u.email || "");
                        setRole(u.role || "");
                        setuserCategoryData(u.selectedKeywords || []);
                    }
                })
                .catch((err) => console.error(err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onEdit, editId, id, shouldLoadForEdit]);

    useEffect(() => {
        axios
            .get(`${API_URL}/content?type=category&page=1&limit=100`)
            .then((response) => {
                const categories = response.data?.data || [];

                setCategoryData(
                    categories.map((el) => ({
                        key: el._id,
                        value: el.text,
                        label: el.text,
                    }))
                );
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setCategoryData([]);
            });
    }, []);

    const fetchTags = async (search = "") => {
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

            const tags = response.data?.data || response.data || [];

            setOptions(
                tags.map((el) => ({
                    key: el._id,
                    value: el.text,
                    label: el.text,
                }))
            );
        } catch (error) {
            console.error("Error fetching tags:", error);
            setOptions([]);
        }
    };
    useEffect(() => {
        fetchTags("");
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTags(searchTag);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTag]);

    // Category badalte hi subcategory reload
    useEffect(() => {
        if (!Topic) {
            setSubCategoryData([]);
            return;
        }

        const fetchSubCategories = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/subcategory`,
                    {
                        params: {
                            category: Topic,
                        },
                    }
                );

                console.log("Selected Category:", Topic);
                console.log("Subcategory API Response:", response.data);

                // API response ke different possible formats handle karo
                const subcategories =
                    Array.isArray(response.data)
                        ? response.data
                        : Array.isArray(response.data?.data)
                            ? response.data.data
                            : [];

                setSubCategoryData(
                    subcategories.map((el) => ({
                        key: el._id,
                        value: el.text,
                        label: el.text,
                    }))
                );
            } catch (err) {
                console.error(
                    "Error fetching subcategories:",
                    err.response?.data || err
                );

                setSubCategoryData([]);
            }
        };

        fetchSubCategories();
    }, [Topic]);

    const showVerifyModal = () => {
        if (!img) return notify("Please upload an image.", "warning");
        if (!title.trim()) return notify("Please enter a headline.", "warning");
        if (!desc.trim())
            return notify("Please enter description content.", "warning");
        if (!Topic) return notify("Please select a category.", "warning");
        if (!keyword || keyword.length === 0)
            return notify("Please select or add at least one tag.", "warning");
        if (!reported)
            return notify("Please select who reported this.", "warning");
        if (!publish) return notify("Please enter publisher information.", "warning");
        if (!slug.trim()) return notify("Please generate a slug.", "warning");

        setIsVerifyModalOpen(true);
        setTimeout(() => {
            const previewElement = document.getElementById("preview");
            if (previewElement) {
                previewElement.innerHTML = desc;
                ensureTwitterWidgetsScript();
            }
        }, 0);
    };

    const resetForm = () => {
        setTitle("");
        setTopic("");
        setdesc("");
        setKeyword([]);
        setImg(null);
        setLanguage("Hindi");
        setreported("");
        setNewType(defaultNewsType);
        setType("img");
        setSubCategory("");
        setSlug("");
        setComment(false);
        setPriority(false);
        setSlider(false);
        setUpdate(false);
        setOnEdit(false);
        setScheduleDateTime("");
        setSearchTag("");
    };

    const buildPayload = (imageUrl, extra = {}) => ({
        title,
        discription: desc,
        topic: Topic,
        keyWord: keyword,
        language: Language,
        reportedBy: reported,
        publishBy: publish,
        newsType: newType,
        image: imageUrl,
        type,
        subCategory,
        slug,
        comment,
        priority,
        slider,
        ...extra,
    });

    const onUpload = async (isScheduled = false) => {
        if (isScheduled) setScheduleLoading(true);
        else setPublishLoading(true);
        setLoading(true);

        try {
            const formdata = new FormData();
            formdata.append("file", img, img.name);
            const imageRes = await axios.post(`${API_URL}/image`, formdata);

            const publishAt =
                enableScheduling && isScheduled && scheduleDateTime
                    ? new Date(scheduleDateTime).toISOString()
                    : null;

            const payload = buildPayload(
                imageRes.data.image,
                enableScheduling
                    ? { publishAt, status: publishAt ? "scheduled" : "published" }
                    : {}
            );

            await axios.post(
                `${API_URL}/article/${localStorage.getItem("id")}`,
                payload
            );

            notify(
                publishAt
                    ? `Article scheduled for ${new Date(publishAt).toLocaleString()}`
                    : "Article published successfully!",
                "success"
            );

            resetForm();
            setIsVerifyModalOpen(false);
        } catch (err) {
            console.error("Upload error:", err);
            notify("Failed to publish article.", "error");
        } finally {
            setPublishLoading(false);
            setScheduleLoading(false);
            setLoading(false);
        }
    };

    const onEditHandle = async () => {
        setPublishLoading(true);
        setLoading(true);

        try {
            let finalImg = img;
            if (Update && img instanceof File) {
                const formdata = new FormData();
                formdata.append("file", img, img.name);
                const imageRes = await axios.post(`${API_URL}/image`, formdata);
                finalImg = imageRes.data.image;
            }

            await axios.put(`${API_URL}/article/${editId ?? id}`, buildPayload(finalImg));

            notify("Article updated successfully!", "success");
            resetForm();
            setIsVerifyModalOpen(false);
            router.push("/dashboard/articles");
        } catch (error) {
            console.error("Edit error:", error);
            notify("Failed to update article.", "error");
        } finally {
            setPublishLoading(false);
            setLoading(false);
        }
    };

    // const filteredOptions = options.filter((option) =>
    //     option.label.toLowerCase().includes(searchTag.toLowerCase().trim())
    // );

    const filteredOptions = options;

    const categoriesToDisplay =
        role === "admin"
            ? categoryData
            : usercategoryData.map((cat) => ({ value: cat, label: cat }));

    return {
        // state
        title, setTitle,
        slug, setSlug,
        Topic, setTopic,
        desc, setdesc,
        reported, setreported,
        publish,
        subCategory, setSubCategory,
        type, setType,
        Language, setLanguage,
        newType,
        keyword,
        isVerifyModalOpen, setIsVerifyModalOpen,
        img, setImg,
        subCategoryData,
        role,
        onEdit, setOnEdit,
        Update, setUpdate,
        loading,
        publishLoading,
        scheduleLoading,
        comment, setComment,
        priority, setPriority,
        slider, setSlider,
        name, setName,
        searchTag, setSearchTag,
        scheduleDateTime, setScheduleDateTime,
        toastMessage,
        inputRef,
        editor,
        key,

        // derived
        filteredOptions,
        categoriesToDisplay,

        // config/utils
        joditConfig,
        createSlugText,
        notify,
        addItem,
        handleTagToggle,
        insertTweetEmbed,
        showVerifyModal,
        onUpload,
        onEditHandle,
        resetForm,
        router,
    };
}