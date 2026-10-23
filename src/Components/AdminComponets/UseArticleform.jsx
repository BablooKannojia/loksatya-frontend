"use client";

import { useState, useRef, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { OnEdit as onEditContext } from "../../Context/index";
import { API_URL } from "../../API";
import {
    isValidTweetUrl,
    buildTweetEditorHtml,
    toPublishHtml,
    toEditorHtml,
    renderTweetsIn,
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
    // Preview & Publish dabane par koi field adhoora ho to yahan message rehta hai
    // (toast 3 sec me gayab ho jaata tha, staff ko laga button kaam nahi kar raha).
    const [formError, setFormError] = useState("");

    // Tweet URL ke liye in-page popup (window.prompt kai browsers me block ho jaata hai)
    const [tweetModalOpen, setTweetModalOpen] = useState(false);
    const [tweetUrlInput, setTweetUrlInput] = useState("");
    const [tweetError, setTweetError] = useState("");

    const inputRef = useRef(null);
    const editor = useRef(null);

    const toastTimer = useRef(null);
    const notify = (text, type = "info") => {
        setToastMessage({ text, type });
        // pichla timer cancel karo, warna purana timer naye toast ko jaldi hata deta tha
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(
            () => setToastMessage({ text: "", type: "" }),
            type === "warning" || type === "error" ? 6000 : 3000
        );
    };

    // Editor ka asli current HTML. `desc` state sirf blur par update hota hai, isliye
    // click ke time stale ho sakta hai — hamesha editor se seedha padho.
    const getEditorHtml = () => {
        const inst = editor.current;
        if (inst && typeof inst.value === "string") return inst.value;
        return desc || "";
    };

    const createSlugText = (text) =>
        (text || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/^-+/, "")
            .replace(/-+$/, "");

    // ---- Temporary (blob:/data:) images ko permanent URL me badalna ----
    // Paste / drag se kabhi kabhi image blob:https://... URL ke saath editor me aa jaati
    // hai. Wo URL sirf usi tab me tab tak chalta hai jab tak page reload na ho, isliye
    // save hone ke baad edit page par ERR_FILE_NOT_FOUND aata tha. Yahan hum aisi har
    // image ko server par upload karke asli URL laga dete hain.
    const isTempSrc = (src) => /^(blob:|data:image\/)/i.test(src || "");
    const tempUploadCache = useRef(new Map()); // temp src -> permanent url

    const uploadTempSrc = async (src) => {
        if (tempUploadCache.current.has(src)) return tempUploadCache.current.get(src);
        const resp = await fetch(src); // blob: same-origin hai, isliye fetch chalega
        const blob = await resp.blob();
        const ext = (blob.type.split("/")[1] || "png").replace("+xml", "");
        const file = new File([blob], `pasted-${Date.now()}.${ext}`, {
            type: blob.type || "image/png",
        });
        const fd = new FormData();
        fd.append("file", file);
        const res = await axios.post(`${API_URL}/image`, fd, { timeout: 120000 });
        tempUploadCache.current.set(src, res.data.image);
        return res.data.image;
    };

    // HTML string me se temp images upload karke naya HTML return karta hai
    const fixTempImagesInHtml = async (html) => {
        if (!html || !/src=["'](blob:|data:image)/i.test(html)) return html;
        const doc = new DOMParser().parseFromString(html, "text/html");
        const imgs = Array.from(doc.querySelectorAll("img")).filter((im) =>
            isTempSrc(im.getAttribute("src"))
        );
        for (const im of imgs) {
            try {
                im.setAttribute("src", await uploadTempSrc(im.getAttribute("src")));
            } catch (e) {
                console.error("Temp image upload failed:", e);
                throw new Error("TEMP_IMAGE_UPLOAD_FAILED");
            }
        }
        return doc.body.innerHTML;
    };

    // Live editor ke andar ki images ko in-place fix karta hai
    const fixTempImagesInEditor = async () => {
        const inst = editor.current;
        const root = inst?.editor;
        if (!root) return;
        const imgs = Array.from(root.querySelectorAll("img")).filter((im) =>
            isTempSrc(im.getAttribute("src"))
        );
        if (!imgs.length) return;
        notify(`Uploading ${imgs.length} pasted image(s)...`, "info");
        for (const im of imgs) {
            try {
                const url = await uploadTempSrc(im.getAttribute("src"));
                im.setAttribute("src", url);
            } catch (e) {
                console.error("Temp image upload failed:", e);
                notify("Pasted image upload fail hui — dobara upload karein.", "error");
            }
        }
        inst.synchronizeValues?.();
    };

    const tempFixTimer = useRef(null);
    const scheduleTempFix = () => {
        if (tempFixTimer.current) clearTimeout(tempFixTimer.current);
        tempFixTimer.current = setTimeout(fixTempImagesInEditor, 800);
    };

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
                // paste / typing / undo — kisi bhi change ke baad temp images fix karo
                // Ctrl+V se clipboard ki image (screenshot / copied image) seedha upload
                paste: function (event) {
                    const items = event.clipboardData && event.clipboardData.items;
                    if (!items) return;
                    const files = [];
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
                            const f = items[i].getAsFile();
                            if (f) files.push(f);
                        }
                    }
                    if (files.length) {
                        event.preventDefault();
                        event.stopPropagation();
                        uploadImagesToEditor(files);
                        return false;
                    }
                },
                afterPaste: function () {
                    scheduleTempFix();
                },
                change: function () {
                    scheduleTempFix();
                },
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
    // Button dabane par popup khulta hai; baar baar karke jitne chahiye utne tweet daale ja sakte hain.
    const insertTweetEmbed = () => {
        try {
            editor.current?.s?.save?.(); // cursor ki jagah yaad rakho
        } catch (e) {
            /* ignore */
        }
        setTweetUrlInput("");
        setTweetError("");
        setTweetModalOpen(true);
    };

    const closeTweetModal = () => {
        try {
            editor.current?.s?.restore?.();
        } catch (e) {
            /* ignore */
        }
        setTweetModalOpen(false);
    };

    const confirmTweetEmbed = () => {
        const url = tweetUrlInput.trim();
        if (!url) {
            setTweetError("Tweet/X post ka link paste karein.");
            return;
        }
        if (!isValidTweetUrl(url)) {
            setTweetError("Sahi Twitter/X post ka link daaliye (jaise https://x.com/user/status/123...).");
            return;
        }

        const embedHtml = buildTweetEditorHtml(url);
        const instance = editor.current;

        if (instance && instance.s && typeof instance.s.insertHTML === "function") {
            instance.s.insertHTML(embedHtml);
            setdesc(getEditorHtml());
        } else {
            // Editor instance abhi ready nahi hai to seedha content me jod do
            setdesc(`${getEditorHtml()}${embedHtml}`);
        }

        setTweetModalOpen(false);
        setTweetUrlInput("");
        setTweetError("");
        notify("Tweet/X post add ho gaya! Asli tweet Preview me dikhega.", "success");
    };

    // Article edit data + tags + categories + user info — sab ek hi effect me
    useEffect(() => {
        if (onEdit && shouldLoadForEdit) {
            axios.get(`${API_URL}/article?id=${editId ?? id}`).then((item) => {
                const data = item.data?.[0];
                if (!data) return;
                setTitle(data.title || "");
                setTopic(data.topic || "");
                setdesc(toEditorHtml(data.discription || ""));
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

    const showVerifyModal = async () => {
        // Preview se pehle temp (blob:) images ko permanent URL me badlo
        await fixTempImagesInEditor();
        // Editor se latest content lo (blur ka wait mat karo)
        const editorHtml = getEditorHtml();
        setdesc(editorHtml);
        const publishHtml = toPublishHtml(editorHtml);
        const plainText = publishHtml
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
        const hasMedia = /<(img|iframe|video|blockquote)\b/i.test(publishHtml);

        const fail = (msg) => {
            setFormError(msg);
            notify(msg, "warning");
        };

        if (!img) return fail("Please upload an image.");
        if (!title.trim()) return fail("Please enter a headline.");
        if (!plainText && !hasMedia) return fail("Please enter description content.");
        if (!Topic) return fail("Please select a category.");
        if (!keyword || keyword.length === 0)
            return fail("Please select or add at least one tag.");
        if (!reported) return fail("Please select who reported this.");
        if (!publish)
            return fail(
                "Publisher info load nahi hui — page refresh karke dobara try karein (ya logout/login karein)."
            );
        if (!slug.trim())
            return fail(
                "Slug khaali hai — Slug box me English me slug likhein (Hindi headline se slug apne aap nahi banta)."
            );

        setFormError("");
        setIsVerifyModalOpen(true);
        setTimeout(() => {
            const previewElement = document.getElementById("preview");
            if (previewElement) {
                previewElement.innerHTML = publishHtml;
                renderTweetsIn(previewElement);
            }
        }, 50);
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
        setFormError("");
    };

    const buildPayload = (imageUrl, extra = {}, cleanHtml = null) => ({
        title,
        discription: toPublishHtml(cleanHtml ?? getEditorHtml()),
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
        if (publishLoading || scheduleLoading) return; // double click guard
        if (isScheduled) setScheduleLoading(true);
        else setPublishLoading(true);
        setLoading(true);

        try {
            const formdata = new FormData();
            formdata.append("file", img, img.name);
            const imageRes = await axios.post(`${API_URL}/image`, formdata, { timeout: 120000 });

            const publishAt =
                enableScheduling && isScheduled && scheduleDateTime
                    ? new Date(scheduleDateTime).toISOString()
                    : null;

            const cleanHtml = await fixTempImagesInHtml(getEditorHtml());
            const payload = buildPayload(
                imageRes.data.image,
                enableScheduling
                    ? { publishAt, status: publishAt ? "scheduled" : "published" }
                    : {},
                cleanHtml
            );

            await axios.post(
                `${API_URL}/article/${localStorage.getItem("id")}`,
                payload,
                { timeout: 60000 }
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
            notify(
                err?.message === "TEMP_IMAGE_UPLOAD_FAILED"
                    ? "Editor ki ek image upload nahi ho paayi (purani/expired image). Usse hata kar dobara upload karein."
                    : err?.code === "ECONNABORTED"
                    ? "Server se jawab nahi aaya (timeout). Internet check karke dobara Publish dabayein."
                    : "Failed to publish article.",
                "error"
            );
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
                const imageRes = await axios.post(`${API_URL}/image`, formdata, { timeout: 120000 });
                finalImg = imageRes.data.image;
            }

            const cleanHtml = await fixTempImagesInHtml(getEditorHtml());
            await axios.put(
                `${API_URL}/article/${editId ?? id}`,
                buildPayload(finalImg, {}, cleanHtml),
                { timeout: 60000 }
            );

            notify("Article updated successfully!", "success");
            resetForm();
            setIsVerifyModalOpen(false);
            router.push("/dashboard/articles");
        } catch (error) {
            console.error("Edit error:", error);
            notify(
                error?.message === "TEMP_IMAGE_UPLOAD_FAILED"
                    ? "Editor ki ek image upload nahi ho paayi (purani/expired image). Usse hata kar dobara upload karein."
                    : "Failed to update article.",
                "error"
            );
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
        uploadImagesToEditor,
        createSlugText,
        notify,
        addItem,
        handleTagToggle,
        insertTweetEmbed,
        tweetModalOpen,
        tweetUrlInput, setTweetUrlInput,
        tweetError,
        closeTweetModal,
        confirmTweetEmbed,
        formError,
        showVerifyModal,
        onUpload,
        onEditHandle,
        resetForm,
        router,
    };
}