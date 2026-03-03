import "./style.css";

const $ = (id) => {
  const el = document.getElementById(id);
  if (!el) console.error(`[listing] Missing required element #${id}`);
  return el;
};

const tourFrame = $("tourFrame");
const tourFrameViewport = document.getElementById("tourFrameViewport");
const tourFullscreenToggle = document.getElementById("tourFullscreenToggle");
const tourFullscreenExit = document.getElementById("tourFullscreenExit");
const layoutEl = document.querySelector(".layout");
const topTabButtons = Array.from(document.querySelectorAll(".topTabBtn[data-top-tab]"));
const topTabSelect = document.getElementById("topTabSelect");
const viewportMeta = document.querySelector('meta[name="viewport"]');
const propTitle = $("propTitle");
const propSummary = $("propSummary");
const propHoverBlurb = document.getElementById("propHoverBlurb");
const mainPropertyEl = document.querySelector("#tabMain .property");
const infoPropTitle = document.getElementById("infoPropTitle");
const infoPropSummary = document.getElementById("infoPropSummary");
const infoBlurbCard = document.getElementById("infoBlurbCard");
const infoBlurbScroll = document.getElementById("infoBlurbScroll");
const infoBlurbContent = document.getElementById("infoBlurbContent");

// Address subtitle: support both IDs used across versions
const propAddress =
  document.getElementById("propSubAddress") || document.getElementById("propAddress");
if (!propAddress)
  console.error("[listing] Missing required element #propSubAddress (or legacy #propAddress)");

const gallery = $("gallery");
const galleryTitle = $("galleryTitle");
const galleryMenuWrap = document.getElementById("galleryMenuWrap");
const galleryMenuToggle = document.getElementById("galleryMenuToggle");
const galleryMenu = document.getElementById("galleryMenu");
const galleryPageView = document.getElementById("galleryExperienceView");
const galleryPageHint = document.getElementById("galleryPageHint");
const galleryPageGrid = document.getElementById("galleryPageGrid");
const galleryPageList = document.getElementById("galleryPageList");
const galleryPageSidebar = document.querySelector(".pageGallerySidebar");
const infoPageView = document.getElementById("infoExperienceView");
const videosPageView = document.getElementById("videosExperienceView");
const videosTabPlayer = document.getElementById("videosTabPlayer");
const videosModeLabel = document.getElementById("videosModeLabel");
const videosModeMenuWrap = document.getElementById("videosModeMenuWrap");
const videosModeMenuToggle = document.getElementById("videosModeMenuToggle");
const videosModeMenu = document.getElementById("videosModeMenu");
const floorplanPageView = document.getElementById("floorplanExperienceView");
const floorplanTabMount = document.getElementById("floorplanTabMount");
const floorplanLevelLabel = document.getElementById("floorplanLevelLabel");
const floorplanLevelMenuWrap = document.getElementById("floorplanLevelMenuWrap");
const floorplanLevelMenuToggle = document.getElementById("floorplanLevelMenuToggle");
const floorplanLevelMenu = document.getElementById("floorplanLevelMenu");
const sidebarFloorplanLevelLabel = document.getElementById("sidebarFloorplanLevelLabel");
const sidebarFloorplanLevelMenuWrap = document.getElementById("sidebarFloorplanLevelMenuWrap");
const sidebarFloorplanLevelMenuToggle = document.getElementById("sidebarFloorplanLevelMenuToggle");
const sidebarFloorplanLevelMenu = document.getElementById("sidebarFloorplanLevelMenu");
const sidebarFloorplanFrameEl = document.getElementById("sidebarFloorplanFrame");
const sidebarFloorplanPanel = document.querySelector("#tabDrone .floorplanPanel");
const floorplan = $("floorplan"); // inline SVG host

// Floorplan pan/zoom UI (optional; only exists in the newer index)
const floorplanViewport = document.getElementById("floorplanViewport");
const floorplanContent = document.getElementById("floorplanContent");
const floorplanZoom = document.getElementById("floorplanZoom");
const floorplanZoomIn = document.getElementById("floorplanZoomIn");
const floorplanZoomOut = document.getElementById("floorplanZoomOut");
const floorplanZoomValue = document.getElementById("floorplanZoomValue");

// Property stats (Beds / Baths / Sq Ft)
// Support both legacy IDs (bedsVal/bathsVal/sqftVal) and newer IDs (statBeds/statBaths/statSqft)
const getAny = (...ids) => {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return $(ids[0]);
};

const bedsVal = getAny("bedsVal", "statBeds");
const bathsVal = getAny("bathsVal", "statBaths");
const sqftVal = getAny("sqftVal", "statSqft");
const infoAddress = document.getElementById("infoPropSubAddress");
const infoBedsVal = document.getElementById("infoStatBeds");
const infoBathsVal = document.getElementById("infoStatBaths");
const infoSqftVal = document.getElementById("infoStatSqft");

// Sidebar "tab" controls (main <-> drone)
const sidebarEl = document.getElementById("sidebar");
const arrowDown = document.getElementById("arrowDown");
const arrowUp = document.getElementById("arrowUp");
const droneGrid = document.getElementById("droneGrid");
const sidebarVideosModeLabel = document.getElementById("sidebarVideosModeLabel");
const sidebarVideosModeMenuWrap = document.getElementById("sidebarVideosModeMenuWrap");
const sidebarVideosModeMenuToggle = document.getElementById("sidebarVideosModeMenuToggle");
const sidebarVideosModeMenu = document.getElementById("sidebarVideosModeMenu");
const arrowDownRight = document.getElementById("arrowDownRight");
const arrowUpRight = document.getElementById("arrowUpRight");

if (!sidebarEl) console.error("[listing] Missing required element #sidebar");

// 1) Determine which listing to load from URL
// e.g. listing.rtfmediasolutions.com/?id=prod_demo_house_01
const params = new URLSearchParams(location.search);
const DEFAULT_LISTING_ID = "prod_demo_house_01";
const EXTERIOR_GALLERY_NODE_ID = 0;
let currentListingId = DEFAULT_LISTING_ID;
let listingManifest = null;

// -----------------------------
// Sidebar tab switching (no user scrolling)
// -----------------------------
let activeTab = "main"; // "main" | "drone"
let activeTopTab = "tour"; // "tour" | "gallery" | placeholders
const mobileViewportLockQuery = "(max-width: 820px)";
const defaultViewportMetaContent =
  viewportMeta?.getAttribute("content") || "width=device-width, initial-scale=1.0";
const mobileViewportMetaContent =
  "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
let galleryPageScrollIndicatorBound = false;
let infoBlurbScrollIndicatorBound = false;
let galleryPageHintShowTimer = null;
let galleryPageHintHideTimer = null;
let galleryIndexByNode = new Map();
let galleryLabelsByNode = new Map();
let galleryAliasByNode = new Map();
let listingVideoSources = { scrub: [], drone: [] };
let currentDroneVideos = [];
const GALLERY_DEFERRED_APPLY_MS = 220;
const GALLERY_THUMB_ROOT_MARGIN = "300px";
const GALLERY_DEFAULT_IMAGE_WIDTH = 900;
const GALLERY_DEFAULT_IMAGE_HEIGHT = 600;
const galleryRenderCache = new Map();
const galleryThumbLoadState = new Map();
const galleryFullLoadState = new Map();
const galleryOriginalLoadState = new Map();
let galleryThumbObserver = null;
let galleryDeferredApplyRafId = 0;
let galleryDeferredApplyTimerId = 0;
let galleryDeferredApplyRequestId = 0;
let galleryIdlePrefetchHandle = 0;
let galleryPreviewState = null;

function syncMobileViewportZoomLock() {
  if (!viewportMeta || typeof window.matchMedia !== "function") return;
  const nextContent = window.matchMedia(mobileViewportLockQuery).matches
    ? mobileViewportMetaContent
    : defaultViewportMetaContent;
  if (viewportMeta.getAttribute("content") !== nextContent) {
    viewportMeta.setAttribute("content", nextContent);
  }
}

syncMobileViewportZoomLock();
if (typeof window.matchMedia === "function") {
  const mobileViewportLockMql = window.matchMedia(mobileViewportLockQuery);
  if (typeof mobileViewportLockMql.addEventListener === "function") {
    mobileViewportLockMql.addEventListener("change", syncMobileViewportZoomLock);
  } else if (typeof mobileViewportLockMql.addListener === "function") {
    mobileViewportLockMql.addListener(syncMobileViewportZoomLock);
  }
}

function syncGalleryPageScrollIndicator() {
  if (!galleryPageList || !galleryPageSidebar) return;

  const trackHeight = Math.max(galleryPageSidebar.clientHeight - 24, 0);
  const viewportHeight = galleryPageList.clientHeight;
  const contentHeight = galleryPageList.scrollHeight;
  const scrollableHeight = Math.max(contentHeight - viewportHeight, 0);
  const hasOverflow = scrollableHeight > 1 && trackHeight > 0;
  const thumbHeight = hasOverflow
    ? clamp((viewportHeight / contentHeight) * trackHeight, 40, trackHeight)
    : Math.min(trackHeight, 56);
  const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);
  const thumbOffset = hasOverflow
    ? (galleryPageList.scrollTop / scrollableHeight) * maxThumbOffset
    : 0;

  galleryPageSidebar.style.setProperty("--page-gallery-scroll-thumb-height", `${thumbHeight}px`);
  galleryPageSidebar.style.setProperty("--page-gallery-scroll-thumb-offset", `${thumbOffset}px`);
  galleryPageSidebar.style.setProperty("--page-gallery-scroll-thumb-opacity", hasOverflow ? "1" : "0.35");
}

function scheduleGalleryPageScrollIndicatorSync() {
  requestAnimationFrame(syncGalleryPageScrollIndicator);
}

function ensureGalleryPageScrollIndicatorHandlers() {
  if (galleryPageScrollIndicatorBound || !galleryPageList || !galleryPageSidebar) return;
  galleryPageScrollIndicatorBound = true;

  galleryPageList.addEventListener("scroll", syncGalleryPageScrollIndicator, { passive: true });
  window.addEventListener("resize", scheduleGalleryPageScrollIndicatorSync);

  if (typeof ResizeObserver !== "undefined") {
    const galleryPageScrollResizeObserver = new ResizeObserver(() => {
      scheduleGalleryPageScrollIndicatorSync();
    });
    galleryPageScrollResizeObserver.observe(galleryPageList);
    galleryPageScrollResizeObserver.observe(galleryPageSidebar);
  }
}

function hideGalleryPageHint() {
  if (!galleryPageHint) return;
  if (galleryPageHintShowTimer) {
    clearTimeout(galleryPageHintShowTimer);
    galleryPageHintShowTimer = null;
  }
  if (galleryPageHintHideTimer) {
    clearTimeout(galleryPageHintHideTimer);
    galleryPageHintHideTimer = null;
  }
  galleryPageHint.classList.remove("isVisible");
  window.setTimeout(() => {
    if (!galleryPageHint.classList.contains("isVisible")) {
      galleryPageHint.hidden = true;
      galleryPageHint.setAttribute("aria-hidden", "true");
    }
  }, 180);
}

function queueGalleryPageHint() {
  if (!galleryPageHint) return;
  hideGalleryPageHint();
  galleryPageHintShowTimer = window.setTimeout(() => {
    galleryPageHint.hidden = false;
    galleryPageHint.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      galleryPageHint.classList.add("isVisible");
    });
    galleryPageHintHideTimer = window.setTimeout(() => {
      hideGalleryPageHint();
    }, 3000);
  }, 500);
}

function syncInfoBlurbScrollIndicator() {
  if (!infoBlurbContent || !infoBlurbScroll) return;

  const trackHeight = Math.max(infoBlurbScroll.clientHeight - 24, 0);
  const viewportHeight = infoBlurbContent.clientHeight;
  const contentHeight = infoBlurbContent.scrollHeight;
  const scrollableHeight = Math.max(contentHeight - viewportHeight, 0);
  const hasOverflow = scrollableHeight > 1 && trackHeight > 0;
  const thumbHeight = hasOverflow
    ? clamp((viewportHeight / contentHeight) * trackHeight, 40, trackHeight)
    : Math.min(trackHeight, 56);
  const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);
  const thumbOffset = hasOverflow
    ? (infoBlurbContent.scrollTop / scrollableHeight) * maxThumbOffset
    : 0;

  infoBlurbScroll.style.setProperty("--info-blurb-scroll-thumb-height", `${thumbHeight}px`);
  infoBlurbScroll.style.setProperty("--info-blurb-scroll-thumb-offset", `${thumbOffset}px`);
  infoBlurbScroll.style.setProperty("--info-blurb-scroll-thumb-opacity", hasOverflow ? "1" : "0.35");
}

function scheduleInfoBlurbScrollIndicatorSync() {
  requestAnimationFrame(syncInfoBlurbScrollIndicator);
}

function ensureInfoBlurbScrollIndicatorHandlers() {
  if (infoBlurbScrollIndicatorBound || !infoBlurbContent || !infoBlurbScroll) return;
  infoBlurbScrollIndicatorBound = true;

  infoBlurbContent.addEventListener("scroll", syncInfoBlurbScrollIndicator, { passive: true });
  window.addEventListener("resize", scheduleInfoBlurbScrollIndicatorSync);

  if (typeof ResizeObserver !== "undefined") {
    const infoBlurbScrollResizeObserver = new ResizeObserver(() => {
      scheduleInfoBlurbScrollIndicatorSync();
    });
    infoBlurbScrollResizeObserver.observe(infoBlurbContent);
    infoBlurbScrollResizeObserver.observe(infoBlurbScroll);
  }
}

function setSidebarTab(tab) {
  activeTab = tab;
  if (!sidebarEl) return;
  if (tab === "drone") sidebarEl.classList.add("isDrone");
  else sidebarEl.classList.remove("isDrone");
  syncRenderedDroneMedia();

  if (tab === "drone") {
    requestAnimationFrame(() => {
      scheduleFloorplanInitRetry(90);
      refitFloorplanAfterResize();
    });
    window.setTimeout(() => {
      if (activeTab !== "drone") return;
      scheduleFloorplanInitRetry(90);
      refitFloorplanAfterResize();
    }, 420);
  }
}

function mountFloorplanFrameToTab() {
  if (!floorplanTabMount || !sidebarFloorplanFrameEl) return;
  if (sidebarFloorplanFrameEl.parentElement === floorplanTabMount) return;
  floorplanTabMount.appendChild(sidebarFloorplanFrameEl);
}

function restoreFloorplanFrameToSidebar() {
  if (!sidebarFloorplanPanel || !sidebarFloorplanFrameEl) return;
  if (sidebarFloorplanFrameEl.parentElement === sidebarFloorplanPanel) return;
  sidebarFloorplanPanel.appendChild(sidebarFloorplanFrameEl);
}

function setTopTab(tab) {
  activeTopTab = tab;
  for (const btn of topTabButtons) {
    const isActive = (btn.dataset.topTab || "") === tab;
    btn.classList.toggle("isActive", isActive);
  }
  if (topTabSelect && topTabSelect.value !== tab) topTabSelect.value = tab;

  const isGalleryTab = tab === "gallery";
  const isInfoTab = tab === "info";
  const isVideosTab = tab === "videos";
  const isFloorplanTab = tab === "floorplan";
  const isOverlayTab = isGalleryTab || isInfoTab || isVideosTab || isFloorplanTab;
  if (layoutEl) {
    layoutEl.classList.toggle("isGalleryView", isGalleryTab);
    layoutEl.classList.toggle("isInfoView", isInfoTab);
    layoutEl.classList.toggle("isVideosView", isVideosTab);
    layoutEl.classList.toggle("isFloorplanView", isFloorplanTab);
  }
  document.documentElement.classList.toggle("isGalleryView", isGalleryTab);
  document.documentElement.classList.toggle("isInfoView", isInfoTab);
  document.documentElement.classList.toggle("isVideosView", isVideosTab);
  document.documentElement.classList.toggle("isFloorplanView", isFloorplanTab);
  document.body.classList.toggle("isGalleryView", isGalleryTab);
  document.body.classList.toggle("isInfoView", isInfoTab);
  document.body.classList.toggle("isVideosView", isVideosTab);
  document.body.classList.toggle("isFloorplanView", isFloorplanTab);
  if (isOverlayTab) exitTourFullscreen().catch(() => {});
  if (galleryPageView) galleryPageView.hidden = !isGalleryTab;
  if (infoPageView) infoPageView.hidden = !isInfoTab;
  if (videosPageView) videosPageView.hidden = !isVideosTab;
  if (floorplanPageView) floorplanPageView.hidden = !isFloorplanTab;
  if (tourFrame) tourFrame.hidden = isOverlayTab;
  if (tourFrameViewport) tourFrameViewport.hidden = isOverlayTab;
  if (sidebarEl) sidebarEl.hidden = isOverlayTab;
  syncRenderedDroneMedia();
  syncTourFullscreenUi();

  if (isFloorplanTab) {
    mountFloorplanFrameToTab();
  } else {
    restoreFloorplanFrameToSidebar();
  }

  if (isGalleryTab) {
    closeGalleryMenu();
    closeFloorplanLevelMenu();
    closeVideoModeMenus();
    scheduleGalleryPageScrollIndicatorSync();
    queueGalleryPageHint();
    return;
  }

  hideGalleryPageHint();

  if (isInfoTab) {
    closeGalleryMenu();
    closeFloorplanLevelMenu();
    closeVideoModeMenus();
    scheduleInfoBlurbScrollIndicatorSync();
    return;
  }

  if (isVideosTab) {
    closeGalleryMenu();
    closeFloorplanLevelMenu();
    closeVideoModeMenus();
    return;
  }

  if (isFloorplanTab) {
    closeGalleryMenu();
    closeVideoModeMenus();
    requestAnimationFrame(() => {
      scheduleFloorplanInitRetry(60);
      refitFloorplanAfterResize();
    });
    return;
  }

  closeFloorplanLevelMenu();
  closeVideoModeMenus();
  if (activeTab === "drone") {
    requestAnimationFrame(() => {
      scheduleFloorplanInitRetry(90);
      refitFloorplanAfterResize();
    });
  }
  requestAnimationFrame(() => applyTourFrameScale());
}

for (const btn of topTabButtons) {
  btn.addEventListener("click", () => {
    const tab = (btn.dataset.topTab || "tour").toLowerCase();
    setTopTab(tab);
  });
}

if (topTabSelect) {
  topTabSelect.addEventListener("change", () => {
    const tab = (topTabSelect.value || "tour").toLowerCase();
    setTopTab(tab);
  });
}

function isPropHoverBlurbVisible() {
  if (!propHoverBlurb) return false;
  const style = window.getComputedStyle(propHoverBlurb);
  return Number.parseFloat(style.opacity || "0") > 0.01;
}

if (mainPropertyEl && propHoverBlurb) {
  mainPropertyEl.addEventListener("click", () => {
    if (!isPropHoverBlurbVisible()) return;
    mainPropertyEl.classList.add("isBlurbDismissed");
    propHoverBlurb.setAttribute("aria-hidden", "true");
  });

  mainPropertyEl.addEventListener("pointerleave", () => {
    mainPropertyEl.classList.remove("isBlurbDismissed");
  });
}

// Wire arrow buttons
if (arrowDown) arrowDown.addEventListener("click", () => setSidebarTab("drone"));
if (arrowUp) arrowUp.addEventListener("click", () => setSidebarTab("main"));
if (arrowDownRight) arrowDownRight.addEventListener("click", () => setSidebarTab("drone"));
if (arrowUpRight) arrowUpRight.addEventListener("click", () => setSidebarTab("main"));

let listing = null;

function isTourViewportFullscreen() {
  return (
    document.fullscreenElement === tourFrameViewport ||
    document.webkitFullscreenElement === tourFrameViewport
  );
}

function syncTourFullscreenUi() {
  const isFullscreen = isTourViewportFullscreen();
  if (tourFrameViewport) tourFrameViewport.classList.toggle("isFullscreen", isFullscreen);
  if (tourFullscreenToggle) {
    tourFullscreenToggle.textContent = isFullscreen ? "Fullscreen" : "Fullscreen";
    tourFullscreenToggle.setAttribute(
      "aria-label",
      isFullscreen ? "Player fullscreen active" : "Enter player fullscreen"
    );
    tourFullscreenToggle.disabled = activeTopTab !== "tour";
    tourFullscreenToggle.hidden = activeTopTab !== "tour";
  }
}

async function enterTourFullscreen() {
  if (!tourFrameViewport || isTourViewportFullscreen()) return;
  const request =
    tourFrameViewport.requestFullscreen ||
    tourFrameViewport.webkitRequestFullscreen ||
    tourFrameViewport.msRequestFullscreen;
  if (!request) return;
  await request.call(tourFrameViewport);
}

async function exitTourFullscreen() {
  const exit =
    document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (!exit || !isTourViewportFullscreen()) return;
  await exit.call(document);
}

if (tourFullscreenToggle) {
  tourFullscreenToggle.addEventListener("click", () => {
    if (activeTopTab !== "tour") return;
    enterTourFullscreen().catch(() => {});
  });
}

if (tourFullscreenExit) {
  tourFullscreenExit.addEventListener("click", () => {
    exitTourFullscreen().catch(() => {});
  });
}

document.addEventListener("fullscreenchange", syncTourFullscreenUi);
document.addEventListener("webkitfullscreenchange", syncTourFullscreenUi);
let lastAppliedKey = null;
let currentGallerySourceNodeId = 0;
let lastPlayerGalleryNodeId = null;
let lastPlayerFloorplanNodeId = null;
let playerViewMode = "unknown";
let galleryStartupLockedToExterior = false;
let pendingInteriorGalleryNodeId = null;
let pendingInteriorFloorplanNodeId = null;
let tourStartedBySignal = false;
let tourInteractionObserved = false;
let startupExteriorNodeZeroActivatedAt = 0;
let galleryPreviewEl = null;
let galleryPreviewTimer = null;
let galleryPreviewPinned = false;
let galleryMenuOpen = false;
let galleryMenuBound = false;
let openFloorplanLevelMenuKey = "";
let floorplanLevelMenuBound = false;
let activeVideoMode = "scrub";
let openVideoModeMenuKey = "";
let videoModeMenuBound = false;
let tourInteractionUnlockBound = false;
const tourFrameScaleState = {
  baseWidth: 0,
  baseHeight: 0,
  bound: false,
  resizeObserver: null
};

function applyTourFrameScale(forceBaseReset = false) {
  if (!tourFrame || !tourFrameViewport) return;

  const rect = tourFrameViewport.getBoundingClientRect();
  const viewportWidth = rect.width;
  const viewportHeight = rect.height;
  if (!(viewportWidth > 0 && viewportHeight > 0)) return;

  if (
    forceBaseReset ||
    !(tourFrameScaleState.baseWidth > 0) ||
    !(tourFrameScaleState.baseHeight > 0)
  ) {
    tourFrameScaleState.baseWidth = viewportWidth;
    tourFrameScaleState.baseHeight = viewportHeight;
  }

  // Scale down relative to the largest viewport size observed.
  if (viewportWidth > tourFrameScaleState.baseWidth) tourFrameScaleState.baseWidth = viewportWidth;
  if (viewportHeight > tourFrameScaleState.baseHeight) {
    tourFrameScaleState.baseHeight = viewportHeight;
  }

  const scale = Math.min(
    viewportWidth / tourFrameScaleState.baseWidth,
    viewportHeight / tourFrameScaleState.baseHeight,
    1
  );

  if (scale >= 0.999) {
    tourFrame.style.transform = "";
    tourFrame.style.width = "100%";
    tourFrame.style.height = "100%";
    return;
  }

  tourFrame.style.transform = `scale(${scale})`;
  tourFrame.style.width = `${100 / scale}%`;
  tourFrame.style.height = `${100 / scale}%`;
}

function ensureTourFrameScaleHandlers() {
  if (tourFrameScaleState.bound) return;
  if (!tourFrame || !tourFrameViewport) return;
  tourFrameScaleState.bound = true;

  const refresh = () => {
    requestAnimationFrame(() => applyTourFrameScale());
  };

  window.addEventListener("resize", refresh);

  if (typeof ResizeObserver !== "undefined") {
    tourFrameScaleState.resizeObserver = new ResizeObserver(() => refresh());
    tourFrameScaleState.resizeObserver.observe(tourFrameViewport);
  }

  tourFrame.addEventListener("load", () => {
    applyTourFrameScale(true);
  });
}

function getNumericImageOrder(value) {
  const source =
    typeof value === "string"
      ? value
      : value?.full || value?.thumb || value?.medium || value?.src || value?.url || "";
  const m = String(source || "").match(/\/(\d{3})\.[^/.?]+(?:[?#].*)?$/i);
  return Number(m?.[1] || 999);
}

function formatGalleryFolderLabel(folderName) {
  const raw = typeof folderName === "string" ? folderName.trim() : "";
  if (!raw) return "";
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function normalizeLookupValue(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getNormalizedHostname() {
  return normalizeLookupValue(window.location.hostname);
}

function isDevelopmentHostname(hostname) {
  const normalized = normalizeLookupValue(hostname);
  return (
    !normalized ||
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized.endsWith(".localhost")
  );
}

async function loadListingManifest() {
  if (listingManifest) return listingManifest;

  try {
    const res = await fetch("/listings/index.json", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    listingManifest = data && typeof data === "object" ? data : null;
  } catch {
    listingManifest = null;
  }

  return listingManifest;
}

function getManifestListings(manifest) {
  return Array.isArray(manifest?.listings) ? manifest.listings : [];
}

function getListingEntryById(manifest, listingId) {
  const targetId = normalizeLookupValue(listingId);
  if (!targetId) return null;
  return (
    getManifestListings(manifest).find((entry) => normalizeLookupValue(entry?.id) === targetId) || null
  );
}

function getListingEntryBySlug(manifest, slug) {
  const targetSlug = normalizeLookupValue(slug);
  if (!targetSlug) return null;
  return (
    getManifestListings(manifest).find(
      (entry) => normalizeLookupValue(entry?.slug) === targetSlug
    ) || null
  );
}

function getListingEntryByHostname(manifest, hostname) {
  const targetHost = normalizeLookupValue(hostname);
  if (!targetHost) return null;
  return (
    getManifestListings(manifest).find((entry) =>
      (Array.isArray(entry?.hostnames) ? entry.hostnames : []).some(
        (candidate) => normalizeLookupValue(candidate) === targetHost
      )
    ) || null
  );
}

function getManifestDomainSuffixes(manifest) {
  return (Array.isArray(manifest?.domainSuffixes) ? manifest.domainSuffixes : [])
    .map((value) => normalizeLookupValue(value))
    .filter(Boolean);
}

function getSlugFromHostname(manifest, hostname) {
  const normalizedHost = normalizeLookupValue(hostname);
  if (!normalizedHost || isDevelopmentHostname(normalizedHost) || normalizedHost.endsWith(".pages.dev")) {
    return "";
  }

  const exactEntry = getListingEntryByHostname(manifest, normalizedHost);
  if (exactEntry?.slug) return normalizeLookupValue(exactEntry.slug);

  for (const suffix of getManifestDomainSuffixes(manifest)) {
    const needle = `.${suffix}`;
    if (!normalizedHost.endsWith(needle)) continue;
    const prefix = normalizedHost.slice(0, -needle.length);
    return normalizeLookupValue(prefix);
  }

  return "";
}

async function resolveCurrentListingId() {
  const explicitId = normalizeLookupValue(params.get("id"));
  if (explicitId) return explicitId;

  const manifest = await loadListingManifest();

  const explicitSlug = normalizeLookupValue(params.get("slug"));
  if (explicitSlug) {
    const bySlug = getListingEntryBySlug(manifest, explicitSlug);
    if (bySlug?.id) return bySlug.id;
  }

  const hostname = getNormalizedHostname();
  const byHostname = getListingEntryByHostname(manifest, hostname);
  if (byHostname?.id) return byHostname.id;

  const slug = getSlugFromHostname(manifest, hostname);
  if (slug) {
    const bySlug = getListingEntryBySlug(manifest, slug);
    if (bySlug?.id) return bySlug.id;
  }

  const defaultId = normalizeLookupValue(manifest?.defaultListingId);
  return defaultId || DEFAULT_LISTING_ID;
}

function isAbsoluteUrl(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url) || /^(?:data|blob):/i.test(url);
}

function joinUrlParts(base, path) {
  const safeBase = String(base || "").replace(/\/+$/, "");
  const safePath = String(path || "").replace(/^\/+/, "");
  if (!safeBase) return safePath ? `/${safePath}` : "";
  if (!safePath) return safeBase;
  return `${safeBase}/${safePath}`;
}

function resolveListingAssetUrl(rawUrl) {
  const raw = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!raw) return "";
  if (isAbsoluteUrl(raw) || raw.startsWith("/")) return raw;

  const mediaBaseUrl =
    typeof listing?.mediaBaseUrl === "string" ? listing.mediaBaseUrl.trim() : "";
  return mediaBaseUrl ? joinUrlParts(mediaBaseUrl, raw) : raw;
}

function dedupeUrls(values) {
  const urls = [];
  const seen = new Set();
  for (const value of values) {
    const url = typeof value === "string" ? value.trim() : "";
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

function deriveSizedGalleryAssetPath(rawPath, sizeSegment) {
  const raw = typeof rawPath === "string" ? rawPath.trim() : "";
  const size = typeof sizeSegment === "string" ? sizeSegment.trim().toLowerCase() : "";
  if (!raw || !size) return "";

  const replaced = raw.replace(/\/(thumb|medium|full)\//i, `/${size}/`);
  if (replaced !== raw) return replaced;

  const suffixMatch = raw.match(/([?#].*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : "";
  const basePath = suffix ? raw.slice(0, -suffix.length) : raw;
  const slashIndex = basePath.lastIndexOf("/");
  if (slashIndex === -1) return `${size}/${basePath}${suffix}`;
  return `${basePath.slice(0, slashIndex)}/${size}/${basePath.slice(slashIndex + 1)}${suffix}`;
}

function deriveOriginalGalleryAssetPath(rawPath, extension = "jpg") {
  const raw = typeof rawPath === "string" ? rawPath.trim() : "";
  const ext = typeof extension === "string" ? extension.trim().replace(/^\./, "") : "";
  if (!raw) return "";

  const suffixMatch = raw.match(/([?#].*)$/);
  const suffix = suffixMatch ? suffixMatch[1] : "";
  const basePath = suffix ? raw.slice(0, -suffix.length) : raw;
  const withoutSizeSegment = basePath.replace(/\/(thumb|medium|full)\//i, "/");
  if (!ext) return `${withoutSizeSegment}${suffix}`;
  return `${withoutSizeSegment.replace(/\.[^/.]+$/i, "")}.${ext}${suffix}`;
}

function normalizeImageDimensionValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeGalleryAsset(value, index = 0) {
  const fallbackId = `gallery-asset-${index}`;
  let rawThumb = "";
  let rawMedium = "";
  let rawFull = "";
  let rawOriginal = "";
  let rawFallbackThumb = "";
  let rawFallbackMedium = "";
  let rawFallbackFull = "";
  let rawFallbackOriginal = "";
  let width = GALLERY_DEFAULT_IMAGE_WIDTH;
  let height = GALLERY_DEFAULT_IMAGE_HEIGHT;

  if (typeof value === "string") {
    rawOriginal = value.trim();
    rawFull = rawOriginal;
  } else if (value && typeof value === "object") {
    rawThumb =
      typeof value.thumb === "string"
        ? value.thumb.trim()
        : typeof value.thumbnail === "string"
          ? value.thumbnail.trim()
          : typeof value.small === "string"
            ? value.small.trim()
            : "";
    rawMedium =
      typeof value.medium === "string"
        ? value.medium.trim()
        : typeof value.preview === "string"
          ? value.preview.trim()
          : "";
    rawFull =
      typeof value.full === "string"
        ? value.full.trim()
        : typeof value.src === "string"
            ? value.src.trim()
            : typeof value.url === "string"
              ? value.url.trim()
              : "";
    rawOriginal =
      typeof value.original === "string"
        ? value.original.trim()
        : typeof value.source === "string"
          ? value.source.trim()
          : "";
    rawFallbackThumb =
      typeof value.fallbackThumb === "string"
        ? value.fallbackThumb.trim()
        : typeof value.thumbFallback === "string"
          ? value.thumbFallback.trim()
          : "";
    rawFallbackMedium =
      typeof value.fallbackMedium === "string"
        ? value.fallbackMedium.trim()
        : typeof value.mediumFallback === "string"
          ? value.mediumFallback.trim()
          : "";
    rawFallbackFull =
      typeof value.fallbackFull === "string"
        ? value.fallbackFull.trim()
        : typeof value.fullFallback === "string"
          ? value.fullFallback.trim()
          : "";
    rawFallbackOriginal =
      typeof value.fallbackOriginal === "string"
        ? value.fallbackOriginal.trim()
        : typeof value.originalFallback === "string"
          ? value.originalFallback.trim()
          : "";
    width = normalizeImageDimensionValue(value.width, width);
    height = normalizeImageDimensionValue(value.height, height);
  }

  const baseSource = rawOriginal || rawFull || rawMedium || rawThumb;
  const fallbackSource = rawFallbackOriginal || rawFallbackFull || rawFallbackMedium || rawFallbackThumb;
  const derivedThumb = rawThumb || deriveSizedGalleryAssetPath(baseSource, "thumb");
  const derivedMedium = rawMedium || deriveSizedGalleryAssetPath(baseSource || rawFull, "medium");
  const derivedFull = rawFull || deriveSizedGalleryAssetPath(baseSource, "full");
  const derivedOriginal = rawOriginal || deriveOriginalGalleryAssetPath(rawFull || rawMedium || rawThumb || baseSource, "jpg");

  const thumbCandidates = dedupeUrls(
    [
      derivedThumb,
      deriveSizedGalleryAssetPath(derivedFull || baseSource, "thumb"),
      rawFallbackThumb,
      deriveSizedGalleryAssetPath(rawFallbackFull || fallbackSource, "thumb"),
      fallbackSource,
      baseSource
    ].map(resolveListingAssetUrl)
  );
  const mediumCandidates = dedupeUrls(
    [
      derivedMedium,
      deriveSizedGalleryAssetPath(derivedFull || baseSource, "medium"),
      rawFallbackMedium,
      deriveSizedGalleryAssetPath(rawFallbackFull || fallbackSource, "medium"),
      rawFallbackFull,
      derivedFull,
      fallbackSource,
      baseSource
    ].map(resolveListingAssetUrl)
  );
  const fullCandidates = dedupeUrls(
    [
      derivedFull,
      deriveSizedGalleryAssetPath(derivedFull || baseSource, "full"),
      derivedMedium,
      rawFallbackFull,
      rawFallbackMedium,
      rawFallbackThumb,
      fallbackSource,
      baseSource,
      derivedThumb
    ].map(resolveListingAssetUrl)
  );
  const originalCandidates = dedupeUrls(
    [
      derivedOriginal,
      deriveOriginalGalleryAssetPath(rawFallbackOriginal || rawFallbackFull || fallbackSource, "jpg"),
      rawFallbackOriginal,
      fallbackSource,
      rawFallbackFull,
      derivedFull,
      baseSource,
      derivedThumb
    ].map(resolveListingAssetUrl)
  );

  return {
    key: fullCandidates[0] || thumbCandidates[0] || fallbackId,
    thumb: thumbCandidates[0] || fullCandidates[0] || "",
    medium: mediumCandidates[0] || "",
    full: fullCandidates[0] || thumbCandidates[0] || "",
    original: originalCandidates[0] || fullCandidates[0] || thumbCandidates[0] || "",
    thumbCandidates,
    mediumCandidates,
    fullCandidates,
    originalCandidates,
    width,
    height,
    resolvedThumbUrl: "",
    resolvedFullUrl: "",
    resolvedOriginalUrl: "",
    thumbLoadPromise: null,
    fullLoadPromise: null,
    originalLoadPromise: null
  };
}

function normalizeListingAssetUrls(values, limit = Infinity) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const urls = [];

  for (const value of values) {
    const resolved = resolveListingAssetUrl(value);
    if (!resolved || seen.has(resolved)) continue;
    seen.add(resolved);
    urls.push(resolved);
    if (urls.length >= limit) break;
  }

  return urls;
}

function getGalleryItemsFromEntry(entry) {
  if (!entry || typeof entry !== "object") return [];
  const rawItems = Array.isArray(entry.gallery)
    ? entry.gallery
    : Array.isArray(entry.images)
      ? entry.images
      : Array.isArray(entry.urls)
        ? entry.urls
        : [];

  const items = [];
  const seen = new Set();
  for (let i = 0; i < rawItems.length; i++) {
    const asset = normalizeGalleryAsset(rawItems[i], i);
    if ((!asset.thumb && !asset.full) || seen.has(asset.key)) continue;
    seen.add(asset.key);
    items.push(asset);
    if (items.length >= 4) break;
  }

  return items.sort((a, b) => getNumericImageOrder(a) - getNumericImageOrder(b));
}

function getEntryLabel(entry) {
  if (!entry || typeof entry !== "object") return "";
  const raw = typeof entry.label === "string" ? entry.label.trim() : "";
  return raw || "";
}

function setGalleryEntry(index, labels, nodeId, entry) {
  const items = getGalleryItemsFromEntry(entry);
  if (items.length) index.set(nodeId, items);
  const label = getEntryLabel(entry);
  if (label && !labels.has(nodeId)) labels.set(nodeId, label);
}

function setGalleryLabel(labels, nodeId, entry) {
  const label = getEntryLabel(entry);
  if (label && !labels.has(nodeId)) labels.set(nodeId, label);
}

function buildRuntimeGalleryState(currentListing) {
  const index = new Map();
  const labels = new Map();
  const aliases = new Map();

  const explicit = currentListing?.galleriesByNode;
  const hasExplicitGalleryData = !!(
    explicit &&
    typeof explicit === "object" &&
    Object.keys(explicit).length
  );
  if (explicit && typeof explicit === "object") {
    for (const [nodeIdRaw, entry] of Object.entries(explicit)) {
      const nodeId = Number(nodeIdRaw);
      if (!Number.isFinite(nodeId) || nodeId < 0) continue;
      setGalleryEntry(index, labels, nodeId, entry);
    }
  }

  const roomsById = currentListing?.roomsById;
  if (roomsById && typeof roomsById === "object") {
    for (const [nodeIdRaw, entry] of Object.entries(roomsById)) {
      const nodeId = Number(nodeIdRaw);
      if (!Number.isFinite(nodeId) || nodeId < 0) continue;
      if (hasExplicitGalleryData) {
        setGalleryLabel(labels, nodeId, entry);
        continue;
      }
      if (index.has(nodeId)) continue;
      setGalleryEntry(index, labels, nodeId, entry);
    }
  }

  const nodeKeyMap = currentListing?.nodeToRoomKey;
  const roomsByKey = currentListing?.roomsByKey;
  if (nodeKeyMap && roomsByKey && typeof nodeKeyMap === "object" && typeof roomsByKey === "object") {
    for (const [nodeIdRaw, roomKeyRaw] of Object.entries(nodeKeyMap)) {
      const nodeId = Number(nodeIdRaw);
      if (!Number.isFinite(nodeId) || nodeId < 0) continue;
      const roomKey = String(roomKeyRaw || "").trim();
      if (!roomKey) continue;
      const entry = roomsByKey[roomKey];
      if (hasExplicitGalleryData) {
        setGalleryLabel(labels, nodeId, entry);
        continue;
      }
      if (index.has(nodeId)) continue;
      setGalleryEntry(index, labels, nodeId, entry);
    }
  }

  const rawAliases = currentListing?.galleryAliasesByNode;
  if (rawAliases && typeof rawAliases === "object") {
    for (const [nodeIdRaw, targetRaw] of Object.entries(rawAliases)) {
      const nodeId = Number(nodeIdRaw);
      const targetNodeId = Number(targetRaw);
      if (!Number.isFinite(nodeId) || nodeId < 0) continue;
      if (!Number.isFinite(targetNodeId) || targetNodeId < 0) continue;
      aliases.set(nodeId, targetNodeId);
    }
  }

  return { index, labels, aliases };
}

function pushVideoModeSources(target, mode, value) {
  const normalizedMode = mode === "drone" ? "drone" : "scrub";
  const items = Array.isArray(value) ? value : [value];

  for (const item of items) {
    const resolved = resolveListingAssetUrl(item);
    if (!resolved || target[normalizedMode].includes(resolved)) continue;
    target[normalizedMode].push(resolved);
  }
}

function buildRuntimeVideoSources(currentListing) {
  const sources = { scrub: [], drone: [] };
  const drone = currentListing?.drone;
  if (!drone || typeof drone !== "object") return sources;

  const explicitSources = drone.sources;
  if (explicitSources && typeof explicitSources === "object") {
    pushVideoModeSources(sources, "scrub", explicitSources.scrub);
    pushVideoModeSources(sources, "drone", explicitSources.drone);
  }

  if (!sources.scrub.length) {
    pushVideoModeSources(sources, "scrub", drone.videos);
  }

  if (!sources.drone.length) {
    pushVideoModeSources(sources, "drone", drone.video);
  }

  return sources;
}

const DEFAULT_HOVER_BLURB = {
  title: "Modern Elegance Meets Everyday Comfort",
  paragraphs: [
    "Welcome to this beautifully designed 4-bedroom, 3-bathroom residence offering approximately 2,600 square feet of thoughtfully crafted living space. Blending contemporary architecture with warm, inviting finishes, this home delivers the perfect balance of style and functionality.",
    "Step inside to an open-concept floor plan filled with natural light, soaring ceilings, and seamless indoor-outdoor flow. The chef-inspired kitchen features premium appliances, generous counter space, and an oversized island ideal for entertaining. The expansive primary suite offers a private retreat complete with a spa-like ensuite and walk-in closet.",
    "Additional bedrooms provide flexibility for family, guests, or a dedicated office space, while multiple living areas ensure room to relax or host in comfort. Designed for modern living, this home is a showcase of quality craftsmanship and timeless design.",
    "Experience the property through our fully immersive 3D and interactive tour to explore every detail at your own pace."
  ]
};

function toParagraphs(value) {
  if (Array.isArray(value)) {
    return value
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return [];
}

function renderBlurbInto(targetEl, blurb) {
  if (!targetEl) return;
  const src = blurb && typeof blurb === "object" ? blurb : DEFAULT_HOVER_BLURB;
  const title =
    typeof src.title === "string" && src.title.trim()
      ? src.title.trim()
      : DEFAULT_HOVER_BLURB.title;
  const paragraphs = toParagraphs(src.paragraphs);
  const safeParagraphs = paragraphs.length ? paragraphs : DEFAULT_HOVER_BLURB.paragraphs;

  targetEl.innerHTML = "";

  const lead = document.createElement("p");
  lead.className = "propHoverBlurbLead";
  lead.textContent = title;
  targetEl.appendChild(lead);

  for (const text of safeParagraphs) {
    const p = document.createElement("p");
    p.textContent = text;
    targetEl.appendChild(p);
  }
}

function renderHoverBlurb(blurb) {
  renderBlurbInto(propHoverBlurb, blurb);
}

function renderInfoBlurb(blurb) {
  renderBlurbInto(infoBlurbContent || infoBlurbCard, blurb);
  scheduleInfoBlurbScrollIndicatorSync();
}

const DRONE_SCRUB_SENSITIVITY = 0.55;
const DRONE_SCRUB_FRAME_STEP = 5 / 24;
const DRONE_SCRUB_SEEK_INTERVAL_MS = 60;

function isSidebarStackedPresentation() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;
  if (width <= 900) return true;
  return width > 900 && height <= 760;
}

function createVideoScrubberElement(src) {
  const wrap = document.createElement("div");
  wrap.className = "droneScrubber";
  wrap._mountImmediately = true;
  const scrubDebug = params.get("scrubDebug") === "1" || params.get("debug") === "1";

  const video = document.createElement("video");
  video.className = "droneScrubberVideo";
  video.controls = false;
  video.playsInline = true;
  video.preload = "auto";
  video.muted = true;
  video.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback nofullscreen");
  video.disablePictureInPicture = true;
  video.setAttribute("aria-hidden", "true");

  const overlay = document.createElement("div");
  overlay.className = "droneScrubberOverlay";

  const overlayInner = document.createElement("div");
  overlayInner.className = "droneScrubberOverlayInner";

  const loadButton = document.createElement("button");
  loadButton.type = "button";
  loadButton.className = "droneScrubberLoadButton";
  loadButton.textContent = "Load 360";

  const loadHelper = document.createElement("div");
  loadHelper.className = "droneScrubberLoadHelper";
  loadHelper.textContent = "Loads the 360 for smooth scrubbing";

  const loadStatus = document.createElement("div");
  loadStatus.className = "droneScrubberLoadStatus";
  loadStatus.hidden = true;
  loadStatus.setAttribute("aria-live", "polite");

  overlayInner.appendChild(loadButton);
  overlayInner.appendChild(loadHelper);
  overlayInner.appendChild(loadStatus);
  overlay.appendChild(overlayInner);

  const controls = document.createElement("div");
  controls.className = "droneScrubberControls";

  const hint = document.createElement("div");
  hint.className = "droneScrubberHint";
  hint.hidden = true;
  hint.setAttribute("aria-hidden", "true");
  const hintArrow = document.createElement("span");
  hintArrow.className = "droneScrubberHintArrow";
  hintArrow.textContent = "↓";
  const hintText = document.createElement("span");
  hintText.className = "droneScrubberHintText";
  hintText.textContent = "Use Handle to Rotate House";
  hint.appendChild(hintArrow);
  hint.appendChild(hintText);

  const range = document.createElement("input");
  range.className = "droneScrubberRange";
  range.type = "range";
  range.min = "0";
  range.max = "0";
  range.step = "any";
  range.value = "0";
  range.disabled = true;
  range.setAttribute("aria-label", "Scrub video frames");

  const getScrubRangeMax = (duration) =>
    duration > 0 ? Math.max(duration / DRONE_SCRUB_SENSITIVITY, duration) : 0;

  const rangeValueToTime = (value, duration) => {
    if (!duration) return 0;
    return Math.max(0, Math.min(value * DRONE_SCRUB_SENSITIVITY, duration));
  };

  const timeToRangeValue = (value, duration) => {
    if (!duration) return 0;
    return Math.max(0, Math.min(value / DRONE_SCRUB_SENSITIVITY, getScrubRangeMax(duration)));
  };

  const quantizeSeekTime = (value, duration) => {
    if (!duration) return 0;
    const clamped = Math.max(0, Math.min(value, duration));
    const quantized = Math.round(clamped / DRONE_SCRUB_FRAME_STEP) * DRONE_SCRUB_FRAME_STEP;
    return Math.max(0, Math.min(quantized, duration));
  };

  const syncRangeValue = (value) => {
    range.value = String(Math.max(0, value));
  };

  const getBufferedRanges = () => {
    const ranges = [];
    const buffered = video.buffered;
    if (!buffered) return ranges;
    for (let i = 0; i < buffered.length; i++) {
      ranges.push([buffered.start(i), buffered.end(i)]);
    }
    return ranges;
  };

  const logScrub = (message, extra = {}) => {
    if (!scrubDebug) return;
    console.log("[listing][scrub]", message, {
      src,
      currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      buffered: getBufferedRanges(),
      stallCount,
      ...extra
    });
  };

  const syncUi = () => {
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const current = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    if (isScrubberReady && duration > 0) {
      const rangeMax = getScrubRangeMax(duration);
      if (range.max !== String(rangeMax)) range.max = String(rangeMax);
      range.disabled = false;
      if (!isDraggingRange) {
        syncRangeValue(timeToRangeValue(Math.min(current, duration), duration));
      }
    } else {
      range.disabled = true;
      syncRangeValue(0);
    }
  };

  let pendingSeekTime = NaN;
  let appliedSeekTime = NaN;
  let currentSeekTarget = NaN;
  let isSeeking = false;
  let seekTimerId = 0;
  let lastSeekStartedAt = 0;
  let isDraggingRange = false;
  let forceExactOnNextSeek = false;
  let decoderWarmed = false;
  let stallCount = 0;
  let isScrubberReady = false;
  let isLoading360 = false;
  let fetchController = null;
  let localObjectUrl = "";

  const clearQueuedSeekTimer = () => {
    if (!seekTimerId) return;
    clearTimeout(seekTimerId);
    seekTimerId = 0;
  };

  const warmDecoder = () => {
    if (decoderWarmed) return;
    decoderWarmed = true;
    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            video.pause();
            logScrub("decoder-warmed");
          })
          .catch((error) => {
            logScrub("decoder-warm-failed", { error: String(error?.message || error || "") });
          });
      } else {
        video.pause();
        logScrub("decoder-warmed");
      }
    } catch (error) {
      logScrub("decoder-warm-failed", { error: String(error?.message || error || "") });
    }
  };

  const updateLoadStatus = (text, isError = false) => {
    loadStatus.hidden = !text;
    loadStatus.textContent = text;
    wrap.classList.toggle("hasError", Boolean(isError));
  };

  const revokeLocalObjectUrl = () => {
    if (!localObjectUrl) return;
    URL.revokeObjectURL(localObjectUrl);
    localObjectUrl = "";
  };

  const resetScrubberState = () => {
    clearQueuedSeekTimer();
    pendingSeekTime = NaN;
    appliedSeekTime = NaN;
    currentSeekTarget = NaN;
    isSeeking = false;
    lastSeekStartedAt = 0;
    isDraggingRange = false;
    forceExactOnNextSeek = false;
    decoderWarmed = false;
    stallCount = 0;
    isScrubberReady = false;
    range.disabled = true;
    range.max = "0";
    syncRangeValue(0);
    loadButton.disabled = false;
    loadStatus.hidden = true;
    loadStatus.textContent = "";
    wrap.classList.remove("isLoaded", "isLoading", "hasError");
  };

  const waitForScrubberReady = () =>
    new Promise((resolve, reject) => {
      let hasMetadata = video.readyState >= 1;
      let hasCanPlay = video.readyState >= 3;
      let settled = false;

      const cleanup = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("canplaythrough", onCanPlayThrough);
        video.removeEventListener("error", onError);
      };

      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const onLoadedMetadata = () => {
        hasMetadata = true;
        if (hasCanPlay) finish();
      };

      const onCanPlay = () => {
        hasCanPlay = true;
        if (hasMetadata) finish();
      };

      const onCanPlayThrough = () => finish();

      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Video readiness failed"));
      };

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("canplaythrough", onCanPlayThrough);
      video.addEventListener("error", onError);

      if (video.readyState >= 4 || (hasMetadata && hasCanPlay)) finish();
    });

  const fetchScrubberBlob = async (url, signal) => {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentLength = Number.parseInt(response.headers.get("content-length") || "", 10);
    const totalBytes = Number.isFinite(contentLength) && contentLength > 0 ? contentLength : 0;
    const reader = response.body?.getReader?.();
    if (!reader) {
      updateLoadStatus(totalBytes ? "Loading... 100%" : "Loading...");
      return response.blob();
    }

    updateLoadStatus(totalBytes ? "Loading... 0%" : "Loading...");
    const chunks = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      chunks.push(value);
      receivedBytes += value.byteLength;
      if (totalBytes > 0) {
        const percent = Math.max(0, Math.min(100, Math.round((receivedBytes / totalBytes) * 100)));
        updateLoadStatus(`Loading... ${percent}%`);
      } else {
        updateLoadStatus("Loading...");
      }
    }

    if (totalBytes > 0) updateLoadStatus("Loading... 100%");
    return new Blob(chunks, { type: response.headers.get("content-type") || "video/mp4" });
  };

  const loadScrubberIntoMemory = async () => {
    if (isLoading360 || isScrubberReady) return;
    isLoading360 = true;
    loadButton.disabled = true;
    wrap.classList.add("isLoading");
    wrap.classList.remove("hasError");
    updateLoadStatus("Loading...");
    fetchController = new AbortController();

    try {
      const blob = await fetchScrubberBlob(src, fetchController.signal);
      if (fetchController.signal.aborted) return;

      revokeLocalObjectUrl();
      localObjectUrl = URL.createObjectURL(blob);
      video.src = localObjectUrl;
      try {
        video.load();
      } catch {}

      await waitForScrubberReady();

      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      if (duration > 0) {
        const startTime = Math.min(0.01, duration);
        video.currentTime = startTime;
        appliedSeekTime = quantizeSeekTime(startTime, duration);
        syncRangeValue(timeToRangeValue(startTime, duration));
      }

      isScrubberReady = true;
      wrap.classList.remove("isLoading", "hasError");
      wrap.classList.add("isLoaded");
      updateLoadStatus("");
      syncUi();
      logScrub("local-load-ready", { objectUrl: localObjectUrl });
    } catch (error) {
      if (fetchController?.signal?.aborted) return;
      wrap.classList.remove("isLoading", "isLoaded");
      wrap.classList.add("hasError");
      loadButton.disabled = false;
      revokeLocalObjectUrl();
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {}
      updateLoadStatus("Couldn't load 360. Try again.", true);
      logScrub("local-load-failed", { error: String(error?.message || error || "") });
    } finally {
      isLoading360 = false;
      fetchController = null;
      wrap.classList.remove("isLoading");
    }
  };

  const startSeek = (targetTime, exact = false) => {
    if (!isScrubberReady) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (!duration) return;

    const target = quantizeSeekTime(targetTime, duration);
    if (Number.isFinite(appliedSeekTime) && Math.abs(target - appliedSeekTime) <= DRONE_SCRUB_FRAME_STEP / 2) {
      return;
    }

    currentSeekTarget = target;
    isSeeking = true;
    lastSeekStartedAt = performance.now();
    warmDecoder();
    logScrub("seek-start", { target, exact });

    try {
      if (!exact && typeof video.fastSeek === "function") {
        video.fastSeek(target);
      } else {
        video.currentTime = target;
      }
    } catch (error) {
      isSeeking = false;
      logScrub("seek-error", { target, exact, error: String(error?.message || error || "") });
    }
  };

  const pumpSeekQueue = (force = false) => {
    if (!isScrubberReady) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (!duration || !Number.isFinite(pendingSeekTime)) return;
    if (isSeeking) return;

    const target = quantizeSeekTime(pendingSeekTime, duration);
    if (Number.isFinite(appliedSeekTime) && Math.abs(target - appliedSeekTime) <= DRONE_SCRUB_FRAME_STEP / 2) return;

    clearQueuedSeekTimer();
    const elapsed = performance.now() - lastSeekStartedAt;
    if (!force && elapsed < DRONE_SCRUB_SEEK_INTERVAL_MS) {
      seekTimerId = window.setTimeout(() => {
        seekTimerId = 0;
        pumpSeekQueue(forceExactOnNextSeek);
      }, DRONE_SCRUB_SEEK_INTERVAL_MS - elapsed);
      return;
    }

    const exact = force || forceExactOnNextSeek;
    forceExactOnNextSeek = false;
    startSeek(target, exact);
  };

  const queueSeekToRangeValue = (rawValue, exact = false) => {
    if (!isScrubberReady) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const next = Number(rawValue);
    if (!Number.isFinite(next) || !duration) return;
    pendingSeekTime = quantizeSeekTime(rangeValueToTime(next, duration), duration);
    if (exact) forceExactOnNextSeek = true;
    pumpSeekQueue(exact);
  };

  const finishDragSeek = () => {
    if (!isDraggingRange) return;
    isDraggingRange = false;
    queueSeekToRangeValue(range.value, true);
  };

  range.addEventListener("pointerdown", () => {
    if (!isScrubberReady) return;
    isDraggingRange = true;
    warmDecoder();
  });
  range.addEventListener("pointerup", finishDragSeek);
  range.addEventListener("pointercancel", finishDragSeek);
  range.addEventListener("change", finishDragSeek);
  range.addEventListener("input", () => {
    if (!isScrubberReady) return;
    isDraggingRange = true;
    warmDecoder();
    queueSeekToRangeValue(range.value, false);
  });

  let revealHintTimer = 0;
  let hideHintTimer = 0;
  let hintVisible = false;
  let mobileTouchHintShown = false;

  const clearHintTimers = () => {
    if (revealHintTimer) {
      clearTimeout(revealHintTimer);
      revealHintTimer = 0;
    }
    if (hideHintTimer) {
      clearTimeout(hideHintTimer);
      hideHintTimer = 0;
    }
  };

  const hideHint = (immediate = false) => {
    clearHintTimers();
    if (!hintVisible) {
      hint.hidden = true;
      return;
    }
    hintVisible = false;
    hint.classList.remove("isVisible");
    if (immediate) {
      hint.hidden = true;
      return;
    }
    hideHintTimer = window.setTimeout(() => {
      hint.hidden = true;
      hideHintTimer = 0;
    }, 180);
  };

  const showHint = () => {
    revealHintTimer = 0;
    if (hintVisible) return;
    hint.hidden = false;
    // Force a frame so transition runs when un-hiding.
    void hint.offsetWidth;
    hint.classList.add("isVisible");
    hintVisible = true;
    hideHintTimer = window.setTimeout(() => hideHint(false), 3000);
  };

  wrap.addEventListener("pointerenter", () => {
    if (!isScrubberReady) return;
    if (hintVisible) return;
    if (revealHintTimer) clearTimeout(revealHintTimer);
    revealHintTimer = window.setTimeout(showHint, 1000);
  });

  wrap.addEventListener("pointerleave", () => {
    if (revealHintTimer) {
      clearTimeout(revealHintTimer);
      revealHintTimer = 0;
    }
  });

  wrap.addEventListener("pointerdown", (event) => {
    if (!isScrubberReady) return;
    const isMobileTouch =
      event.pointerType === "touch" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 820px)").matches;

    if (isMobileTouch) {
      if (!mobileTouchHintShown) {
        mobileTouchHintShown = true;
        showHint();
      }
      return;
    }

    hideHint(true);
  });

  // Keep the element strictly in "still-frame scrubber" mode.
  const keepPaused = () => {
    if (!video.paused) video.pause();
    syncUi();
  };

  loadButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    loadScrubberIntoMemory();
  });

  video.addEventListener("loadedmetadata", () => {
    if (!isScrubberReady) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (duration > 0) {
      const startTime = Math.min(0.01, duration);
      video.currentTime = startTime;
      syncRangeValue(timeToRangeValue(startTime, duration));
      appliedSeekTime = quantizeSeekTime(startTime, duration);
    }
    keepPaused();
    logScrub("loadedmetadata");
  });
  video.addEventListener("loadeddata", keepPaused);
  video.addEventListener("canplay", keepPaused);
  video.addEventListener("seeked", () => {
    isSeeking = false;
    appliedSeekTime = Number.isFinite(currentSeekTarget)
      ? currentSeekTarget
      : quantizeSeekTime(video.currentTime || 0, video.duration || 0);
    keepPaused();
    logScrub("seeked", { appliedSeekTime, pendingSeekTime });
    if (Number.isFinite(pendingSeekTime) && Math.abs(pendingSeekTime - appliedSeekTime) > DRONE_SCRUB_FRAME_STEP / 2) {
      pumpSeekQueue(true);
    }
  });
  video.addEventListener("waiting", () => {
    stallCount += 1;
    logScrub("waiting");
  });
  video.addEventListener("stalled", () => {
    stallCount += 1;
    logScrub("stalled");
  });
  video.addEventListener("play", keepPaused);
  wrap._destroyMedia = () => {
    clearHintTimers();
    fetchController?.abort();
    fetchController = null;
    resetScrubberState();
    revokeLocalObjectUrl();
    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch {}
  };

  wrap.appendChild(video);
  wrap.appendChild(overlay);
  controls.appendChild(hint);
  controls.appendChild(range);
  wrap.appendChild(controls);
  return wrap;
}

function createStandardVideoElement(src) {
  if (typeof src !== "string" || !src.trim()) return null;
  const video = document.createElement("video");
  video.className = "droneStandardVideo";
  video.controls = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = src.trim();
  video.addEventListener(
    "loadeddata",
    () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      if (video.currentTime > 0) return;
      try {
        video.currentTime = Math.min(0.01, video.duration);
      } catch {}
    },
    { once: true }
  );
  return video;
}

function createVideoMediaElement(src, mode = "scrub") {
  if (typeof src !== "string" || !src.trim()) return null;
  const mediaSrc = src.trim();
  const isFileVideo =
    /^\/|\.((mp4)|(webm)|(ogg)|(mov))(?:[?#].*)?$/i.test(mediaSrc) ||
    mediaSrc.startsWith("blob:") ||
    mediaSrc.startsWith("data:video/");

  if (isFileVideo) {
    return mode === "drone"
      ? createStandardVideoElement(mediaSrc)
      : createVideoScrubberElement(mediaSrc);
  }

  const frame = document.createElement("iframe");
  frame.src = mediaSrc;
  frame.title = "Listing video";
  frame.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  frame.allowFullscreen = true;
  return frame;
}

function cleanupMountedMediaElement(mediaEl) {
  if (!mediaEl || typeof mediaEl !== "object") return;
  if (typeof mediaEl._destroyMedia === "function") {
    try {
      mediaEl._destroyMedia();
    } catch {}
    delete mediaEl._destroyMedia;
  }
}

function getPrimaryMediaVideoEl(mediaEl) {
  if (!mediaEl) return null;
  if ((mediaEl.tagName || "").toLowerCase() === "video") return mediaEl;
  if (typeof mediaEl.querySelector === "function") {
    return mediaEl.querySelector("video");
  }
  return null;
}

function mountMediaWhenReady(container, mediaEl) {
  if (!container) return;
  if (!mediaEl) {
    cleanupMountedMediaElement(container.firstElementChild);
    container.innerHTML = "";
    return;
  }

  const nextMountToken = String((Number(container.dataset.mountToken || "0") || 0) + 1);
  container.dataset.mountToken = nextMountToken;

  const commit = () => {
    if (container.dataset.mountToken !== nextMountToken) {
      cleanupMountedMediaElement(mediaEl);
      return;
    }
    cleanupMountedMediaElement(container.firstElementChild);
    container.innerHTML = "";
    container.appendChild(mediaEl);
  };

  if (mediaEl._mountImmediately) {
    commit();
    return;
  }

  const videoEl = getPrimaryMediaVideoEl(mediaEl);
  if (!videoEl) {
    commit();
    return;
  }

  if (videoEl.readyState >= 2) {
    commit();
    return;
  }

  let settled = false;
  let fallbackTimer = 0;

  const finish = () => {
    if (settled) return;
    settled = true;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    videoEl.removeEventListener("loadeddata", finish);
    videoEl.removeEventListener("canplay", finish);
    videoEl.removeEventListener("error", finish);
    commit();
  };

  videoEl.addEventListener("loadeddata", finish, { once: true });
  videoEl.addEventListener("canplay", finish, { once: true });
  videoEl.addEventListener("error", finish, { once: true });
  fallbackTimer = window.setTimeout(finish, 900);
  try {
    videoEl.load?.();
  } catch {}
}

function normalizeVideoMode(mode) {
  return String(mode || "").trim().toLowerCase() === "drone" ? "drone" : "scrub";
}

function getVideoModeLabel(mode) {
  return normalizeVideoMode(mode) === "drone" ? "Drone Video" : "360 Scrub";
}

function getResolvedListingVideoSources(videos) {
  const jsonVideos = Array.isArray(videos)
    ? normalizeListingAssetUrls(videos)
    : [];

  return {
    scrub: listingVideoSources.scrub[0] || jsonVideos[0] || "",
    drone: listingVideoSources.drone[0] || ""
  };
}

function clearMountedMedia(container) {
  if (!container) return;
  container.dataset.mountToken = String((Number(container.dataset.mountToken || "0") || 0) + 1);
  cleanupMountedMediaElement(container.firstElementChild);
  container.innerHTML = "";
  delete container.dataset.mediaKey;
}

function mountResolvedMedia(container, src, mode) {
  if (!container) return;
  const normalizedSrc = typeof src === "string" ? src.trim() : "";
  if (!normalizedSrc) {
    clearMountedMedia(container);
    return;
  }

  const mediaKey = `${normalizeVideoMode(mode)}:${normalizedSrc}`;
  if (container.dataset.mediaKey === mediaKey && container.childElementCount > 0) return;

  const media = createVideoMediaElement(normalizedSrc, mode);
  if (!media) {
    clearMountedMedia(container);
    return;
  }

  container.dataset.mediaKey = mediaKey;
  mountMediaWhenReady(container, media);
}

function syncRenderedDroneMedia() {
  const sources = getResolvedListingVideoSources(currentDroneVideos);
  const mode = normalizeVideoMode(activeVideoMode);
  const selectedSrc = mode === "drone" ? sources.drone : sources.scrub;
  const showSidebarMedia = activeTopTab === "tour" && (activeTab === "drone" || isSidebarStackedPresentation());
  const showVideosPageMedia = activeTopTab === "videos";

  if (showSidebarMedia) mountResolvedMedia(droneGrid, selectedSrc, mode);
  else clearMountedMedia(droneGrid);

  if (showVideosPageMedia) mountResolvedMedia(videosTabPlayer, selectedSrc, mode);
  else clearMountedMedia(videosTabPlayer);
}

function getAvailableVideoModeOptions(videos) {
  const sources = getResolvedListingVideoSources(videos);
  const options = [];
  if (sources.scrub) options.push({ value: "scrub", label: "360 Scrub" });
  if (sources.drone) options.push({ value: "drone", label: "Drone Video" });
  return options;
}

function syncVideoModeControls(videos) {
  const options = getAvailableVideoModeOptions(videos);
  const hasActive = options.some((option) => option.value === activeVideoMode);
  if (!hasActive && options[0]) activeVideoMode = options[0].value;
  const label = getVideoModeLabel(activeVideoMode);
  if (videosModeLabel) videosModeLabel.textContent = label;
  if (sidebarVideosModeLabel) sidebarVideosModeLabel.textContent = label;
  if (videosModeMenuToggle) videosModeMenuToggle.dataset.mode = activeVideoMode;
  if (sidebarVideosModeMenuToggle) sidebarVideosModeMenuToggle.dataset.mode = activeVideoMode;
  const showToggle = options.length > 1;
  if (videosModeMenuWrap) videosModeMenuWrap.hidden = !showToggle;
  if (sidebarVideosModeMenuWrap) sidebarVideosModeMenuWrap.hidden = !showToggle;
  if (!showToggle) closeVideoModeMenus();
}

function renderVideoModeMenuItems(menuEl, videos) {
  if (!menuEl) return;
  const options = getAvailableVideoModeOptions(videos);
  menuEl.innerHTML = "";

  for (const option of options) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "floorplanLevelMenuItem";
    item.role = "menuitem";
    item.textContent = option.label;
    item.dataset.mode = option.value;
    if (option.value === activeVideoMode) item.classList.add("isActive");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      activeVideoMode = option.value;
      renderDroneVideos(videos);
      closeVideoModeMenus();
    });
    menuEl.appendChild(item);
  }
}

function setVideoModeMenuOpen(key, open, videos = []) {
  openVideoModeMenuKey = open ? key : "";
  const controls = [
    { key: "page", menu: videosModeMenu, toggle: videosModeMenuToggle },
    { key: "sidebar", menu: sidebarVideosModeMenu, toggle: sidebarVideosModeMenuToggle }
  ];

  for (const control of controls) {
    const isOpen = open && control.key === key;
    if (isOpen) renderVideoModeMenuItems(control.menu, videos);
    if (control.menu) control.menu.hidden = !isOpen;
    if (control.toggle) {
      control.toggle.classList.toggle("isOpen", isOpen);
      control.toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }
}

function closeVideoModeMenus() {
  setVideoModeMenuOpen("", false, listing?.drone?.videos || []);
}

function ensureVideoModeMenuHandlers() {
  if (videoModeMenuBound) return;
  const controls = [
    {
      key: "page",
      wrap: videosModeMenuWrap,
      toggle: videosModeMenuToggle
    },
    {
      key: "sidebar",
      wrap: sidebarVideosModeMenuWrap,
      toggle: sidebarVideosModeMenuToggle
    }
  ].filter((control) => control.wrap && control.toggle);

  if (!controls.length) return;
  videoModeMenuBound = true;

  for (const control of controls) {
    control.toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextOpen = openVideoModeMenuKey !== control.key;
      setVideoModeMenuOpen(control.key, nextOpen, listing?.drone?.videos || []);
    });
  }

  document.addEventListener("pointerdown", (event) => {
    if (!openVideoModeMenuKey) return;
    const target = event.target;
    const activeControl = controls.find((control) => control.key === openVideoModeMenuKey);
    if (activeControl?.wrap && target instanceof Node && activeControl.wrap.contains(target)) return;
    closeVideoModeMenus();
  });
}

function renderDroneVideos(videos) {
  currentDroneVideos = Array.isArray(videos) ? videos.slice() : [];
  const sources = getResolvedListingVideoSources(videos);
  const options = getAvailableVideoModeOptions(videos);
  if (!options.length) {
    activeVideoMode = "scrub";
  } else if (!options.some((option) => option.value === activeVideoMode)) {
    activeVideoMode = options[0].value;
  }
  syncVideoModeControls(videos);
  syncRenderedDroneMedia();
}

function setGalleryMenuOpen(open) {
  galleryMenuOpen = Boolean(open);
  if (!galleryMenu || !galleryMenuToggle) return;
  galleryMenu.hidden = !galleryMenuOpen;
  galleryMenuToggle.classList.toggle("isOpen", galleryMenuOpen);
  galleryMenuToggle.setAttribute("aria-expanded", galleryMenuOpen ? "true" : "false");
}

function closeGalleryMenu() {
  setGalleryMenuOpen(false);
}

function closeFloorplanLevelMenu() {
  setFloorplanLevelMenuOpen("", false);
}

function getFloorplanLevelLabel(level) {
  return normalizeFloorplanLevel(level) === "up" ? "Upstairs" : "Downstairs";
}

function getFloorplanLevelOptions() {
  const fp = listing?.floorplans || {};
  const options = [];
  const hasDown = typeof fp.down === "string" && fp.down.trim();
  const hasUp = typeof fp.up === "string" && fp.up.trim();
  const hasLegacy = typeof listing?.floorplan === "string" && listing.floorplan.trim();

  if (hasDown || hasLegacy) options.push({ value: "down", label: "Downstairs" });
  if (hasUp) options.push({ value: "up", label: "Upstairs" });
  return options;
}

function getFloorplanLevelControls() {
  return [
    {
      key: "page",
      label: floorplanLevelLabel,
      wrap: floorplanLevelMenuWrap,
      toggle: floorplanLevelMenuToggle,
      menu: floorplanLevelMenu
    },
    {
      key: "sidebar",
      label: sidebarFloorplanLevelLabel,
      wrap: sidebarFloorplanLevelMenuWrap,
      toggle: sidebarFloorplanLevelMenuToggle,
      menu: sidebarFloorplanLevelMenu
    }
  ].filter((control) => control.wrap && control.toggle && control.menu);
}

function renderFloorplanLevelMenuItems(menuEl, activeLevel = "down") {
  if (!menuEl) return;
  const normalizedActive = normalizeFloorplanLevel(activeLevel);
  menuEl.innerHTML = "";

  for (const option of getFloorplanLevelOptions()) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "floorplanLevelMenuItem";
    item.role = "menuitem";
    item.textContent = option.label;
    item.dataset.level = option.value;
    if (option.value === normalizedActive) item.classList.add("isActive");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyFloorplanForLevel(option.value);
      closeFloorplanLevelMenu();
    });
    menuEl.appendChild(item);
  }
}

function setFloorplanLevelMenuOpen(key, open) {
  openFloorplanLevelMenuKey = open ? key : "";
  const controls = getFloorplanLevelControls();

  for (const control of controls) {
    const isOpen = open && control.key === key;
    if (isOpen) renderFloorplanLevelMenuItems(control.menu, control.toggle.dataset.level || "down");
    control.menu.hidden = !isOpen;
    control.toggle.classList.toggle("isOpen", isOpen);
    control.toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
}

function ensureFloorplanLevelMenuHandlers() {
  if (floorplanLevelMenuBound) return;
  const controls = getFloorplanLevelControls();
  if (!controls.length) return;
  floorplanLevelMenuBound = true;

  for (const control of controls) {
    control.toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const currentLevel = control.toggle.dataset.level || "down";
      renderFloorplanLevelMenuItems(control.menu, currentLevel);
      const nextOpen = openFloorplanLevelMenuKey !== control.key;
      setFloorplanLevelMenuOpen(control.key, nextOpen);
    });
  }

  document.addEventListener("pointerdown", (event) => {
    if (!openFloorplanLevelMenuKey) return;
    const target = event.target;
    const activeControl = controls.find((control) => control.key === openFloorplanLevelMenuKey);
    if (activeControl?.wrap && target instanceof Node && activeControl.wrap.contains(target)) return;
    closeFloorplanLevelMenu();
  });
}

function parseMessageNodeNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return NaN;
  return Number(trimmed);
}

function getGalleryNodeIdFromMessage(data) {
  const candidates = [
    data?.sequenceNode,
    data?.sequenceNodePadded,
    data?.nodeKey,
    data?.nodeId,
    data?.legacyNodeId
  ];

  for (const candidate of candidates) {
    const parsed = parseMessageNodeNumber(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return NaN;
}

function getFloorplanNodeIdFromMessage(data) {
  const candidates = [data?.nodeId, data?.legacyNodeId, data?.sequenceNode];

  for (const candidate of candidates) {
    const parsed = parseMessageNodeNumber(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return NaN;
}

function unlockStartupExteriorGallery() {
  if (!galleryStartupLockedToExterior) return;
  if (!tourStartedBySignal) return;
  if (!tourInteractionObserved) return;
  galleryStartupLockedToExterior = false;
  if (Number.isFinite(pendingInteriorGalleryNodeId) && pendingInteriorGalleryNodeId >= 0) {
    if (pendingInteriorGalleryNodeId === 0) startupExteriorNodeZeroActivatedAt = Date.now();
    applyGalleryForNodeId(pendingInteriorGalleryNodeId, { defer: true });
  }
  if (Number.isFinite(pendingInteriorFloorplanNodeId) && pendingInteriorFloorplanNodeId >= 0) {
    applyFloorplanForNodeId(pendingInteriorFloorplanNodeId);
  }
  pendingInteriorGalleryNodeId = null;
  pendingInteriorFloorplanNodeId = null;
}

function ensureTourInteractionUnlockHandlers() {
  if (tourInteractionUnlockBound) return;
  if (!tourFrame) return;
  tourInteractionUnlockBound = true;

  const unlock = () => {
    tourInteractionObserved = true;
    unlockStartupExteriorGallery();
  };

  tourFrame.addEventListener("pointerdown", unlock, { passive: true });
  tourFrame.addEventListener("mousedown", unlock, { passive: true });
  tourFrame.addEventListener("touchstart", unlock, { passive: true });
}

function getFolderGalleryLabelForNodeId(nodeId) {
  const label = galleryLabelsByNode.get(Number(nodeId));
  return typeof label === "string" && label.trim() ? label.trim() : "";
}

function getGalleryLabelForNodeId(nodeId, roomEntry = null) {
  const folderLabel = getFolderGalleryLabelForNodeId(nodeId);
  if (folderLabel) return folderLabel;
  if (roomEntry && typeof roomEntry.label === "string" && roomEntry.label.trim()) {
    return roomEntry.label.trim();
  }
  const n = Number(nodeId);
  if (Number.isFinite(n) && (n === EXTERIOR_GALLERY_NODE_ID || n === 0)) return "Exterior";
  if (Number.isFinite(n)) return `Room ${n}`;
  return "Room";
}

function getRoomsWithGalleryPhotos() {
  const rooms = [];
  for (const [nodeId, urls] of galleryIndexByNode.entries()) {
    if (!Array.isArray(urls) || urls.length === 0) continue;
    const nodeNum = Number(nodeId);
    if (!Number.isFinite(nodeNum) || nodeNum < 0) continue;
    const room = getRoomEntryForNodeId(nodeNum);
    const label = getGalleryLabelForNodeId(nodeNum, room?.entry || null);
    rooms.push({ nodeId: nodeNum, label });
  }

  rooms.sort((a, b) => a.nodeId - b.nodeId);
  return rooms;
}

function renderGalleryMenuItems() {
  if (!galleryMenu || !galleryMenuWrap || !galleryMenuToggle) return;

  const rooms = getRoomsWithGalleryPhotos();
  galleryMenu.innerHTML = "";

  if (!rooms.length) {
    galleryMenuWrap.hidden = true;
    closeGalleryMenu();
    return;
  }

  galleryMenuWrap.hidden = false;

  for (const room of rooms) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "galleryMenuItem";
    item.role = "menuitem";
    item.textContent = room.label;
    if (room.nodeId === currentGallerySourceNodeId) item.classList.add("isActive");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyGalleryForNodeId(room.nodeId, { defer: false });
      closeGalleryMenu();
    });
    galleryMenu.appendChild(item);
  }
}

function ensureGalleryMenuHandlers() {
  if (galleryMenuBound) return;
  if (!galleryMenuWrap || !galleryMenuToggle || !galleryMenu) return;
  galleryMenuBound = true;

  galleryMenuToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    renderGalleryMenuItems();
    setGalleryMenuOpen(!galleryMenuOpen);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!galleryMenuOpen) return;
    const target = event.target;
    if (galleryMenuWrap && target instanceof Node && galleryMenuWrap.contains(target)) return;
    closeGalleryMenu();
  });
}

function renderPageGalleryList() {
  if (!galleryPageList) return;
  const rooms = getRoomsWithGalleryPhotos();
  galleryPageList.innerHTML = "";

  if (!rooms.length) {
    const empty = document.createElement("p");
    empty.className = "pageGalleryListEmpty";
    empty.textContent = "No gallery rooms with photos.";
    galleryPageList.appendChild(empty);
    scheduleGalleryPageScrollIndicatorSync();
    return;
  }

  for (const room of rooms) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "pageGalleryListItem";
    item.textContent = room.label;
    item.setAttribute("aria-label", `Show ${room.label} gallery`);
    if (room.nodeId === currentGallerySourceNodeId) item.classList.add("isActive");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      applyGalleryForNodeId(room.nodeId, { defer: false });
    });
    galleryPageList.appendChild(item);
  }

  scheduleGalleryPageScrollIndicatorSync();
}

function getGalleryAssetAlt(label, index) {
  return `${label} photo ${index + 1}`;
}

function getGalleryGridLayoutClasses(classPrefix) {
  return [
    `${classPrefix}--0`,
    `${classPrefix}--1`,
    `${classPrefix}--2`,
    `${classPrefix}--3`,
    `${classPrefix}--4`
  ];
}

function ensureGalleryRenderCacheEntry(cacheKey, label, items) {
  let entry = galleryRenderCache.get(cacheKey);
  if (entry) return entry;

  entry = {
    key: cacheKey,
    label,
    items,
    sidebarCells: [],
    pageCells: []
  };

  const createCells = (cellClass) =>
    items.map((asset, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = cellClass;
      cell.setAttribute("aria-label", `Expand ${label} photo ${index + 1}`);

      const img = document.createElement("img");
      img.alt = getGalleryAssetAlt(label, index);
      img.loading = "lazy";
      img.decoding = "async";
      img.setAttribute("fetchpriority", "low");
      img.dataset.galleryLoadTier = items.length === 1 ? "full" : "thumb";
      img.width = asset.width || GALLERY_DEFAULT_IMAGE_WIDTH;
      img.height = asset.height || GALLERY_DEFAULT_IMAGE_HEIGHT;
      const aspectRatio = `${img.width} / ${img.height}`;
      cell.style.aspectRatio = aspectRatio;
      img.style.aspectRatio = aspectRatio;
      img._galleryAsset = asset;
      cell.appendChild(img);
      observeGalleryThumb(img);

      cell.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPinnedGalleryPreview(entry, index);
      });

      return cell;
    });

  entry.sidebarCells = createCells("galleryCell");
  entry.pageCells = createCells("pageGalleryGridCell");
  galleryRenderCache.set(cacheKey, entry);
  return entry;
}

function mountGalleryGrid(gridEl, classPrefix, cells) {
  if (!gridEl) return;
  const count = Array.isArray(cells) ? cells.length : 0;
  gridEl.classList.remove(...getGalleryGridLayoutClasses(classPrefix));
  gridEl.classList.add(`${classPrefix}--${count}`);
  gridEl.replaceChildren(...(Array.isArray(cells) ? cells : []));
}

function removeGalleryPreview(force = false) {
  if (galleryPreviewTimer) {
    clearTimeout(galleryPreviewTimer);
    galleryPreviewTimer = null;
  }
  if (galleryPreviewPinned && !force) return;
  if (!galleryPreviewEl) return;
  galleryPreviewEl.remove();
  galleryPreviewEl = null;
  galleryPreviewPinned = false;
  galleryPreviewState = null;
}

function prefetchGalleryPreviewNeighbors(items, activeIndex) {
  if (!Array.isArray(items) || !items.length) return;
  requestIdleWork(() => {
    const prev = items[activeIndex - 1];
    const next = items[activeIndex + 1];
    if (prev) warmGalleryAssetOriginal(prev);
    if (next) warmGalleryAssetOriginal(next);
  }, 600);
}

function syncGalleryPreviewNav(previewState) {
  if (!previewState) return;
  const count = previewState.items.length;
  const hasMultiple = count > 1;
  if (previewState.prevBtn) previewState.prevBtn.hidden = !hasMultiple;
  if (previewState.nextBtn) previewState.nextBtn.hidden = !hasMultiple;
}

function renderGalleryPreviewSlide(previewState, nextIndex) {
  if (!previewState || !Array.isArray(previewState.items) || !previewState.items.length) return;
  const count = previewState.items.length;
  const index = ((nextIndex % count) + count) % count;
  const asset = previewState.items[index];
  if (!asset) return;

  previewState.index = index;
  previewState.frame.classList.add("isLoading");
  previewState.image.removeAttribute("src");
  previewState.image.alt = getGalleryAssetAlt(previewState.label, index);
  previewState.wrap.dataset.src = asset.original || asset.full || asset.thumb || asset.key;
  previewState.wrap.dataset.index = String(index);

  warmGalleryAssetOriginal(asset).then((url) => {
    if (!galleryPreviewState || galleryPreviewState !== previewState) return;
    if (galleryPreviewState.index !== index || !url) return;
    previewState.image.src = url;
    previewState.frame.classList.remove("isLoading");
  });

  prefetchGalleryPreviewNeighbors(previewState.items, index);
  syncGalleryPreviewNav(previewState);
}

function showGalleryPreview(cacheEntry, startIndex = 0, opts = {}) {
  const pinned = Boolean(opts.pinned);
  if (!cacheEntry || !Array.isArray(cacheEntry.items) || !cacheEntry.items.length) return;
  removeGalleryPreview(true);

  const wrap = document.createElement("div");
  wrap.className = "galleryPreview";
  if (pinned) wrap.classList.add("isPinned");

  const frame = document.createElement("div");
  frame.className = "galleryPreviewFrame";

  const img = document.createElement("img");
  img.decoding = "async";

  if (pinned) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "galleryPreviewClose";
    closeBtn.setAttribute("aria-label", "Close expanded image");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeGalleryPreview(true);
    });
    frame.appendChild(closeBtn);

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "galleryPreviewNav galleryPreviewNav--prev";
    prevBtn.setAttribute("aria-label", "Show previous image");
    prevBtn.textContent = "‹";
    prevBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!galleryPreviewState) return;
      renderGalleryPreviewSlide(galleryPreviewState, galleryPreviewState.index - 1);
    });
    frame.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "galleryPreviewNav galleryPreviewNav--next";
    nextBtn.setAttribute("aria-label", "Show next image");
    nextBtn.textContent = "›";
    nextBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!galleryPreviewState) return;
      renderGalleryPreviewSlide(galleryPreviewState, galleryPreviewState.index + 1);
    });
    frame.appendChild(nextBtn);

    wrap.addEventListener("click", (event) => {
      event.preventDefault();
      removeGalleryPreview(true);
    });

    frame.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    galleryPreviewState = {
      key: cacheEntry.key,
      label: cacheEntry.label,
      items: cacheEntry.items,
      index: startIndex,
      wrap,
      frame,
      image: img,
      prevBtn,
      nextBtn
    };
  }

  frame.appendChild(img);
  wrap.appendChild(frame);
  document.body.appendChild(wrap);
  galleryPreviewEl = wrap;
  galleryPreviewPinned = pinned;
  if (galleryPreviewState) {
    renderGalleryPreviewSlide(galleryPreviewState, startIndex);
  }
}

function openPinnedGalleryPreview(cacheEntry, index = 0) {
  if (!cacheEntry || !cacheEntry.items?.length) return;
  if (galleryPreviewTimer) {
    clearTimeout(galleryPreviewTimer);
    galleryPreviewTimer = null;
  }
  const isSamePinned =
    galleryPreviewPinned &&
    galleryPreviewEl &&
    galleryPreviewState &&
    galleryPreviewState.key === cacheEntry.key &&
    galleryPreviewState.index === index;
  if (isSamePinned) {
    removeGalleryPreview(true);
    return;
  }
  showGalleryPreview(cacheEntry, index, { pinned: true });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    removeGalleryPreview(true);
    closeGalleryMenu();
    closeFloorplanLevelMenu();
    closeVideoModeMenus();
    return;
  }

  if (!galleryPreviewState || !galleryPreviewPinned) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    renderGalleryPreviewSlide(galleryPreviewState, galleryPreviewState.index - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    renderGalleryPreviewSlide(galleryPreviewState, galleryPreviewState.index + 1);
  }
});

// -----------------------------
// Floorplan SVG + pan/zoom
// -----------------------------
const fpState = {
  enabled: false,
  zoom: 1,
  minZoom: 1,
  maxZoom: 6.5,
  fitContentRatio: 0.95,
  isPanning: false,
  isPinching: false,
  startClientX: 0,
  startClientY: 0,
  startViewBoxX: 0,
  startViewBoxY: 0,
  sourceX: 0,
  sourceY: 0,
  sourceW: 0,
  sourceH: 0,
  fitX: 0,
  fitY: 0,
  fitW: 0,
  fitH: 0,
  viewBoxX: 0,
  viewBoxY: 0,
  viewBoxW: 0,
  viewBoxH: 0,
  svgEl: null,
  activeTouchPoints: new Map(),
  pinchStartDistance: 0,
  pinchStartZoom: 1,
  pinchAnchorWorldX: 0,
  pinchAnchorWorldY: 0,
  _listenersAttached: false
};
let floorplanInitRafId = 0;
let floorplanInitAttemptsRemaining = 0;
let floorplanTouchScrollLock = false;
let floorplanLoadRequestId = 0;
const floorplanMarkupCache = new Map();

setFpEnabled(false);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function setFloorplanTouchScrollLock(locked) {
  floorplanTouchScrollLock = Boolean(locked);
}

function cancelScheduledFloorplanInitRetry() {
  floorplanInitAttemptsRemaining = 0;
  if (floorplanInitRafId) {
    cancelAnimationFrame(floorplanInitRafId);
    floorplanInitRafId = 0;
  }
}

function scheduleFloorplanInitRetry(maxAttempts = 60) {
  floorplanInitAttemptsRemaining = Math.max(floorplanInitAttemptsRemaining, Number(maxAttempts) || 0);
  if (floorplanInitRafId) return;

  const tick = () => {
    floorplanInitRafId = 0;
    if (floorplanInitAttemptsRemaining <= 0) return;
    floorplanInitAttemptsRemaining -= 1;

    attachFloorplanPanZoomListenersOnce();
    const ready = initFloorplanPanZoomFromObject();
    if (ready) {
      cancelScheduledFloorplanInitRetry();
      return;
    }

    floorplanInitRafId = requestAnimationFrame(tick);
  };

  floorplanInitRafId = requestAnimationFrame(tick);
}

function syncFpSlider() {
  if (!floorplanZoom) return;

  // Slider maps to [minZoom..maxZoom] linearly, with a wider range for finer control.
  const sliderMax = Number(floorplanZoom.max) || 100;
  const t = (fpState.zoom - fpState.minZoom) / (fpState.maxZoom - fpState.minZoom || 1);
  const v = Math.round(clamp(t, 0, 1) * sliderMax);
  floorplanZoom.value = String(v);
  if (floorplanZoomValue) floorplanZoomValue.textContent = `${Math.round(fpState.zoom * 100)}%`;
}

function getFpViewportSize() {
  if (!floorplanViewport) return null;
  const rect = floorplanViewport.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;
  if (!(vw > 0 && vh > 0)) return null;
  return { vw, vh };
}

function applyFpViewBox() {
  if (!fpState.svgEl || !(fpState.viewBoxW > 0 && fpState.viewBoxH > 0)) return;
  fpState.svgEl.setAttribute(
    "viewBox",
    `${fpState.viewBoxX} ${fpState.viewBoxY} ${fpState.viewBoxW} ${fpState.viewBoxH}`
  );
}

function clampFpViewBoxPosition() {
  if (!(fpState.sourceW > 0 && fpState.sourceH > 0 && fpState.viewBoxW > 0 && fpState.viewBoxH > 0)) return;

  // Keep a small visible gap between floorplan edges and viewport edges at all times.
  const edgeMarginRatio = clamp((1 - fpState.fitContentRatio) / 2, 0, 0.45);

  const minX = fpState.sourceX - fpState.viewBoxW * edgeMarginRatio;
  const maxX = fpState.sourceX + fpState.sourceW - fpState.viewBoxW * (1 - edgeMarginRatio);
  if (maxX >= minX) {
    fpState.viewBoxX = clamp(fpState.viewBoxX, minX, maxX);
  } else {
    fpState.viewBoxX = fpState.sourceX + (fpState.sourceW - fpState.viewBoxW) / 2;
  }

  const minY = fpState.sourceY - fpState.viewBoxH * edgeMarginRatio;
  const maxY = fpState.sourceY + fpState.sourceH - fpState.viewBoxH * (1 - edgeMarginRatio);
  if (maxY >= minY) {
    fpState.viewBoxY = clamp(fpState.viewBoxY, minY, maxY);
  } else {
    fpState.viewBoxY = fpState.sourceY + (fpState.sourceH - fpState.viewBoxH) / 2;
  }
}

function setFpEnabled(enabled) {
  fpState.enabled = Boolean(enabled);
  if (!fpState.enabled) {
    fpState.isPanning = false;
    fpState.isPinching = false;
    fpState.activeTouchPoints.clear();
    fpState.svgEl = null;
    setFloorplanTouchScrollLock(false);
  }
  if (floorplanViewport) {
    floorplanViewport.style.cursor = fpState.enabled ? "grab" : "default";
    floorplanViewport.classList.toggle("isReady", fpState.enabled);
    floorplanViewport.classList.remove("isPanning");
  }
  if (floorplanZoom) floorplanZoom.disabled = !fpState.enabled;
  if (floorplanZoomIn) floorplanZoomIn.disabled = !fpState.enabled;
  if (floorplanZoomOut) floorplanZoomOut.disabled = !fpState.enabled;
}

function recalcFpFitViewBox() {
  if (!(fpState.sourceW > 0 && fpState.sourceH > 0)) return false;
  const size = getFpViewportSize();
  if (!size) return false;

  const { vw, vh } = size;
  const viewportAspect = vw / vh;
  const sourceAspect = fpState.sourceW / fpState.sourceH;

  if (viewportAspect > sourceAspect) {
    fpState.fitH = fpState.sourceH;
    fpState.fitW = fpState.fitH * viewportAspect;
    fpState.fitX = fpState.sourceX + (fpState.sourceW - fpState.fitW) / 2;
    fpState.fitY = fpState.sourceY;
  } else {
    fpState.fitW = fpState.sourceW;
    fpState.fitH = fpState.fitW / viewportAspect;
    fpState.fitX = fpState.sourceX;
    fpState.fitY = fpState.sourceY + (fpState.sourceH - fpState.fitH) / 2;
  }

  const contentRatio = clamp(fpState.fitContentRatio, 0.1, 1);
  if (contentRatio < 1) {
    const expandedW = fpState.fitW / contentRatio;
    const expandedH = fpState.fitH / contentRatio;
    fpState.fitX -= (expandedW - fpState.fitW) / 2;
    fpState.fitY -= (expandedH - fpState.fitH) / 2;
    fpState.fitW = expandedW;
    fpState.fitH = expandedH;
  }

  return fpState.fitW > 0 && fpState.fitH > 0;
}

function setFpZoom(nextZoom, opts = {}) {
  if (!fpState.svgEl) return;
  const size = getFpViewportSize();
  if (!size || !(fpState.fitW > 0 && fpState.fitH > 0)) return;

  const { anchorClientX, anchorClientY, anchorViewportX, anchorViewportY } = opts;
  const next = clamp(nextZoom, fpState.minZoom, fpState.maxZoom);
  const prev = fpState.zoom;

  if (next === prev && !opts.forceApply) return;

  let ax = null;
  let ay = null;
  const { vw, vh } = size;

  if (floorplanViewport && typeof anchorClientX === "number" && typeof anchorClientY === "number") {
    const rect = floorplanViewport.getBoundingClientRect();
    ax = anchorClientX - rect.left;
    ay = anchorClientY - rect.top;
  } else if (typeof anchorViewportX === "number" && typeof anchorViewportY === "number") {
    ax = anchorViewportX;
    ay = anchorViewportY;
  } else if (floorplanViewport) {
    ax = vw / 2;
    ay = vh / 2;
  }

  if (!(typeof ax === "number" && typeof ay === "number")) return;

  const anchorRatioX = clamp(ax / vw, 0, 1);
  const anchorRatioY = clamp(ay / vh, 0, 1);
  const anchorWorldX = fpState.viewBoxX + anchorRatioX * fpState.viewBoxW;
  const anchorWorldY = fpState.viewBoxY + anchorRatioY * fpState.viewBoxH;

  fpState.zoom = next;
  fpState.viewBoxW = fpState.fitW / fpState.zoom;
  fpState.viewBoxH = fpState.fitH / fpState.zoom;
  fpState.viewBoxX = anchorWorldX - anchorRatioX * fpState.viewBoxW;
  fpState.viewBoxY = anchorWorldY - anchorRatioY * fpState.viewBoxH;

  clampFpViewBoxPosition();
  applyFpViewBox();
  syncFpSlider();
}

function resetFpToFit() {
  if (!fpState.svgEl) return false;
  if (!recalcFpFitViewBox()) return false;

  fpState.minZoom = 1;
  fpState.maxZoom = 6.5;
  fpState.zoom = 1;
  fpState.viewBoxX = fpState.fitX;
  fpState.viewBoxY = fpState.fitY;
  fpState.viewBoxW = fpState.fitW;
  fpState.viewBoxH = fpState.fitH;
  clampFpViewBoxPosition();
  applyFpViewBox();
  syncFpSlider();
  return true;
}

function refitFloorplanAfterResize() {
  if (!fpState.enabled || !floorplanViewport || !fpState.svgEl) return;
  if (!(fpState.viewBoxW > 0 && fpState.viewBoxH > 0)) {
    resetFpToFit();
    return;
  }

  const centerWorldX = fpState.viewBoxX + fpState.viewBoxW / 2;
  const centerWorldY = fpState.viewBoxY + fpState.viewBoxH / 2;
  const prevZoom = clamp(fpState.zoom, fpState.minZoom, fpState.maxZoom);

  if (!recalcFpFitViewBox()) return;

  fpState.zoom = prevZoom;
  fpState.viewBoxW = fpState.fitW / fpState.zoom;
  fpState.viewBoxH = fpState.fitH / fpState.zoom;
  fpState.viewBoxX = centerWorldX - fpState.viewBoxW / 2;
  fpState.viewBoxY = centerWorldY - fpState.viewBoxH / 2;
  clampFpViewBoxPosition();
  applyFpViewBox();
  syncFpSlider();
}

function getFpActiveTouchPoints() {
  return Array.from(fpState.activeTouchPoints.values());
}

function getFpTouchDistance(points) {
  if (!Array.isArray(points) || points.length < 2) return 0;
  const [a, b] = points;
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function getFpTouchMidpoint(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const [a, b] = points;
  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2
  };
}

function syncFpPanStart(clientX, clientY) {
  fpState.isPanning = true;
  fpState.startClientX = clientX;
  fpState.startClientY = clientY;
  fpState.startViewBoxX = fpState.viewBoxX;
  fpState.startViewBoxY = fpState.viewBoxY;
  if (floorplanViewport) {
    floorplanViewport.style.cursor = "grabbing";
    floorplanViewport.classList.add("isPanning");
  }
}

function beginFpPinch() {
  const points = getFpActiveTouchPoints();
  if (points.length < 2 || !floorplanViewport) return;
  const midpoint = getFpTouchMidpoint(points);
  const distance = Math.max(getFpTouchDistance(points), 1);
  const rect = floorplanViewport.getBoundingClientRect();
  if (!midpoint || !(rect.width > 0 && rect.height > 0)) return;

  const anchorRatioX = clamp((midpoint.clientX - rect.left) / rect.width, 0, 1);
  const anchorRatioY = clamp((midpoint.clientY - rect.top) / rect.height, 0, 1);

  fpState.isPinching = true;
  fpState.isPanning = false;
  fpState.pinchStartDistance = distance;
  fpState.pinchStartZoom = fpState.zoom;
  fpState.pinchAnchorWorldX = fpState.viewBoxX + anchorRatioX * fpState.viewBoxW;
  fpState.pinchAnchorWorldY = fpState.viewBoxY + anchorRatioY * fpState.viewBoxH;
  floorplanViewport.classList.add("isPanning");
}

function updateFpPinch() {
  if (!fpState.enabled || !fpState.isPinching || !floorplanViewport) return;
  const points = getFpActiveTouchPoints();
  if (points.length < 2) return;

  const distance = Math.max(getFpTouchDistance(points), 1);
  const midpoint = getFpTouchMidpoint(points);
  const size = getFpViewportSize();
  const rect = floorplanViewport.getBoundingClientRect();
  if (!midpoint || !size || !(rect.width > 0 && rect.height > 0)) return;

  const nextZoom = clamp(
    fpState.pinchStartZoom * (distance / Math.max(fpState.pinchStartDistance, 1)),
    fpState.minZoom,
    fpState.maxZoom
  );
  const anchorRatioX = clamp((midpoint.clientX - rect.left) / size.vw, 0, 1);
  const anchorRatioY = clamp((midpoint.clientY - rect.top) / size.vh, 0, 1);

  fpState.zoom = nextZoom;
  fpState.viewBoxW = fpState.fitW / fpState.zoom;
  fpState.viewBoxH = fpState.fitH / fpState.zoom;
  fpState.viewBoxX = fpState.pinchAnchorWorldX - anchorRatioX * fpState.viewBoxW;
  fpState.viewBoxY = fpState.pinchAnchorWorldY - anchorRatioY * fpState.viewBoxH;
  clampFpViewBoxPosition();
  applyFpViewBox();
  syncFpSlider();
}

function endFpPinchAndMaybeResumePan() {
  fpState.isPinching = false;
  const points = getFpActiveTouchPoints();
  if (points.length === 1) {
    syncFpPanStart(points[0].clientX, points[0].clientY);
    return;
  }
  if (floorplanViewport) {
    floorplanViewport.classList.remove("isPanning");
    floorplanViewport.style.cursor = fpState.enabled ? "grab" : "default";
  }
}

function getFloorplanInlineSvg() {
  if (!floorplan) return null;
  return typeof floorplan.querySelector === "function" ? floorplan.querySelector("svg") : null;
}

function parseFloorplanSvgMarkup(markup) {
  if (typeof markup !== "string" || !markup.trim()) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, "image/svg+xml");
  if (doc.querySelector("parsererror")) return null;
  return doc.querySelector("svg");
}

async function fetchFloorplanSvgMarkup(url) {
  if (!url) return "";
  if (floorplanMarkupCache.has(url)) return floorplanMarkupCache.get(url);

  const res = await fetch(url, { cache: "no-store", mode: "cors" });
  if (!res.ok) throw new Error(`Failed to load floorplan: ${res.status}`);

  const markup = await res.text();
  floorplanMarkupCache.set(url, markup);
  return markup;
}

function prefetchFloorplanSvgMarkup(url) {
  if (!url || floorplanMarkupCache.has(url)) return;
  fetchFloorplanSvgMarkup(url).catch(() => {});
}

function mountInlineFloorplanSvg(svgSourceEl) {
  if (!floorplan || !svgSourceEl) return null;
  const mounted = document.importNode(svgSourceEl, true);
  mounted.setAttribute("width", "100%");
  mounted.setAttribute("height", "100%");
  mounted.setAttribute("preserveAspectRatio", "xMidYMid meet");
  floorplan.replaceChildren(mounted);
  return mounted;
}

function setFloorplanFallbackImage(url) {
  if (!floorplan) return;
  floorplan.replaceChildren();
  const img = document.createElement("img");
  img.className = "floorplanSvgFallback";
  img.src = url;
  img.alt = "Floor plan";
  img.decoding = "async";
  floorplan.appendChild(img);
}

function initFloorplanPanZoomFromObject() {
  if (!floorplanViewport || !floorplanContent || !floorplan) return false;

  const svg = getFloorplanInlineSvg();
  if (!svg) return false;

  // Keep drawing aspect while our outer viewBox window pans/zooms.
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // Read native SVG coordinate space from a persisted original viewBox so repeated
  // re-inits never treat a zoomed/panned viewBox as the new source bounds.
  const originalVbAttr = (svg.getAttribute("data-rtf-original-viewbox") || "").trim();
  let vb = null;
  if (originalVbAttr) {
    const parts = originalVbAttr.split(/[ ,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      vb = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
    }
  }

  if (!vb) {
    vb = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal : null;
  }
  if (!vb || !Number.isFinite(vb.width) || !Number.isFinite(vb.height) || vb.width <= 0 || vb.height <= 0) {
    const vbAttr = (svg.getAttribute("viewBox") || "").trim();
    const parts = vbAttr.split(/[ ,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      vb = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
    }
  }
  if (!vb || !Number.isFinite(vb.width) || !Number.isFinite(vb.height) || vb.width <= 0 || vb.height <= 0) {
    const widthAttr = Number.parseFloat(svg.getAttribute("width") || "");
    const heightAttr = Number.parseFloat(svg.getAttribute("height") || "");
    if (Number.isFinite(widthAttr) && Number.isFinite(heightAttr) && widthAttr > 0 && heightAttr > 0) {
      vb = { x: 0, y: 0, width: widthAttr, height: heightAttr };
    }
  }

  if (!vb || !Number.isFinite(vb.width) || !Number.isFinite(vb.height) || vb.width <= 0 || vb.height <= 0) {
    return false;
  }
  if (!originalVbAttr) {
    svg.setAttribute(
      "data-rtf-original-viewbox",
      `${Number.isFinite(vb.x) ? vb.x : 0} ${Number.isFinite(vb.y) ? vb.y : 0} ${vb.width} ${vb.height}`
    );
  }

  fpState.svgEl = svg;
  fpState.sourceX = Number.isFinite(vb.x) ? vb.x : 0;
  fpState.sourceY = Number.isFinite(vb.y) ? vb.y : 0;
  fpState.sourceW = vb.width;
  fpState.sourceH = vb.height;

  // Ensure the floorplan host is mounted under the viewport wrapper.
  if (floorplan.parentElement !== floorplanContent) {
    floorplanContent.innerHTML = "";
    floorplanContent.appendChild(floorplan);
  }

  floorplanContent.style.width = "100%";
  floorplanContent.style.height = "100%";
  floorplanContent.style.transform = "none";

  const fitApplied = resetFpToFit();
  if (!fitApplied) {
    setFpEnabled(false);
    // Keep a valid viewBox even before first measurable layout; a later refit will snap to bounds.
    fpState.minZoom = 1;
    fpState.maxZoom = 6.5;
    fpState.zoom = 1;
    fpState.viewBoxX = fpState.sourceX;
    fpState.viewBoxY = fpState.sourceY;
    fpState.viewBoxW = fpState.sourceW;
    fpState.viewBoxH = fpState.sourceH;
    applyFpViewBox();
    syncFpSlider();
    return false;
  }

  setFpEnabled(true);
  requestAnimationFrame(() => refitFloorplanAfterResize());
  return true;
}

function attachFloorplanPanZoomListenersOnce() {
  if (!floorplanViewport || fpState._listenersAttached) return;
  fpState._listenersAttached = true;

  const preventFloorplanTouchDefault = (event) => {
    if (!fpState.enabled) return;
    event.preventDefault();
  };

  floorplanViewport.addEventListener("touchstart", preventFloorplanTouchDefault, {
    passive: false
  });
  floorplanViewport.addEventListener("touchmove", preventFloorplanTouchDefault, {
    passive: false
  });
  floorplanViewport.addEventListener("touchend", preventFloorplanTouchDefault, {
    passive: false
  });
  floorplanViewport.addEventListener("touchcancel", preventFloorplanTouchDefault, {
    passive: false
  });

  // Wheel zoom
  floorplanViewport.addEventListener(
    "wheel",
    (e) => {
      if (!fpState.enabled) return;
      e.preventDefault();

      const delta = e.deltaY;
      const zoomFactor = Math.exp(-delta * 0.0018);
      setFpZoom(fpState.zoom * zoomFactor, {
        anchorClientX: e.clientX,
        anchorClientY: e.clientY
      });
    },
    { passive: false }
  );

  // Drag-to-pan
  floorplanViewport.addEventListener("pointerdown", (e) => {
    if (!fpState.enabled) return;
    if (e.pointerType === "touch") {
      setFloorplanTouchScrollLock(true);
      fpState.activeTouchPoints.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
      floorplanViewport.setPointerCapture?.(e.pointerId);
      if (fpState.activeTouchPoints.size >= 2) {
        beginFpPinch();
      } else {
        fpState.isPinching = false;
        syncFpPanStart(e.clientX, e.clientY);
      }
      return;
    }
    if (e.button !== 0) return;
    syncFpPanStart(e.clientX, e.clientY);
    floorplanViewport.setPointerCapture?.(e.pointerId);
  });

  floorplanViewport.addEventListener("pointermove", (e) => {
    if (!fpState.enabled) return;
    if (e.pointerType === "touch") {
      if (!fpState.activeTouchPoints.has(e.pointerId)) return;
      fpState.activeTouchPoints.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
      if (fpState.activeTouchPoints.size >= 2) {
        updateFpPinch();
        return;
      }
    }
    if (!fpState.isPanning || fpState.isPinching) return;
    const size = getFpViewportSize();
    if (!size) return;
    const dx = e.clientX - fpState.startClientX;
    const dy = e.clientY - fpState.startClientY;
    fpState.viewBoxX = fpState.startViewBoxX - dx * (fpState.viewBoxW / size.vw);
    fpState.viewBoxY = fpState.startViewBoxY - dy * (fpState.viewBoxH / size.vh);
    clampFpViewBoxPosition();
    applyFpViewBox();
  });

  const endPan = () => {
    if (!fpState.isPanning && !fpState.isPinching) return;
    fpState.isPanning = false;
    if (fpState.enabled) floorplanViewport.style.cursor = "grab";
    floorplanViewport.classList.remove("isPanning");
  };

  const endPointerInteraction = (e) => {
    if (e.pointerType === "touch") {
      fpState.activeTouchPoints.delete(e.pointerId);
      if (fpState.activeTouchPoints.size === 0) setFloorplanTouchScrollLock(false);
      if (fpState.activeTouchPoints.size >= 2) {
        beginFpPinch();
        return;
      }
      if (fpState.isPinching) {
        endFpPinchAndMaybeResumePan();
        return;
      }
      if (fpState.activeTouchPoints.size === 1) {
        const [touch] = getFpActiveTouchPoints();
        if (touch) {
          syncFpPanStart(touch.clientX, touch.clientY);
          return;
        }
      }
    }
    endPan();
  };

  floorplanViewport.addEventListener("pointerup", endPointerInteraction);
  floorplanViewport.addEventListener("pointercancel", endPointerInteraction);
  floorplanViewport.addEventListener("lostpointercapture", endPointerInteraction);
  floorplanViewport.addEventListener("dblclick", () => {
    if (!fpState.enabled) return;
    resetFpToFit();
  });

  // Slider zoom
  if (floorplanZoom) {
    // Ensure it behaves even if attributes weren't set in HTML
    floorplanZoom.min = "0";
    floorplanZoom.max = "200";
    floorplanZoom.step = "1";

    floorplanZoom.addEventListener("input", () => {
      if (!fpState.enabled) return;
      const sliderMax = Number(floorplanZoom.max) || 100;
      const t = clamp(Number(floorplanZoom.value) / sliderMax, 0, 1);
      const next = fpState.minZoom + t * (fpState.maxZoom - fpState.minZoom);
      const rect = floorplanViewport?.getBoundingClientRect();
      setFpZoom(next, {
        anchorViewportX: (rect?.width || 0) / 2,
        anchorViewportY: (rect?.height || 0) / 2
      });
    });
  }

  // +/- buttons
  if (floorplanZoomIn) {
    floorplanZoomIn.addEventListener("click", () => {
      if (!fpState.enabled) return;
      setFpZoom(fpState.zoom * 1.15);
    });
  }

  if (floorplanZoomOut) {
    floorplanZoomOut.addEventListener("click", () => {
      if (!fpState.enabled) return;
      setFpZoom(fpState.zoom / 1.15);
    });
  }

  // Re-fit on resize
  window.addEventListener("resize", () => {
    if (!fpState.enabled) return;
    refitFloorplanAfterResize();
  });

  const preventDocumentGesture = (event) => {
    if (!floorplanTouchScrollLock) return;
    event.preventDefault();
  };

  const preventDocumentTouchMove = (event) => {
    if (!floorplanTouchScrollLock) return;
    event.preventDefault();
  };

  document.addEventListener("touchmove", preventDocumentTouchMove, {
    passive: false,
    capture: true
  });
  document.addEventListener("gesturestart", preventDocumentGesture, { passive: false });
  document.addEventListener("gesturechange", preventDocumentGesture, { passive: false });
  document.addEventListener("gestureend", preventDocumentGesture, { passive: false });
}

// -----------------------------
// Floorplan switching (downstairs vs upstairs)
// -----------------------------
function normalizeFloorplanLevel(level) {
  return String(level || "").trim().toLowerCase() === "up" ? "up" : "down";
}

function getFloorplanLevelForNodeId(nodeId) {
  const n = Number(nodeId);
  if (!Number.isFinite(n)) return "down";
  return n >= 10 ? "up" : "down";
}

function resolveFloorplanForLevel(level) {
  const desiredLevel = normalizeFloorplanLevel(level);
  const fp = listing?.floorplans;
  const legacy = resolveListingAssetUrl(listing?.floorplan || "");

  // Back-compat: if floorplans object not present, fall back to single field
  if (!fp) return { url: legacy, level: desiredLevel };

  const downUrl = resolveListingAssetUrl(fp.down || "");
  const upUrl = resolveListingAssetUrl(fp.up || "");

  if (desiredLevel === "up") {
    if (upUrl) return { url: upUrl, level: "up" };
    if (downUrl) return { url: downUrl, level: "down" };
    return { url: legacy, level: "up" };
  }

  if (downUrl) return { url: downUrl, level: "down" };
  if (upUrl) return { url: upUrl, level: "up" };
  return { url: legacy, level: "down" };
}

function syncFloorplanLevelSelect(level) {
  const normalized = normalizeFloorplanLevel(level);
  const options = getFloorplanLevelOptions();
  const showToggle = options.length > 1;

  if (floorplanLevelLabel) floorplanLevelLabel.textContent = getFloorplanLevelLabel(normalized);
  if (sidebarFloorplanLevelLabel) {
    sidebarFloorplanLevelLabel.textContent = getFloorplanLevelLabel(normalized);
  }
  if (floorplanLevelMenuToggle) floorplanLevelMenuToggle.dataset.level = normalized;
  if (sidebarFloorplanLevelMenuToggle) {
    sidebarFloorplanLevelMenuToggle.dataset.level = normalized;
  }
  if (floorplanLevelMenuWrap) floorplanLevelMenuWrap.hidden = !showToggle;
  if (sidebarFloorplanLevelMenuWrap) sidebarFloorplanLevelMenuWrap.hidden = !showToggle;
  renderFloorplanLevelMenuItems(floorplanLevelMenu, normalized);
  renderFloorplanLevelMenuItems(sidebarFloorplanLevelMenu, normalized);
  if (!showToggle) closeFloorplanLevelMenu();
}

function applyFloorplanForLevel(level) {
  if (!floorplan || !listing) return;
  const resolved = resolveFloorplanForLevel(level);
  const url = resolved.url;
  syncFloorplanLevelSelect(resolved.level);
  if (!url) {
    cancelScheduledFloorplanInitRetry();
    setFpEnabled(false);
    return;
  }
  const current = floorplan.dataset.src || "";
  if (current === url && getFloorplanInlineSvg()) {
    if (!fpState.enabled || !fpState.svgEl) scheduleFloorplanInitRetry(60);
    return;
  }

  cancelScheduledFloorplanInitRetry();
  setFpEnabled(false);
  floorplan.dataset.src = url;
  floorplan.setAttribute("aria-busy", "true");
  floorplan.replaceChildren();

  const requestId = ++floorplanLoadRequestId;

  fetchFloorplanSvgMarkup(url)
    .then((markup) => {
      if (requestId !== floorplanLoadRequestId) return;
      const parsedSvg = parseFloorplanSvgMarkup(markup);
      if (!parsedSvg) throw new Error("Invalid SVG floorplan markup");
      mountInlineFloorplanSvg(parsedSvg);
      floorplan.removeAttribute("aria-busy");
      scheduleFloorplanInitRetry(90);
    })
    .catch((error) => {
      if (requestId !== floorplanLoadRequestId) return;
      console.error("[listing] Failed to initialize floorplan SVG", error);
      floorplan.removeAttribute("aria-busy");
      floorplanMarkupCache.delete(url);
      setFloorplanFallbackImage(url);
      setFpEnabled(false);
    });
}

function applyFloorplanForNodeId(nodeId) {
  const level = getFloorplanLevelForNodeId(nodeId);
  applyFloorplanForLevel(level);
}

// -----------------------------
// Gallery thumb/full loading
// -----------------------------
function getNodeGalleryImages(nodeId) {
  return galleryIndexByNode.get(Number(nodeId)) || [];
}

function loadGalleryUrlWithState(url, stateMap) {
  if (!url) return Promise.reject(new Error("Missing gallery asset URL"));

  const existing = stateMap.get(url);
  if (existing?.status === "loaded") return Promise.resolve(url);
  if (existing?.status === "loading" && existing.promise) return existing.promise;

  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";

  const promise = new Promise((resolve, reject) => {
    image.onload = () => {
      stateMap.set(url, {
        status: "loaded",
        image,
        promise: null,
        width: image.naturalWidth || 0,
        height: image.naturalHeight || 0
      });
      resolve(url);
    };
    image.onerror = () => {
      stateMap.set(url, { status: "error", image: null, promise: null });
      reject(new Error(`Failed to load ${url}`));
    };
  });

  stateMap.set(url, { status: "loading", image, promise });
  image.src = url;
  return promise;
}

function loadGalleryAssetCandidates(candidates, stateMap) {
  const queue = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  if (!queue.length) return Promise.reject(new Error("No gallery candidates"));

  let index = 0;
  const tryNext = () => {
    if (index >= queue.length) return Promise.reject(new Error("All gallery candidates failed"));
    const url = queue[index++];
    return loadGalleryUrlWithState(url, stateMap).catch(() => tryNext());
  };

  return tryNext();
}

function warmGalleryAssetThumb(asset) {
  if (!asset) return Promise.resolve("");
  if (asset.resolvedThumbUrl) return Promise.resolve(asset.resolvedThumbUrl);
  for (const url of asset.thumbCandidates) {
    const cached = galleryThumbLoadState.get(url);
    if (cached?.status === "loaded") {
      asset.resolvedThumbUrl = url;
      if (cached.width > 0 && cached.height > 0) {
        asset.width = cached.width;
        asset.height = cached.height;
      }
      return Promise.resolve(url);
    }
  }
  if (asset.thumbLoadPromise) return asset.thumbLoadPromise;

  asset.thumbLoadPromise = loadGalleryAssetCandidates(asset.thumbCandidates, galleryThumbLoadState)
    .then((url) => {
      asset.resolvedThumbUrl = url;
      asset.thumbLoadPromise = null;
      return url;
    })
    .catch(() => {
      asset.thumbLoadPromise = null;
      return "";
    });

  return asset.thumbLoadPromise;
}

function warmGalleryAssetFull(asset) {
  if (!asset) return Promise.resolve("");
  if (asset.resolvedFullUrl) return Promise.resolve(asset.resolvedFullUrl);
  for (const url of asset.fullCandidates) {
    const cached = galleryFullLoadState.get(url);
    if (cached?.status === "loaded") {
      asset.resolvedFullUrl = url;
      if (cached.width > 0 && cached.height > 0 && (!asset.width || !asset.height)) {
        asset.width = cached.width;
        asset.height = cached.height;
      }
      return Promise.resolve(url);
    }
  }
  if (asset.fullLoadPromise) return asset.fullLoadPromise;

  asset.fullLoadPromise = loadGalleryAssetCandidates(asset.fullCandidates, galleryFullLoadState)
    .then((url) => {
      asset.resolvedFullUrl = url;
      asset.fullLoadPromise = null;
      return url;
    })
    .catch(() => {
      asset.fullLoadPromise = null;
      return "";
    });

  return asset.fullLoadPromise;
}

function warmGalleryAssetOriginal(asset) {
  if (!asset) return Promise.resolve("");
  if (asset.resolvedOriginalUrl) return Promise.resolve(asset.resolvedOriginalUrl);
  for (const url of asset.originalCandidates) {
    const cached = galleryOriginalLoadState.get(url);
    if (cached?.status === "loaded") {
      asset.resolvedOriginalUrl = url;
      if (cached.width > 0 && cached.height > 0 && (!asset.width || !asset.height)) {
        asset.width = cached.width;
        asset.height = cached.height;
      }
      return Promise.resolve(url);
    }
  }
  if (asset.originalLoadPromise) return asset.originalLoadPromise;

  asset.originalLoadPromise = loadGalleryAssetCandidates(asset.originalCandidates, galleryOriginalLoadState)
    .then((url) => {
      asset.resolvedOriginalUrl = url;
      asset.originalLoadPromise = null;
      return url;
    })
    .catch(() => {
      asset.originalLoadPromise = null;
      return "";
    });

  return asset.originalLoadPromise;
}

function applyGalleryElementDimensions(imgEl, asset, width, height) {
  const normalizedWidth = Number(width);
  const normalizedHeight = Number(height);
  if (!Number.isFinite(normalizedWidth) || !Number.isFinite(normalizedHeight)) return;
  if (normalizedWidth <= 0 || normalizedHeight <= 0) return;

  asset.width = normalizedWidth;
  asset.height = normalizedHeight;
  imgEl.width = normalizedWidth;
  imgEl.height = normalizedHeight;
  const aspectRatio = `${normalizedWidth} / ${normalizedHeight}`;
  imgEl.style.aspectRatio = aspectRatio;

  const cell = imgEl.parentElement;
  if (cell instanceof HTMLElement) {
    cell.style.aspectRatio = aspectRatio;
  }
}

function loadThumbIntoElement(imgEl, asset, candidateIndex = 0) {
  const loadTier = imgEl.dataset.galleryLoadTier === "full" ? "full" : "thumb";
  const stateMap = loadTier === "full" ? galleryFullLoadState : galleryThumbLoadState;
  const resolvedUrl = loadTier === "full" ? asset.resolvedFullUrl : asset.resolvedThumbUrl;
  const tierCandidates = loadTier === "full" ? asset.fullCandidates : asset.thumbCandidates;
  const candidates = resolvedUrl
    ? [resolvedUrl, ...tierCandidates.filter((url) => url !== resolvedUrl)]
    : tierCandidates;
  const url = candidates[candidateIndex];
  if (!url) {
    imgEl.dataset.galleryThumbHydrated = "error";
    return;
  }

  const existing = stateMap.get(url);
  if (existing?.status === "loaded") {
    if (loadTier === "full") asset.resolvedFullUrl = url;
    else asset.resolvedThumbUrl = url;
    applyGalleryElementDimensions(
      imgEl,
      asset,
      existing.width || existing.image?.naturalWidth,
      existing.height || existing.image?.naturalHeight
    );
    imgEl.src = url;
    imgEl.dataset.galleryThumbHydrated = "true";
    imgEl.classList.add("isLoaded");
    return;
  }

  const handleLoad = () => {
    imgEl.removeEventListener("error", handleError);
    if (loadTier === "full") asset.resolvedFullUrl = url;
    else asset.resolvedThumbUrl = url;
    const width = imgEl.naturalWidth || asset.width || GALLERY_DEFAULT_IMAGE_WIDTH;
    const height = imgEl.naturalHeight || asset.height || GALLERY_DEFAULT_IMAGE_HEIGHT;
    applyGalleryElementDimensions(imgEl, asset, width, height);
    stateMap.set(url, { status: "loaded", image: null, promise: null, width, height });
    imgEl.dataset.galleryThumbHydrated = "true";
    imgEl.classList.add("isLoaded");
  };

  const handleError = () => {
    imgEl.removeEventListener("load", handleLoad);
    stateMap.set(url, { status: "error", image: null, promise: null });
    loadThumbIntoElement(imgEl, asset, candidateIndex + 1);
  };

  stateMap.set(url, { status: "loading", image: null, promise: null });
  imgEl.addEventListener("load", handleLoad, { once: true });
  imgEl.addEventListener("error", handleError, { once: true });
  imgEl.src = url;
}

function hydrateGalleryThumb(imgEl) {
  if (!(imgEl instanceof HTMLImageElement)) return;
  if (imgEl.dataset.galleryThumbHydrated === "true") return;
  const asset = imgEl._galleryAsset;
  if (!asset) return;

  imgEl.dataset.galleryThumbHydrated = "loading";
  loadThumbIntoElement(imgEl, asset);
}

function ensureGalleryThumbObserver() {
  if (galleryThumbObserver || typeof IntersectionObserver === "undefined") return;
  galleryThumbObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target;
        galleryThumbObserver.unobserve(target);
        hydrateGalleryThumb(target);
      }
    },
    {
      rootMargin: GALLERY_THUMB_ROOT_MARGIN,
      threshold: 0.01
    }
  );
}

function observeGalleryThumb(imgEl) {
  if (!(imgEl instanceof HTMLImageElement)) return;
  ensureGalleryThumbObserver();
  if (!galleryThumbObserver) {
    hydrateGalleryThumb(imgEl);
    return;
  }
  galleryThumbObserver.observe(imgEl);
}

function requestIdleWork(callback, timeout = 900) {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(callback, { timeout });
  }
  return window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 240);
}

function cancelIdleWork(handle) {
  if (!handle) return;
  if (typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(handle);
    return;
  }
  window.clearTimeout(handle);
}

function hasGalleryPhotosForNode(nodeId) {
  return getNodeGalleryImages(nodeId).length > 0;
}

function getGalleryAliasNodeId(nodeId) {
  const direct = galleryAliasByNode.get(Number(nodeId));
  return Number.isFinite(direct) && direct >= 0 ? direct : null;
}

function applyExteriorGallery(opts = {}) {
  if (hasGalleryPhotosForNode(EXTERIOR_GALLERY_NODE_ID)) {
    applyGalleryForNodeId(EXTERIOR_GALLERY_NODE_ID, opts);
    return true;
  }
  if (hasGalleryPhotosForNode(0)) {
    applyGalleryForNodeId(0, opts);
    return true;
  }
  return false;
}

function findGalleryFallbackForNode(nodeId) {
  const current = Number(nodeId);
  if (!Number.isFinite(current) || current < 0) {
    return { sourceNodeId: 0, urls: [] };
  }

  for (let n = current; n >= 0; n--) {
    const urls = getNodeGalleryImages(n);
    if (urls.length) return { sourceNodeId: n, urls };

    const aliasNodeId = getGalleryAliasNodeId(n);
    if (Number.isFinite(aliasNodeId) && aliasNodeId >= 0) {
      const aliasUrls = getNodeGalleryImages(aliasNodeId);
      if (aliasUrls.length) return { sourceNodeId: aliasNodeId, urls: aliasUrls };
    }
  }

  return { sourceNodeId: current, urls: [] };
}

function getSortedNodeIds() {
  const fromListing = Object.keys(listing?.nodeToRoomKey || listing?.roomsById || {})
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n) && n >= 0);

  const fromGalleries = Array.from(galleryIndexByNode.keys()).filter(
    (n) => Number.isFinite(n) && n >= 0
  );
  const fromAliases = Array.from(galleryAliasByNode.keys()).filter(
    (n) => Number.isFinite(n) && n >= 0
  );

  return Array.from(new Set([...fromListing, ...fromGalleries, ...fromAliases])).sort(
    (a, b) => a - b
  );
}

function getInitialTourNodeId() {
  const fromListing = Object.keys(listing?.nodeToRoomKey || listing?.roomsById || {})
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .sort((a, b) => a - b);
  if (fromListing.length) return fromListing[0];

  const fromGalleries = getSortedNodeIds().filter((n) => n !== EXTERIOR_GALLERY_NODE_ID);
  return fromGalleries[0] || null;
}

function getRoomEntryForNodeId(nodeId) {
  if (!listing) return null;

  // Long-term format: nodeToRoomKey + roomsByKey
  const nodeKeyMap = listing.nodeToRoomKey;
  const roomsByKey = listing.roomsByKey;
  if (nodeKeyMap && roomsByKey) {
    const roomKey = nodeKeyMap[String(nodeId)];
    const entry = roomKey ? roomsByKey[String(roomKey)] : null;
    if (entry) {
      return { entry, resolvedKey: `roomKey:${String(roomKey)}` };
    }
  }

  // Back-compat format: roomsById keyed directly by nodeId
  const roomsById = listing.roomsById || {};
  const entry = roomsById[String(nodeId)];
  if (entry) {
    return { entry, resolvedKey: `nodeId:${String(nodeId)}` };
  }

  return null;
}

function prefetchNearbyNodeThumbsWhenIdle(currentNodeId, ahead = 1) {
  if (!listing) return;
  cancelIdleWork(galleryIdlePrefetchHandle);

  galleryIdlePrefetchHandle = requestIdleWork(() => {
    const ids = getSortedNodeIds();
    const cur = Number(currentNodeId);
    const idx = ids.indexOf(cur);
    if (idx === -1) return;

    for (let step = 1; step <= ahead; step++) {
      const id = ids[idx + step];
      if (!Number.isFinite(id)) continue;
      const items = getNodeGalleryImages(id);
      for (const asset of items) warmGalleryAssetThumb(asset);
    }
  });
}

async function loadListing(listingId) {
  currentListingId = normalizeLookupValue(listingId) || DEFAULT_LISTING_ID;
  const res = await fetch(`/listings/${currentListingId}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Listing not found: ${currentListingId}`);
  listing = await res.json();
  const runtimeGalleryState = buildRuntimeGalleryState(listing);
  galleryIndexByNode = runtimeGalleryState.index;
  galleryLabelsByNode = runtimeGalleryState.labels;
  galleryAliasByNode = runtimeGalleryState.aliases;
  listingVideoSources = buildRuntimeVideoSources(listing);

  cancelDeferredGalleryApply();
  galleryDeferredApplyRequestId += 1;
  removeGalleryPreview(true);
  galleryRenderCache.clear();
  galleryThumbLoadState.clear();
  galleryFullLoadState.clear();
  galleryOriginalLoadState.clear();
  lastAppliedKey = null;
  cancelIdleWork(galleryIdlePrefetchHandle);
  galleryIdlePrefetchHandle = 0;

  // Preload both floorplans (if provided) so switching is instant
  if (listing?.floorplans?.down) prefetchFloorplanSvgMarkup(resolveListingAssetUrl(listing.floorplans.down));
  if (listing?.floorplans?.up) prefetchFloorplanSvgMarkup(resolveListingAssetUrl(listing.floorplans.up));
  syncFloorplanLevelSelect("down");

  propTitle.textContent = listing.title || currentListingId;
  if (infoPropTitle) infoPropTitle.textContent = listing.title || currentListingId;

  if (propAddress) {
    propAddress.textContent = listing.addressLine || "";
  }
  if (infoAddress) infoAddress.textContent = listing.addressLine || "";

  // Stats (data-driven): "beds", "baths", "sqft"
  const beds = Number(listing?.beds);
  const baths = Number(listing?.baths);
  const sqft = Number(listing?.sqft);

  if (bedsVal) bedsVal.textContent = Number.isFinite(beds) ? String(beds) : "–";
  if (bathsVal) bathsVal.textContent = Number.isFinite(baths) ? String(baths) : "–";
  if (sqftVal) sqftVal.textContent = Number.isFinite(sqft) ? sqft.toLocaleString() : "–";
  if (infoBedsVal) infoBedsVal.textContent = Number.isFinite(beds) ? String(beds) : "–";
  if (infoBathsVal) infoBathsVal.textContent = Number.isFinite(baths) ? String(baths) : "–";
  if (infoSqftVal) infoSqftVal.textContent = Number.isFinite(sqft) ? sqft.toLocaleString() : "–";

  // Summary (marketing blurb)
  if (propSummary) propSummary.textContent = (listing.summary || "").toString();
  if (infoPropSummary) infoPropSummary.textContent = (listing.summary || "").toString();
  renderHoverBlurb(listing?.hoverBlurb);
  renderInfoBlurb(listing?.hoverBlurb);

  // Populate sidebar drone panel and full-page Videos tab from listing JSON.
  renderDroneVideos(listing?.drone?.videos);

  // Embed player with parentOrigin so postMessage targetOrigin matches
  const parentOrigin = window.location.origin;
  const tourUrl = new URL(listing.tourUrl);
  tourUrl.searchParams.set("parentOrigin", parentOrigin);
  // Best-effort background hints for embed providers that support URL theming.
  tourUrl.searchParams.set("bgColor", "#2e1a47");
  tourUrl.searchParams.set("backgroundColor", "#2e1a47");

  // Forward debug flag from the listing page to the player (append ?debug=1 to listing URL to enable)
  const debug = params.get("debug") === "1";
  if (debug) tourUrl.searchParams.set("debug", "1");

  if (tourFrame) {
    tourFrame.setAttribute("scrolling", "no");
    tourFrame.src = tourUrl.toString();
    if (debug) console.log("[listing] iframe src:", tourFrame.src);
  }

  ensureTourFrameScaleHandlers();

  // Default gallery before the tour/node initializes: exterior set.
  // Floorplan should still initialize immediately to the default first level.
  const initialNodeId = getInitialTourNodeId();
  const hasExterior = applyExteriorGallery({ defer: false });
  tourStartedBySignal = !hasExterior;
  tourInteractionObserved = !hasExterior;
  galleryStartupLockedToExterior = hasExterior;
  lastPlayerGalleryNodeId = null;
  lastPlayerFloorplanNodeId = null;
  pendingInteriorGalleryNodeId = null;
  pendingInteriorFloorplanNodeId = null;
  if (!hasExterior && initialNodeId) applyGalleryForNodeId(initialNodeId, { defer: false });

  // Always render an initial floorplan on first load (downstairs/first floor by default),
  // then let node-change messages switch the level as the tour progresses.
  applyFloorplanForLevel("down");
  attachFloorplanPanZoomListenersOnce();

  ensureGalleryMenuHandlers();
  ensureGalleryPageScrollIndicatorHandlers();
  ensureInfoBlurbScrollIndicatorHandlers();
  ensureFloorplanLevelMenuHandlers();
  ensureVideoModeMenuHandlers();
  ensureTourInteractionUnlockHandlers();
  renderGalleryMenuItems();
  renderPageGalleryList();
  setTopTab(activeTopTab);
}

function renderSidebarGallery(cacheEntry) {
  if (!gallery || !galleryTitle) return;
  galleryTitle.textContent = cacheEntry?.label || "Gallery";
  mountGalleryGrid(gallery, "gallery", cacheEntry?.sidebarCells || []);
}

function renderFullPageGallery(cacheEntry) {
  if (!galleryPageGrid) return;
  mountGalleryGrid(galleryPageGrid, "pageGalleryGrid", cacheEntry?.pageCells || []);
}

function cancelDeferredGalleryApply() {
  if (galleryDeferredApplyRafId) {
    cancelAnimationFrame(galleryDeferredApplyRafId);
    galleryDeferredApplyRafId = 0;
  }
  if (galleryDeferredApplyTimerId) {
    clearTimeout(galleryDeferredApplyTimerId);
    galleryDeferredApplyTimerId = 0;
  }
}

function commitGalleryForNodeId(nodeId) {
  if (!listing) return;

  const fallback = findGalleryFallbackForNode(nodeId);
  const sourceNodeId = fallback.sourceNodeId;
  const sourceItems = fallback.urls;
  const currentRoom = getRoomEntryForNodeId(nodeId);
  const sourceRoom = getRoomEntryForNodeId(sourceNodeId);
  const entry = sourceRoom?.entry || currentRoom?.entry || null;
  const resolvedKey = `galleryNode:${sourceNodeId}`;
  currentGallerySourceNodeId = sourceNodeId;

  const label = getGalleryLabelForNodeId(sourceNodeId || nodeId, entry);
  renderGalleryMenuItems();
  renderPageGalleryList();

  // Dedupe expensive DOM/grid updates by resolved gallery identity.
  if (resolvedKey === lastAppliedKey) return;
  lastAppliedKey = resolvedKey;

  const items = Array.isArray(sourceItems) ? sourceItems.slice(0, 4) : [];
  const cacheEntry = ensureGalleryRenderCacheEntry(resolvedKey, label, items);
  removeGalleryPreview(true);
  renderSidebarGallery(cacheEntry);
  renderFullPageGallery(cacheEntry);
  prefetchNearbyNodeThumbsWhenIdle(Number(nodeId), 1);
}

function applyGalleryForNodeId(nodeId, opts = {}) {
  if (!listing) return;
  const shouldDefer = Boolean(opts.defer);
  if (!shouldDefer) {
    cancelDeferredGalleryApply();
    commitGalleryForNodeId(nodeId);
    return;
  }

  const requestId = ++galleryDeferredApplyRequestId;
  cancelDeferredGalleryApply();
  galleryDeferredApplyRafId = requestAnimationFrame(() => {
    galleryDeferredApplyRafId = 0;
    galleryDeferredApplyTimerId = window.setTimeout(() => {
      galleryDeferredApplyTimerId = 0;
      if (requestId !== galleryDeferredApplyRequestId) return;
      commitGalleryForNodeId(nodeId);
    }, GALLERY_DEFERRED_APPLY_MS);
  });
}

// Back-compat wrapper (older codepaths may still call this)
function applyGalleryById(roomId) {
  applyGalleryForNodeId(Number(roomId), { defer: false });
}

// 3) Listen for messages from the player iframe
function normalizePlayerMode(modeValue) {
  if (typeof modeValue !== "string") return "";
  const mode = modeValue.trim().toLowerCase();
  if (!mode) return "";
  if (mode.includes("dollhouse")) return "dollhouse";
  if (
    mode.includes("interior") ||
    mode.includes("inside") ||
    mode.includes("first_person") ||
    mode.includes("pano360") ||
    mode.includes("pano")
  ) {
    return "interior";
  }
  return "";
}

function getPlayerModeFromMessage(data) {
  const candidates = [
    data?.mode,
    data?.viewMode,
    data?.playerMode,
    data?.state,
    data?.value,
    data?.payload?.mode,
    data?.payload?.viewMode,
    data?.detail?.mode,
    data?.detail?.viewMode
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

window.addEventListener("message", (event) => {
  const allowedOrigins = new Set([
    "https://realtour.rtfmediasolutions.com",
    "http://localhost:5174",
    "http://localhost:5173"
  ]);
  if (!allowedOrigins.has(event.origin)) return;

  const debug = params.get("debug") === "1";
  if (debug) console.log("[listing] message received", { origin: event.origin, data: event.data });

  const data = event.data;
  if (!data || typeof data !== "object") return;

  const type = String(data.type || "");

  if (type === "RTF_TOUR_STARTED") {
    tourStartedBySignal = true;
    tourInteractionObserved = true;
    unlockStartupExteriorGallery();
    return;
  }

  if (type === "RTF_TOUR_STATE") {
    const started =
      data?.started === true ||
      data?.value === true ||
      String(data?.state || "").trim().toLowerCase() === "started" ||
      data?.payload?.started === true ||
      String(data?.payload?.state || "").trim().toLowerCase() === "started";
    if (started) {
      tourStartedBySignal = true;
      tourInteractionObserved = true;
      unlockStartupExteriorGallery();
      return;
    }
  }

  if (type === "RTF_NODE_CHANGE") {
    const galleryNodeId = getGalleryNodeIdFromMessage(data);
    const floorplanNodeId = getFloorplanNodeIdFromMessage(data);
    if (!Number.isFinite(galleryNodeId) && !Number.isFinite(floorplanNodeId)) return;
    if (Number.isFinite(galleryNodeId) && galleryNodeId >= 0) lastPlayerGalleryNodeId = galleryNodeId;
    if (Number.isFinite(floorplanNodeId) && floorplanNodeId >= 0) {
      lastPlayerFloorplanNodeId = floorplanNodeId;
    }
    playerViewMode = "interior";

    if (galleryNodeId === 0) {
      startupExteriorNodeZeroActivatedAt = Date.now();
    } else if (
      startupExteriorNodeZeroActivatedAt &&
      Date.now() - startupExteriorNodeZeroActivatedAt < 2000
    ) {
      startupExteriorNodeZeroActivatedAt = 0;
      if (Number.isFinite(floorplanNodeId) && floorplanNodeId >= 0) {
        applyFloorplanForNodeId(floorplanNodeId);
      }
      return;
    } else if (galleryNodeId > 0) {
      startupExteriorNodeZeroActivatedAt = 0;
    }

    // Keep exterior state locked until explicit tour-start signal.
    if (galleryStartupLockedToExterior && !tourStartedBySignal) {
      pendingInteriorGalleryNodeId = Number.isFinite(galleryNodeId) ? galleryNodeId : null;
      pendingInteriorFloorplanNodeId = Number.isFinite(floorplanNodeId) ? floorplanNodeId : null;
      return;
    }

    // Keep user on the current sidebar page; only update player-dependent content.
    if (galleryStartupLockedToExterior) {
      pendingInteriorGalleryNodeId = Number.isFinite(galleryNodeId) ? galleryNodeId : null;
      pendingInteriorFloorplanNodeId = Number.isFinite(floorplanNodeId) ? floorplanNodeId : null;
      unlockStartupExteriorGallery();
      return;
    }

    if (Number.isFinite(galleryNodeId) && galleryNodeId >= 0) {
      applyGalleryForNodeId(galleryNodeId, { defer: true });
    }
    if (Number.isFinite(floorplanNodeId) && floorplanNodeId >= 0) {
      applyFloorplanForNodeId(floorplanNodeId);
    }
    return;
  }

  if (type === "RTF_VIEW_MODE_CHANGE" || type === "RTF_MODE_CHANGE") {
    const mode = normalizePlayerMode(getPlayerModeFromMessage(data));
    if (!mode) return;
    playerViewMode = mode;

    if (mode === "dollhouse") {
      applyExteriorGallery({ defer: true });
      return;
    }

    if (
      mode === "interior" &&
      (Number.isFinite(lastPlayerGalleryNodeId) || Number.isFinite(lastPlayerFloorplanNodeId))
    ) {
      if (galleryStartupLockedToExterior && !tourStartedBySignal) {
        pendingInteriorGalleryNodeId = Number.isFinite(lastPlayerGalleryNodeId)
          ? lastPlayerGalleryNodeId
          : null;
        pendingInteriorFloorplanNodeId = Number.isFinite(lastPlayerFloorplanNodeId)
          ? lastPlayerFloorplanNodeId
          : null;
        return;
      }

      if (galleryStartupLockedToExterior) {
        pendingInteriorGalleryNodeId = Number.isFinite(lastPlayerGalleryNodeId)
          ? lastPlayerGalleryNodeId
          : null;
        pendingInteriorFloorplanNodeId = Number.isFinite(lastPlayerFloorplanNodeId)
          ? lastPlayerFloorplanNodeId
          : null;
        unlockStartupExteriorGallery();
      } else {
        if (Number.isFinite(lastPlayerGalleryNodeId) && lastPlayerGalleryNodeId >= 0) {
          applyGalleryForNodeId(lastPlayerGalleryNodeId, { defer: true });
        }
        if (Number.isFinite(lastPlayerFloorplanNodeId) && lastPlayerFloorplanNodeId >= 0) {
          applyFloorplanForNodeId(lastPlayerFloorplanNodeId);
        }
      }
    }
  }
});

resolveCurrentListingId()
  .then((listingId) => loadListing(listingId))
  .catch((e) => {
    console.error(e);
    propTitle.textContent = "Failed to load listing";
    if (infoPropTitle) infoPropTitle.textContent = "Failed to load listing";
    if (propAddress) propAddress.textContent = "";
    if (infoAddress) infoAddress.textContent = "";
    if (propSummary) propSummary.textContent = String(e?.message || e);
    if (infoPropSummary) infoPropSummary.textContent = String(e?.message || e);
    if (propHoverBlurb) propHoverBlurb.innerHTML = "";
    if (infoBlurbContent) infoBlurbContent.innerHTML = "";

    if (bedsVal) bedsVal.textContent = "–";
    if (bathsVal) bathsVal.textContent = "–";
    if (sqftVal) sqftVal.textContent = "–";
    if (infoBedsVal) infoBedsVal.textContent = "–";
    if (infoBathsVal) infoBathsVal.textContent = "–";
    if (infoSqftVal) infoSqftVal.textContent = "–";
  });
