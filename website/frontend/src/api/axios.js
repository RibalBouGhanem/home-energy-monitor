import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000"
});

function formatDateTime(value) {
  if (!value) return "";

  const d = new Date(value);

  // Example: 01 Jan 2026, 19:19
  return d.toLocaleString("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const formatObject = (obj) => {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    // normalize common timestamp fields
    if (key.toLowerCase().includes("time") || key.toLowerCase().includes("date")) {
      if (obj[key]) {
        obj[key] = formatDateTime(obj[key]);
      }
    }
    if (typeof obj[key] === "object") {
      formatObject(obj[key]);
    }
  });
};

// format timestamps immediately on receive
api.interceptors.response.use((response) => {

  const data = response.data;

  if (Array.isArray(data)) {
    data.forEach(formatObject);
  } else if (typeof data === "object") {
    formatObject(data);
  }

  return response;
});

api.interceptors.response.use((response) => {
  const data = response.data;

  if (Array.isArray(data)) {
    data.forEach(formatObject);
  } else if (typeof data === "object") {
    formatObject(data);
  }

  return response;
});

export default api;