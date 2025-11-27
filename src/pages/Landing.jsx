import React, { useEffect, useMemo, useState, useRef } from "react";

import vizIcon from "../assets/vizdom.png"; // same icon

const BG_VIDEO_SRC = "/bg.mp4";

/** ====== UTILS ====== */
const norm = (s = "") =>
  s.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();

function formatSqft(n = "") {
  const s = String(n).replace(/,/g, "").trim();
  const val = Number(s);
  if (Number.isFinite(val) && val > 0) return `${val.toLocaleString()} sqft`;
  return n || "";
}










// Detect if we are running inside Electron
// Detect if we are running inside Electron (via preload-exposed APIs)
// Detect if we are running inside the packaged Electron app
const isElectron = !!(window.electronAPI || window.vizwalkStorage);



function normalizePathOrUrl(src = "") {
  if (!src) return "";

  // Already a normal URL / blob / data / file URL
  if (/^(https?:\/\/|blob:|data:|file:\/\/)/i.test(src)) {
    return src;
  }

  // Windows absolute path (C:\... or \\server\...)
  const isWinPath =
    /^[a-z]:\\/i.test(src) || src.startsWith("\\\\");

  // Only convert Windows paths to file:/// **inside Electron**
  if (isElectron && isWinPath) {
    const p = src.replace(/\\/g, "/");
    return `file:///${p}`;
  }

  // For plain web builds, just return the string (will usually be an http(s) URL)
  return src;
}

/** ====== CARD IMAGE ====== */
function ImageWithFallback({ src, alt, style }) {
  if (!src) {
    return (
      <img
        src="https://picsum.photos/seed/office/1200/800"
        alt={alt || "preview"}
        style={style}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  }

  const finalSrc = normalizePathOrUrl(src);

  return (
    <img
      src={finalSrc}
      alt={alt || "preview"}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
    />
  );
}



/** ====== BUILD CARD ====== */
function BuildCard({
  id,
  item,
  onOpenVizwalk,
  onOpenGallery,
  onSelect,
  selected,
}) {
  const [cardHover, setCardHover] = React.useState(false);
  const [mediaHover, setMediaHover] = React.useState(false);
  const [ytHover, setYtHover] = React.useState(false);
  const [vizHover, setVizHover] = React.useState(false);

  const cardStyle = {
    ...styles.card,
    ...(cardHover ? styles.cardHover : null),
    ...(selected ? styles.cardSelected : null),
  };

  const handleCardClick = () => {
    onSelect?.(id);
    onOpenGallery?.(); // clicking white area => gallery
  };

  const vizdomHref = item.vizdomId
  ? `https://vizdom.flipspaces.app/user/project/${encodeURIComponent(
      item.vizdomId
    )}#Project#Summary`
  : null;

const rawYoutube = item.youtube && item.youtube.trim();
const ytHref = rawYoutube ? normalizePathOrUrl(rawYoutube) : null;




  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => {
        setCardHover(false);
      }}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
    >
      {/* media (click -> vizwalk/experience) with overlay pill */}
      <div
        style={styles.mediaWrap}
        onMouseEnter={() => setMediaHover(true)}
        onMouseLeave={() => setMediaHover(false)}
        onClick={(e) => {
          e.stopPropagation(); // don’t trigger gallery
          onOpenVizwalk?.();
        }}
        onFocus={() => setMediaHover(true)}
        onBlur={() => setMediaHover(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setMediaHover(false);
            onOpenVizwalk?.();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Open Vizwalk"
        title="Open Vizwalk"
      >
        {/* image wrapper with blur on hover */}
        <div
          style={{
            ...styles.heroWrap,
            ...(mediaHover ? styles.heroWrapBlur : null),
          }}
        >
          <ImageWithFallback
            src={item.thumb}
            alt={item.projectName}
            style={styles.hero}
          />
        </div>

        {/* centered overlay pill */}
        <div
          style={{
            ...styles.mediaOverlay,
            ...(mediaHover ? styles.mediaOverlayOn : null),
          }}
        >
          <button
            type="button"
            style={styles.mediaBtn}
            onClick={(e) => {
              e.stopPropagation();
              setMediaHover(false);
              onOpenVizwalk?.();
            }}
          >
            Open Vizwalk
          </button>
        </div>
      </div>

      {/* Title + Version */}
      <div style={styles.titleWrap}>
        <div style={styles.titleText}>
          {item.buildName || "Build Name"}
          <span style={styles.versionText}>
            {item.buildVersion ? ` ${item.buildVersion}` : ""}
          </span>
        </div>
        <div style={styles.subLink}>
          {item.projectName || item.projectSlot || "Project Slot Name"}
        </div>
      </div>

      {/* Meta lines */}
      <div style={styles.metaBlock}>
        {item.areaSqft ? (
          <div>
            <strong>Area</strong> - {formatSqft(item.areaSqft)}
          </div>
        ) : null}
        {item.industry ? (
          <div>
            <strong>Construction Type</strong> - {item.industry}
          </div>
        ) : null}
      </div>

      {/* Bottom-right actions */}
      <div style={styles.actionsRow}>
        {/* YouTube / Video */}
       {ytHref ? (
  <button
    type="button"
    style={styles.iconBtnClear}
    title="Open video"
    onClick={(e) => {
      e.stopPropagation();
      setYtHover(false);

      const raw = (item.youtube || "").trim();

      // If running as Electron desktop & API exists → always use VLC
      if (window.electronAPI && typeof window.electronAPI.openInVLC === "function") {
        window.electronAPI.openInVLC(raw || ytHref);
        return;
      }

      // Web build / fallback → open in browser / default player
      window.open(ytHref, "_blank", "noopener,noreferrer");
    }}
    onMouseEnter={() => setYtHover(true)}
    onMouseLeave={() => setYtHover(false)}
  >
    <svg
      viewBox="0 0 24 24"
      style={{
        ...styles.ytSvg,
        ...(ytHover ? styles.ytSvgHover : null),
      }}
      aria-hidden
    >
      <rect
        x="2.8"
        y="6.2"
        width="18.4"
        height="11.6"
        rx="3.2"
        fill={ytHover ? "#FF0000" : "#0D0D0D"}
      />
      <path d="M10 9v6l5-3-5-3z" fill="#FFFFFF" />
    </svg>
  </button>
) : null}


        {/* Vizdom */}
        {vizdomHref ? (
          <a
            href={vizdomHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              setVizHover(false);
            }}
            onMouseDown={() => setVizHover(false)}
            title="Open in Vizdom"
            style={styles.iconBtnClear}
            onMouseEnter={() => setVizHover(true)}
            onMouseLeave={() => setVizHover(false)}
          >
            <span
              style={{ ...styles.vizGlow, ...(vizHover ? styles.vizGlowOn : null) }}
            />
            <span
              style={{
                ...styles.vizMask,
                ...(vizHover ? styles.vizMaskHover : null),
              }}
              aria-hidden
            />
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** ====== PROJECT FORM ====== */
function ProjectForm({ onAdd }) {
  const [form, setForm] = useState({
    sbu: "Enterprise",
    projectName: "",
    buildName: "",
    buildVersion: "V1",
    areaSqft: "",
    industry: "",
    designStyle: "",
    thumb: "",
    youtube: "",
    vizdomId: "",
    url: "", // direct Vizwalk URL (optional)
  });

  const [error, setError] = useState("");

    const thumbFileRef = useRef(null);
  const videoFileRef = useRef(null);

  // Re-use isElectron from above

// Thumbnail
const handleThumbFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const src = isElectron && file.path
      ? file.path
      : URL.createObjectURL(file);

    setForm((f) => ({ ...f, thumb: src }));
    setError("");
  }
};

const handleThumbDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    const src = isElectron && file.path
      ? file.path
      : URL.createObjectURL(file);

    setForm((f) => ({ ...f, thumb: src }));
    setError("");
    return;
  }

  const text = e.dataTransfer.getData("text");
  if (text) {
    setForm((f) => ({ ...f, thumb: text.trim() }));
    setError("");
  }
};





const handleVizwalkDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const file = e.dataTransfer.files?.[0];
  if (file && file.path && file.path.toLowerCase().endsWith(".exe")) {
    // Unreal build exe path (e.g. C:\BUILDS\Dezerv Lumen\Windows\Blank.exe)
    setForm((f) => ({ ...f, url: file.path }));
    setError("");
    return;
  }

  const text = e.dataTransfer.getData("text");
  if (text) {
    setForm((f) => ({ ...f, url: text.trim() }));
    setError("");
  }
};



  // ---- VIDEO HANDLERS ----
const handleVideoFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const src = isElectron && file.path
      ? file.path
      : URL.createObjectURL(file);

    setForm((f) => ({ ...f, youtube: src }));
    setError("");
  }
};

const handleVideoDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();

  const file = e.dataTransfer.files?.[0];
  if (file) {
    const src = isElectron && file.path
      ? file.path
      : URL.createObjectURL(file);

    setForm((f) => ({ ...f, youtube: src }));
    setError("");
    return;
  }

  const text = e.dataTransfer.getData("text");
  if (text) {
    setForm((f) => ({ ...f, youtube: text.trim() }));
    setError("");
  }
};




  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.projectName.trim() || !form.buildName.trim()) {
      setError("Please fill at least Project Name and Build Name");
      return;
    }

    setError("");

    onAdd({
      ...form,
      projectSlot: form.projectName,
      projectSlotId: `${form.projectName}-${Date.now()}`,
      uploadId: "",
    });

    // Reset (keep SBU & version as defaults)
    setForm((f) => ({
      ...f,
      projectName: "",
      buildName: "",
      areaSqft: "",
      industry: "",
      designStyle: "",
      thumb: "",
      youtube: "",
      vizdomId: "",
      url: "",
    }));
  };







  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div style={styles.formWrapper}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <label style={styles.label}>
            SBU
            <select
              name="sbu"
              value={form.sbu}
              onChange={handleChange}
              style={styles.input}
            >
              <option>Enterprise</option>
              <option>SME</option>
              <option>US</option>
            </select>
          </label>
          <label style={styles.label}>
            Project Name
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Emirates, Crescent..."
            />
          </label>
          <label style={styles.label}>
            Build Name
            <input
              name="buildName"
              value={form.buildName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enterprise Demo, SME Demo..."
            />
          </label>
          <label style={styles.labelSmall}>
            Version
            <input
              name="buildVersion"
              value={form.buildVersion}
              onChange={handleChange}
              style={styles.input}
            />
          </label>
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>
            Area (sqft)
            <input
              name="areaSqft"
              value={form.areaSqft}
              onChange={handleChange}
              style={styles.input}
              placeholder="14000"
            />
          </label>
          <label style={styles.label}>
            Construction Type / Industry
            <input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              style={styles.input}
              placeholder="Fitout, Shell & Core..."
            />
          </label>
          <label style={styles.label}>
            Design Style
            <input
              name="designStyle"
              value={form.designStyle}
              onChange={handleChange}
              style={styles.input}
              placeholder="Modern luxury, Scandinavian..."
            />
          </label>
        </div>

        <div
  style={styles.dropWrap}
  onDragOver={preventDefault}
  onDragEnter={preventDefault}
  onDrop={handleThumbDrop}
>
  <input
    name="thumb"
    value={form.thumb}
    onChange={handleChange}
    style={styles.dropInput}
    placeholder="https://… or drag file here"
  />
  <div style={styles.dropFooter}>
    <span style={styles.dropHint}>
      Drag &amp; Drop image / paste link
    </span>
    <button
      type="button"
      style={styles.browseBtn}
      onClick={() => thumbFileRef.current?.click()}
    >
      Browse…
    </button>
  </div>
  {/* hidden file input */}
  <input
    ref={thumbFileRef}
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={handleThumbFileSelect}
  />
</div>


        <div style={styles.formRow}>
  <label style={styles.label}>
    Vizwalk URL (experience or EXE)
    <div
      style={styles.dropWrap}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDrop={handleVizwalkDrop}
    >
      <input
        name="url"
        value={form.url}
        onChange={handleChange}
        style={styles.dropInput}
        placeholder="/experience?project=emirates-demo… or drop Blank.exe"
      />
      <div style={styles.dropFooter}>
        <span style={styles.dropHint}>
          Paste Vizwalk URL or drag &amp; drop <code>Blank.exe</code>
        </span>
        {/* optional: you can add a Browse… button here later if you want */}
      </div>
    </div>
  </label>
</div>


        <div
  style={styles.dropWrap}
  onDragOver={preventDefault}
  onDragEnter={preventDefault}
  onDrop={handleVideoDrop}
>
  <input
    name="youtube"
    value={form.youtube}
    onChange={handleChange}
    style={styles.dropInput}
    placeholder="https://youtube.com/… or drag video file"
  />
  <div style={styles.dropFooter}>
    <span style={styles.dropHint}>
      Drag &amp; Drop MP4/WEBM / paste link
    </span>
    <button
      type="button"
      style={styles.browseBtn}
      onClick={() => videoFileRef.current?.click()}
    >
      Browse…
    </button>
  </div>
  {/* hidden file input */}
  <input
    ref={videoFileRef}
    type="file"
    accept="video/mp4,video/webm,video/*"
    style={{ display: "none" }}
    onChange={handleVideoFileSelect}
  />
</div>


        <div
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {error ? <div style={styles.errorText}>{error}</div> : <span />}
          <button type="submit" style={styles.addBtn}>
            + Add Project
          </button>
        </div>
      </form>
    </div>
  );
}

/** ====== MAIN PAGE (OFFLINE) ====== */
// inside Landing component
export default function Landing() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const onSelect = (id) => setSelectedId((prev) => (prev === id ? null : id));
  const [showProjectActions, setShowProjectActions] = useState(false);

  const [showBgVideo, setShowBgVideo] = useState(false);

  // 1) LOAD from Electron (or fallback to localStorage in dev web)
  useEffect(() => {
    (async () => {
      try {
        if (window.vizwalkStorage?.loadProjects) {
          const saved = await window.vizwalkStorage.loadProjects();
          if (Array.isArray(saved)) {
            setItems(saved);
          }
        } else {
          // fallback if running pure web build
          const raw = window.localStorage?.getItem("vizwalk_projects");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setItems(parsed);
          }
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setStorageReady(true);
      }
    })();
  }, []);

  // 2) SAVE whenever items change
  useEffect(() => {
    if (!storageReady) return;

    try {
      if (window.vizwalkStorage?.saveProjects) {
        window.vizwalkStorage.saveProjects(items);
      } else if (window.localStorage) {
        window.localStorage.setItem("vizwalk_projects", JSON.stringify(items));
      }
    } catch (err) {
      console.error("Error saving projects:", err);
    }
  }, [items, storageReady]);



    // 🔹 Keyboard shortcut: press N to toggle Add/Clear buttons
  // 🔹 Keyboard shortcut: press N to toggle Add/Clear buttons
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const tag = active?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        active?.isContentEditable
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        setShowProjectActions((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🔹 NEW: Keyboard shortcut "?" (Shift + /) to toggle background video
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const tag = active?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        active?.isContentEditable
      ) {
        return;
      }

      // In most layouts, Shift + '/' gives '?'.
      if ((e.key === "?" ) || (e.key === "/" && e.shiftKey)) {
        setShowBgVideo((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ...rest of your component stays EXACTLY the same


  const handleAddProject = (proj) => {
    setItems((prev) => [...prev, proj]);
  };

 const handleClearAll = () => {
  if (!items.length) return;
  setItems([]);

  try {
    if (window.vizwalkStorage?.saveProjects) {
      // Clear the JSON file used by Electron
      window.vizwalkStorage.saveProjects([]);
    } else if (window.localStorage) {
      window.localStorage.removeItem("vizwalk_projects");
    }
  } catch (e) {
    console.error("Failed to clear projects", e);
  }
};



  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.projectName} ${it.buildName} ${it.areaSqft} ${it.industry} ${it.designStyle} ${it.sbu}`;
      return norm(hay).includes(q);
    });
  }, [items, query]);

  const groups = useMemo(() => {
    const g = new Map();
    filtered.forEach((it) => {
      const key = it.sbu || "SBU";
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(it);
    });
    const arr = Array.from(g.entries());
    const order = ["enterprise", "sme", "us"];
    arr.sort(
      (a, b) =>
        order.indexOf((a[0] || "").toLowerCase()) -
        order.indexOf((b[0] || "").toLowerCase())
    );
    return arr;
  }, [filtered]);

  const handleOpenVizwalk = (item) => {
  const rawUrl = (item.url || "").trim();

  // 1) If url is an .exe path, launch via Electron
  const looksLikeExe =
    rawUrl &&
    /\.exe$/i.test(rawUrl) &&
    // very rough Windows path check, optional
    (/^[a-z]:\\/i.test(rawUrl) || rawUrl.startsWith("\\\\"));

  if (looksLikeExe && window.electronAPI?.launchExe) {
    window.electronAPI.launchExe(rawUrl);
    return;
  }

  // 2) Otherwise, fall back to the existing web/relative Vizwalk URL logic
  const bust = Date.now();
  const sessionId = `${(item.projectName || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}`;

  let href;
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    const u = new URL(rawUrl);
    u.searchParams.set("session", sessionId);
    u.searchParams.set("build", item.buildName || item.projectName || "Build");
    href = u.toString();
  } else if (rawUrl) {
    // relative (e.g., /experience?... )
    const u = new URL(rawUrl, window.location.origin);
    u.searchParams.set("session", sessionId);
    u.searchParams.set("build", item.buildName || item.projectName || "Build");
    href = u.toString();
  } else {
    const id = (item.projectName || "project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const params = new URLSearchParams({
      project: id,
      s: bust,
      session: sessionId,
      build: item.buildName || item.projectName || "Build",
    });
    href = `/experience?${params.toString()}`;
  }

  window.open(href, "_blank", "noopener,noreferrer");
};


  const handleOpenGallery = (item) => {
    const build = item.buildName || item.projectName || "Build";
    const params = new URLSearchParams({ build });
    const href = `/gallery?${params.toString()}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
  <div style={styles.wrapper}>
    {/* 🔹 Background video overlay (toggled by ?) */}
    {showBgVideo && (
      <div
        style={styles.bgVideoOverlay}
        onClick={() => setShowBgVideo(false)} // click anywhere to hide
      >
        <video
          src="/bg-video.mp4"     // or "/videos/my-video.mp4" etc.
          style={styles.bgVideo}
          autoPlay
          loop
          muted
        />
        {/* <div style={styles.bgVideoHint}>
          Press <strong>?</strong> again (or click) to close
        </div> */}
      </div>
    )}

    <div style={styles.page}>
      {/* Search bar with + Add Project button */}
        <div style={styles.searchBarWrap}>
          <div style={styles.searchInner}>
            <span style={styles.searchIcon} aria-hidden>
              🔎
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, builds, industries…"
              style={styles.searchInput}
              aria-label="Search projects"
            />
                        {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={styles.clearBtn}
                aria-label="Clear search"
                title="Clear"
              >
                ×
              </button>
            ) : null}

            {/* 🔹 Only show these when N has been pressed */}
            {showProjectActions && (
              <>
                <button
                  type="button"
                  style={styles.searchAddBtn}
                  onClick={() => setShowForm((v) => !v)}
                >
                  + Add Project
                </button>
                <button
                  type="button"
                  style={styles.searchClearBtn}
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </>
            )}

          </div>
        </div>

        {/* Slide-down form */}
        {showForm && <ProjectForm onAdd={handleAddProject} />}

        <div style={styles.columns}>
          {groups.map(([sbu, arr]) => (
            <div key={sbu} style={styles.col}>
              <div style={{ display: "none" }}>{sbu}</div>
              {arr.map((item, i) => {
                const id =
                  (item.projectName || "project")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-") +
                  "-" +
                  i;
                return (
                  <BuildCard
                    key={id}
                    id={id}
                    item={item}
                    onOpenVizwalk={() => handleOpenVizwalk(item)}
                    onOpenGallery={() => handleOpenGallery(item)}
                    onSelect={onSelect}
                    selected={selectedId === id}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ====== STYLES ====== */
const styles = {
  wrapper: {
    width: "100%",
    height: "100vh",
    overflowY: "auto",
    background: "#e9eefcd1",        // fallback when video is off
    position: "relative",
  },
  page: {
    padding: 24,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    position: "relative",
    zIndex: 1,                 // 🔹 keep UI above the video
    // background: "#e9eefcd1",
    minHeight: "100vh",
  },

  // 🔹 Add this new style:
  bgVideo: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    objectFit: "cover",
    zIndex: 0,
    pointerEvents: "none",
    filter: "blur(1px) brightness(0.9)", // optional
  },
  // ...rest of your styles



  /** Form */
  formWrapper: {
    width: "min(1100px, 92vw)",
    margin: "18px auto 24px auto",
    padding: "12px 18px",
    borderRadius: 16,
    background: "#f5f6ff",
    boxShadow: "0 6px 18px rgba(91, 125, 255, 0.12)",
    border: "1px solid #dbe3ff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  formRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    flex: 1,
    minWidth: 200,
  },
  labelSmall: {
    display: "flex",
    flexDirection: "column",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    width: 90,
  },
  input: {
    marginTop: 4,
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #cbd5f5",
    fontSize: 13,
    outline: "none",
    background: "#ffffff",
  },
  addBtn: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: 600,
  },

  dropWrap: {
    marginTop: 4,
    padding: "6px 8px 10px",
    borderRadius: 14,
    border: "1px dashed #cbd5f5",
    background: "#f9fbff",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  dropInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 13,
    padding: "4px 2px",
  },
  dropHint: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
  },


    dropFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  browseBtn: {
    border: "none",
    borderRadius: 999,
    padding: "4px 10px",
    background: "#e0e7ff",
    color: "#1f2937",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  /** Search bar */
  searchBarWrap: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    padding: "8px 0 24px 0",
    // background: "linear-gradient(#e9eefc 60%, rgba(233,238,252,0.7))",
    backdropFilter: "saturate(1.05)",
  },
  searchInner: {
    width: "min(1100px, 92vw)",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    borderRadius: 999,
    border: "1px solid #e5eaf6",
    boxShadow: "0 6px 22px rgba(91, 125, 255, 0.15)",
    padding: "10px 14px",
  },
  searchIcon: { fontSize: 18, opacity: 0.7, marginLeft: 6 },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 16,
    padding: "6px 10px",
    background: "transparent",
  },
  clearBtn: {
    border: "none",
    background: "#f0f3ff",
    width: 28,
    height: 28,
    borderRadius: "50%",
    fontSize: 18,
    lineHeight: "28px",
    cursor: "pointer",
  },
  searchAddBtn: {
    border: "none",
    borderRadius: 999,
    padding: "8px 16px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: 8,
    whiteSpace: "nowrap",
  },
  searchClearBtn: {
    border: "none",
    borderRadius: 999,
    padding: "8px 14px",
    background: "#eef2ff",
    color: "#1f2937",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: 8,
    whiteSpace: "nowrap",
  },

  // Grid
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 360px)",
    gap: 36,
    justifyContent: "center",
  },
  col: { display: "flex", flexDirection: "column", gap: 36 },

  // Card
  card: {
    position: "relative",
    width: 360,
    borderRadius: 18,
    background: "#fff",
    border: "1px solid #eef1fb",
    boxShadow: "0 10px 30px rgba(110,129,255,0.18)",
    padding: 10,
    display: "flex",
    flexDirection: "column",
    transition: "transform 140ms ease, box-shadow 140ms ease",
    cursor: "pointer",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 16px 38px rgba(110,129,255,0.26)",
  },
  cardSelected: {
    boxShadow:
      "0 18px 40px rgba(26,115,232,0.22), 0 0 0 2px rgba(26,115,232,0.32) inset",
  },

  // Media
  mediaWrap: { position: "relative", borderRadius: 12, overflow: "hidden" },
  hero: {
    width: "100%",
    aspectRatio: "1 / 0.62",
    height: "auto",
    objectFit: "cover",
    display: "block",
  },
  heroWrap: {
    position: "relative",
    transition: "filter 200ms ease, transform 200ms ease",
  },
  heroWrapBlur: {
    filter: "blur(4px) brightness(0.9)",
    transform: "scale(1.02)",
  },

  // Overlay pill
  mediaOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 160ms ease",
  },
  mediaOverlayOn: { opacity: 1 },
  mediaBtn: {
    pointerEvents: "auto",
    appearance: "none",
    border: "1px solid rgba(255,255,255,0.75)",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    color: "#1d2433",
    fontSize: 18,
    fontWeight: 800,
    padding: "10px 18px",
    borderRadius: 999,
    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    cursor: "pointer",
    transform: "translateY(0)",
    transition:
      "transform 140ms ease, box-shadow 140ms ease, background 140ms ease",
  },

  // Title block
  titleWrap: { marginTop: 12 },
  titleText: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.15,
    color: "#1d2433",
  },
  versionText: {
    fontSize: 18,
    color: "#9aa4b2",
    marginLeft: 6,
    fontWeight: 700,
  },
  subLink: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: 700,
    color: "#3b82f6",
  },

  // Meta
  metaBlock: { marginTop: 10, color: "#3b3b3b", fontSize: 15, lineHeight: 1.45 },

  // Actions
  actionsRow: {
    position: "absolute",
    right: 12,
    bottom: 12,
    display: "flex",
    gap: 12,
  },

  iconBtnClear: {
    width: 44,
    height: 44,
    position: "relative",
    display: "grid",
    placeItems: "center",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },

  ytSvg: {
    position: "absolute",
    left: "75%",
    top: "50%",
    transform: "translate(-50%, -50%) scale(1.2)",
    width: 38,
    height: 26,
    pointerEvents: "none",
    transition: "transform 140ms ease",
  },
  ytSvgHover: {
    transform: "translate(-50%, -50%) scale(1.2)",
  },

  vizMask: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%) scale(0.9)",
    width: 34,
    height: 34,
    backgroundColor: "#0D0D0D",
    WebkitMaskImage: `url(${vizIcon})`,
    maskImage: `url(${vizIcon})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    pointerEvents: "none",
    zIndex: 1,
    transition:
      "transform 140ms ease, background-color 140ms ease",
  },
  vizMaskHover: {
    transform: "translate(-50%, -50%) scale(0.9)",
    backgroundColor: "#06B6D4",
  },

  vizGlow: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 56,
    height: 56,
    borderRadius: 16,
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 160ms ease",
    zIndex: 0,
    filter:
      "blur(4px) drop-shadow(0 6px 16px rgba(6,182,212,0.30)) drop-shadow(0 0 14px rgba(6,182,212,0.26))",
  },
  vizGlowOn: {
    opacity: 1,
  },
};
