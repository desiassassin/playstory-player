const app_url = import.meta.env.VITE_APP_app_url || "https://localhost:3000";
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:3001";
const VIDEO_SERVER_URL = import.meta.env.VITE_APP_VIDEO_SERVER_URL || "https://videos.playstory.io";
const WASABI_STORAGE = import.meta.env.VITE_APP_WASABI_STORAGE || "https://videos.playstory.io";

export { BASE_URL, VIDEO_SERVER_URL, app_url, WASABI_STORAGE };