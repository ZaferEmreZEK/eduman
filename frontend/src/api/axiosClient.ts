import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://localhost:7096/api",
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// 401 durumlarında oturum açma sayfasına yönlendir
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      // Not: Router bağlamı yok; basit yönlendirme
      if (typeof window !== "undefined") window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
