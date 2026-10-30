"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { api, errorText, qs } from "../lib/api";
import { useFetch } from "../lib/hooks";
import { useAuth } from "../lib/auth";
import { ROLE_LABEL, STATUS, can, fmtDate, isManager, SITE_URL } from "../lib/utils";
import { applyDrop } from "../lib/sliderDrop";
import { Badge, Button, Card, Empty, ErrorBox, Icon, IconButton, Input, PageHeader, Pagination, Select, Spinner, cx, useConfirm, useToast } from "../components/ui";

const MAX = 4; // homepage hero: 1 big story + 3 small cards
const PAGE_SIZE = 15;
const TABS = [["", "All"], ["draft", "Drafts"], ["pending", "Pending"], ["published", "Published"], ["archived", "Archived"]];
const EMPTY_FILTERS = { from: "", to: "", q: "", author: "", category: "", tag: "", placement: "" };

// One row = 6 columns on desktop, stacked on mobile.
const ROW_GRID = "md:grid md:grid-cols-[minmax(0,3.2fr)_64px_120px_minmax(0,1.4fr)_minmax(0,1.6fr)_170px] md:items-center md:gap-3";

const SVG = {
  filter: "M3 5h18l-7 8v6l-4-2v-4L3 5z",
  refresh: "M20 12a8 8 0 11-2.3-5.7M20 4v5h-5",
  down: "M6 9l6 6 6-6",
  up: "M18 15l-6-6-6 6",
  video: "M4 6h11v12H4zM15 10l5-3v10l-5-3",
};
const Ico = ({ n, className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={SVG[n]} />
  </svg>
);

const FLabel = ({ children }) => <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{children}</label>;

/** The cells of one article row (the drag wrapper is added by the caller). */
function RowCells({ a, slot, serial, handle, actions, linkable = true }) {
  const scheduled = a.status === "published" && a.publishedAt && new Date(a.publishedAt) > new Date();
  const publisher = a.author?.name || a.authorName || "—";
  const tags = Array.isArray(a.tags) ? a.tags : [];

  return (
    <>
      {/* Article details */}
      <div className="flex min-w-0 items-start gap-2">
        {handle}
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {slot && <Badge tone="purple" className="shrink-0">Slider #{slot}</Badge>}
            {a.isTopStory && <Badge tone="blue" className="shrink-0">Top story</Badge>}
            {a.isHeadline && <Badge tone="blue" className="shrink-0">Headline</Badge>}
            {linkable ? (
              <Link href={`/admin/articles/${a._id}`} title={a.title} className="line-clamp-2 min-w-0 text-[13.5px] font-semibold leading-snug text-slate-900 hover:text-brand-dark">
                {a.title}
              </Link>
            ) : (
              <span title={a.title} className="line-clamp-2 min-w-0 text-[13.5px] font-semibold leading-snug text-slate-900">{a.title}</span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            {serial ? <span className="font-bold text-brand-dark">#{serial}</span> : null}
            {serial ? <span>•</span> : null}
            <span>{fmtDate(a.status === "published" ? a.publishedAt : a.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="md:text-center">
        <div className="inline-block h-10 w-10 overflow-hidden rounded border border-slate-200 bg-slate-100 align-middle">
          {a.mediaType === "video" ? (
            <div className="grid h-full w-full place-items-center text-slate-500"><Ico n="video" /></div>
          ) : a.image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.image.url} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : null}
        </div>
      </div>

      {/* Status */}
      <div className="md:text-center">
        {scheduled ? <Badge tone="amber">Scheduled</Badge> : <Badge tone={STATUS[a.status].tone}>{STATUS[a.status].label}</Badge>}
      </div>

      {/* Category / type */}
      <div className="min-w-0">
        <span className="inline-block max-w-full truncate rounded-md bg-brand-light px-2 py-0.5 text-[11.5px] font-semibold text-brand-dark">{a.category?.name || "—"}</span>
        <div className="mt-1 truncate text-[11.5px] text-slate-500">{a.subCategory?.name || (a.mediaType === "video" ? "Video" : "Article")}</div>
      </div>

      {/* Publisher / tags */}
      <div className="min-w-0" title={a.authorName && a.authorName !== publisher ? `Byline shown on the site: ${a.authorName}` : ""}>
        <div className="truncate text-[13px] font-semibold text-slate-800">{publisher}</div>
        <div className="truncate text-[11.5px] text-slate-500">
          {a.author?.email || "—"}
          {a.author?.role ? <span className="text-slate-400"> · {ROLE_LABEL[a.author.role] || a.author.role}</span> : null}
        </div>
        <div className="truncate text-[11px] text-slate-400" title={tags.join(", ")}>{tags.length ? tags.map((t) => `#${t}`).join(", ") : "No tags"}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:justify-end">{actions}</div>
    </>
  );
}

export default function Articles() {
  const { user } = useAuth();
  const manager = isManager(user.role);
  const canSliderPerm = can(user, "sliderOrder"); // may arrange the homepage slider (the server checks it too)
  const seesAll = true; // every user sees every article (changing one is limited to your own, unless admin / editor)
  const toast = useToast();
  const confirm = useConfirm();
  const params = useSearchParams();

  const [status, setStatus] = useState(params.get("status") || "");
  const [form, setForm] = useState(() => ({ ...EMPTY_FILTERS, category: params.get("category") || "" }));
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, category: params.get("category") || "" }));
  const [filterOpen, setFilterOpen] = useState(Boolean(params.get("category")));
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const cats = useFetch(() => api.get("/admin/categories"));
  const writers = useFetch(() => (seesAll ? api.get("/admin/writers") : Promise.resolve({ data: [] })), [seesAll]);
  // the slider articles (positions 1..4) are always pinned on top of the table
  const sliderQ = useFetch(() => (canSliderPerm ? api.get("/admin/articles?slider=true&limit=10") : Promise.resolve({ data: [] })), [canSliderPerm]);
  // everything else, filtered + paginated (slider articles are left out only while they are pinned above)
  const list = useFetch(
    () => api.get(`/admin/articles${qs({ ...filters, status, slider: showSlider ? "false" : "", page, limit: PAGE_SIZE })}`),
    [status, filters, page]
  );

  // counters: per status + per publisher, for the same filters (status / paging are ignored on purpose)
  const summary = useFetch(() => api.get(`/admin/articles/summary${qs(filters)}`), [filters]);
  const counts = summary.data?.byStatus;
  const publishers = summary.data?.byPublisher || [];
  const pubCount = new Map(publishers.map((p) => [p._id, p.total]));

  const [sliderRows, setSliderRows] = useState([]);
  const [restRows, setRestRows] = useState([]);
  useEffect(() => { if (sliderQ.data) setSliderRows(sliderQ.data); }, [sliderQ.data]);
  useEffect(() => { if (list.data) setRestRows(list.data); }, [list.data]);

  const reloadAll = () => { sliderQ.reload(); list.reload(); summary.reload(); };
  const activeCount = Object.values(filters).filter(Boolean).length;
  // The slider block is pinned on top only on the plain All / Published view and only for people who may arrange it.
  // With a filter on, the list shows just the articles that match - slider articles included (with their
  // "Slider #n" badge) but not forced on top, so a filter by publisher shows that publisher's articles only.
  const showSlider = canSliderPerm && activeCount === 0 && (!status || status === "published");
  const sliderShown = showSlider ? sliderRows : [];
  const sCount = sliderShown.length;
  const rows = [...sliderShown, ...restRows];
  // total for the selected tab + filters (falls back to what the list itself reports)
  const shownTotal = counts ? (status ? counts[status] : summary.data.total) : (list.meta?.total ?? 0) + sCount;

  const applyFilters = () => { setPage(1); setFilters(form); };
  const resetFilters = () => { setForm(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setPage(1); };
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // click a publisher chip to show only their articles (click again to clear)
  const filterByPublisher = (id) => {
    const next = { ...filters, author: filters.author === id ? "" : id };
    setForm(next);
    setFilters(next);
    setPage(1);
  };

  const canSlider = (a) => canSliderPerm && a.status === "published" && (!a.publishedAt || new Date(a.publishedAt) <= new Date());
  // admins / editors change any article; staff only their own (in any status - there is no approval step)
  // The login / me response carries the account id as `_id` (there is no `id`), so compare against both.
  const myId = String(user._id || user.id || "");
  const authorId = (a) => String(a.author?._id || a.author || "");
  const canTouch = (a) => manager || (myId !== "" && authorId(a) === myId);

  const changeStatus = async (a, next) => {
    try {
      await api.patch(`/admin/articles/${a._id}/status`, { status: next });
      toast(next === "published" ? "Article published" : `Moved to ${STATUS[next].label.toLowerCase()}`);
      reloadAll();
    } catch (e) { toast(errorText(e), "error"); }
  };

  const remove = async (a) => {
    if (!(await confirm({ title: "Delete article?", message: `"${a.title}" will be permanently deleted.`, danger: true, confirmText: "Delete" }))) return;
    try {
      await api.del(`/admin/articles/${a._id}`);
      toast("Article deleted");
      reloadAll();
    } catch (e) { toast(errorText(e), "error"); }
  };

  const onDragEnd = async ({ source, destination }) => {
    if (!destination || saving) return;
    const res = applyDrop({ slider: sliderShown, rest: restRows, from: source.index, to: destination.index, max: MAX, canSlider });
    if (!res) return;
    if (res.error) { toast(res.error, "error"); return; }

    const before = { slider: sliderRows, rest: restRows };
    setSliderRows(res.slider);
    setRestRows(res.rest);
    setSaving(true);
    try {
      await api.patch("/admin/articles/slider-order", { ids: res.slider.map((a) => a._id) });
      toast(res.pushedOut ? `Slider updated. "${res.pushedOut.title.slice(0, 36)}…" moved out (only ${MAX} positions).` : "Slider updated");
      reloadAll();
    } catch (e) {
      setSliderRows(before.slider);
      setRestRows(before.rest);
      toast(errorText(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const actionsFor = (a) => (
    <>
      {canTouch(a) && a.status !== "published" && <Button size="sm" variant="success" onClick={() => changeStatus(a, "published")}>Publish</Button>}
      {canTouch(a) && a.status === "published" && <Button size="sm" variant="secondary" onClick={() => changeStatus(a, "draft")}>Unpublish</Button>}
      {a.status === "published" && <a href={`${SITE_URL}/details/${a.slug}`} target="_blank" rel="noreferrer"><IconButton title="View on site"><Icon name="external" className="h-4 w-4" /></IconButton></a>}
      {canTouch(a) && <Link href={`/admin/articles/${a._id}`}><IconButton title="Edit"><Icon name="edit" className="h-4 w-4" /></IconButton></Link>}
      {canTouch(a) && <IconButton title="Delete" onClick={() => remove(a)} className="hover:!bg-red-50 hover:!text-red-600"><Icon name="trash" className="h-4 w-4" /></IconButton>}
    </>
  );

  const rowClass = (index, slot, dragging) =>
    cx(
      "flex flex-col gap-2 border-b border-slate-100 bg-white px-4 py-3",
      ROW_GRID,
      slot && "border-l-4 border-l-violet-500 !bg-violet-50/70",
      !slot && showSlider && sCount > 0 && index === sCount && "border-t-2 border-t-slate-300",
      dragging && "!bg-white shadow-2xl ring-2 ring-brand/40"
    );

  const renderRow = (a, index) => {
    const pinned = showSlider && index < sCount; // one of the 4 slider rows pinned on top
    // pinned rows get their badge from the position, filtered rows from the article's own sliderOrder
    const slot = pinned ? index + 1 : showSlider ? null : a.sliderOrder ?? null;
    const serial = pinned ? null : (page - 1) * PAGE_SIZE + (index - sCount) + 1;

    if (!showSlider) {
      return (
        <div key={a._id} className={rowClass(index, slot, false)}>
          <RowCells a={a} slot={slot} serial={serial} handle={null} actions={actionsFor(a)} linkable={canTouch(a)} />
        </div>
      );
    }

    const draggable = canSlider(a);
    return (
      <Draggable key={a._id} draggableId={a._id} index={index} isDragDisabled={!draggable}>
        {(p, snap) => (
          <div ref={p.innerRef} {...p.draggableProps} className={rowClass(index, slot, snap.isDragging)}>
            <RowCells
              a={a}
              slot={slot}
              serial={serial}
              actions={actionsFor(a)}
              linkable={canTouch(a)}
              handle={
                <span
                  {...p.dragHandleProps}
                  title={draggable ? "Drag to set the homepage slider" : "Only published articles can go in the slider"}
                  className={cx("mt-0.5 select-none px-0.5 text-base leading-none", draggable ? "cursor-grab text-slate-400 hover:text-slate-700" : "cursor-not-allowed text-slate-200")}
                >
                  ⠿
                </span>
              }
            />
          </div>
        )}
      </Draggable>
    );
  };

  const loadingFirst = (list.loading && !list.data) || (canSliderPerm && sliderQ.loading && !sliderQ.data);

  return (
    <>
      <PageHeader title="Articles" subtitle={canSliderPerm ? "Everything written on the site. Drag published articles to set the homepage slider." : "Everything written on the site."}>
        <Button variant="secondary" onClick={reloadAll}><Ico n="refresh" /> Refresh</Button>
        {can(user, "upload") && <Link href="/admin/articles/new"><Button><Icon name="plus" className="h-4 w-4" /> New article</Button></Link>}
      </PageHeader>

      {/* ---------- Advanced filters ---------- */}
      <Card className="mb-4">
        <button type="button" onClick={() => setFilterOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Ico n="filter" className="h-4 w-4 text-brand" /> Advanced filters
            {activeCount > 0 && <Badge tone="blue">{activeCount} active</Badge>}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-brand-light px-2.5 py-1 text-[11.5px] font-bold text-brand-dark">
            {filterOpen ? <><Ico n="up" className="h-3.5 w-3.5" /> Hide</> : <><Ico n="down" className="h-3.5 w-3.5" /> Show filters</>}
          </span>
        </button>

        {filterOpen && (
          <div className="border-t border-slate-100 p-4" onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div><FLabel>Start date</FLabel><Input type="date" value={form.from} max={form.to || undefined} onChange={setField("from")} /></div>
              <div><FLabel>End date</FLabel><Input type="date" value={form.to} min={form.from || undefined} onChange={setField("to")} /></div>
              <div><FLabel>Headline search</FLabel><Input placeholder="Headline…" value={form.q} onChange={setField("q")} /></div>
              {seesAll ? (
                <div>
                  <FLabel>Published by</FLabel>
                  <Select value={form.author} onChange={setField("author")}>
                    <option value="">All publishers</option>
                    {(writers.data || []).map((w) => <option key={w._id} value={w._id}>{w.name}{w.email ? ` (${w.email})` : ""}{pubCount.has(w._id) ? ` — ${pubCount.get(w._id)}` : " — 0"}</option>)}
                  </Select>
                </div>
              ) : <div />}

              <div>
                <FLabel>Placement</FLabel>
                <Select value={form.placement} onChange={setField("placement")}>
                  <option value="">All</option>
                  <option value="topStory">Top story (Big Story)</option>
                  <option value="headline">Top headlines</option>
                </Select>
              </div>
              <div>
                <FLabel>Category</FLabel>
                <Select value={form.category} onChange={setField("category")}>
                  <option value="">All categories</option>
                  {(cats.data || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </Select>
              </div>
              <div><FLabel>Tags / keywords</FLabel><Input placeholder="Tags…" value={form.tag} onChange={setField("tag")} /></div>
              <div className="flex items-end gap-2">
                <Button className="flex-1" onClick={applyFilters}>Apply</Button>
                <Button className="flex-1" variant="secondary" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ---------- Publishers: who published how many ---------- */}
      {/* {manager && publishers.length > 0 && (
        <Card className="mb-4 p-4">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Publishers</h3>
            <span className="text-xs text-slate-500">{publishers.length} publisher{publishers.length === 1 ? "" : "s"} · click a name to filter</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {publishers.map((p) => {
              const active = filters.author === p._id;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => filterByPublisher(p._id)}
                  title={`${p.email || ""}\nPublished ${p.published} · Pending ${p.pending} · Drafts ${p.draft} · Archived ${p.archived}`}
                  className={cx(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-[12.5px] transition-colors",
                    active ? "border-brand bg-brand-light" : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{p.name.charAt(0).toUpperCase()}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">{p.name}</span>
                    <span className="block truncate text-[11px] text-slate-500">{ROLE_LABEL[p.role] || "—"} · {p.published} published</span>
                  </span>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">{p.total}</span>
                </button>
              );
            })}
          </div>
        </Card>
      )} */}

      {/* ---------- Table ---------- */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-2">
          {TABS.map(([v, label]) => (
            <button key={v} onClick={() => { setStatus(v); setPage(1); }} className={cx("-mb-px border-b-2 px-3.5 py-2.5 text-sm font-semibold", status === v ? "border-brand text-brand-dark" : "border-transparent text-slate-500 hover:text-slate-800")}>
              {label}
              {counts && (
                <span className={cx("ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold", status === v ? "bg-brand text-white" : "bg-slate-100 text-slate-600")}>
                  {v ? counts[v] : summary.data.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* total + page, always visible (the pager below only appears when there is more than one page) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2 text-[12.5px] text-slate-600">
          <span>
            {/* <b className="text-slate-900">
              {shownTotal}</b> {shownTotal === 1 ? "article" : "articles"}
            {status ? ` · ${STATUS[status].label}` : ""}
            {filters.author ? ` · by ${publishers.find((p) => p._id === filters.author)?.name || "selected publisher"}` : ""}
            {activeCount > 0 ? " · filters applied" : ""} */}
          </span>
          {list.meta && <span>Page {list.meta.page} of {list.meta.totalPages}</span>}
        </div>

        {/* {showSlider && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-100 bg-violet-50 px-4 py-2 text-[12.5px] text-violet-900">
            <span>
              <b>Homepage slider {sCount}/{MAX}</b> · purple rows are live on the homepage (1 = big story, 2–4 = small cards).
              Drag a published article into the top {MAX} rows to add it; drag a slider row down to remove it.
            </span>
            {saving && <span className="flex items-center gap-1.5"><Spinner className="h-4 w-4" /> Saving…</span>}
          </div>
        )} */}

        {loadingFirst ? (
          <div className="grid place-items-center py-16"><Spinner /></div>
        ) : list.error ? (
          <ErrorBox onRetry={reloadAll}>{list.error}</ErrorBox>
        ) : rows.length === 0 ? (
          <Empty>No articles match these filters.</Empty>
        ) : (
          <div className={cx(list.loading && "opacity-60")}>
            <div className={cx("hidden border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500", ROW_GRID)}>
              <div>Article details</div>
              <div className="text-center">Media</div>
              <div className="text-center">Status</div>
              <div>Category / type</div>
              <div>Publisher / tags</div>
              <div className="text-right">Actions</div>
            </div>

            {showSlider ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="articles">
                  {(p) => (
                    <div ref={p.innerRef} {...p.droppableProps}>
                      {rows.map((a, i) => renderRow(a, i))}
                      {p.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div>{rows.map((a, i) => renderRow(a, i))}</div>
            )}
          </div>
        )}
        <Pagination meta={list.meta} onChange={(p) => setPage(p)} />
      </Card>
    </>
  );
}
