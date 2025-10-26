import api from "./api";

function getSessionId() {
  let id = localStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
  }
  return id;
}

const cartService = {
  getCart: () =>
    api.get(`/cart?_=${Date.now()}`, {
      headers: { "x-session-id": getSessionId() },
    }),

  addItem: (productId, quantity = 1, variantId = null) =>
    api.post(
      "/cart",
      { productId, quantity, variantId },
      { headers: { "x-session-id": getSessionId() } }
    ),

  updateQuantity: (itemId, quantity) =>
    api.put(
      `/cart/${itemId}`,
      { quantity },
      { headers: { "x-session-id": getSessionId() } }
    ),

  removeItem: (itemId) =>
    api.delete(`/cart/${itemId}`, {
      headers: { "x-session-id": getSessionId() },
    }),

  clearCart: () =>
    api.delete("/cart", { headers: { "x-session-id": getSessionId() } }),
};

export default cartService;
