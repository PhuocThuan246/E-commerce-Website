import api from "./api";

function getSessionId() {
  let id = localStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
  }
  return id;
}

const orderService = {
  getOrders: () => {
    const token = localStorage.getItem("token");
    return api.get("/orders", {
      headers: {
        "x-session-id": getSessionId(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },

  createOrder: (payload) => {
    const token = localStorage.getItem("token");
    return api.post("/orders", payload, {
      headers: {
        "x-session-id": getSessionId(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};

export default orderService;
