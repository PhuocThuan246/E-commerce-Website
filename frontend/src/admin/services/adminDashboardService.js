import api from "../../services/api";

const adminDashboardService = {
  getSimple: () => api.get("/admin/dashboard/simple"),
  getAdvanced: (params) => api.get("/admin/dashboard/advanced", { params })
};

export default adminDashboardService;
