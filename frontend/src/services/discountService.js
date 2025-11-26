import api from "./api";

// ==============================
// Service kiểm tra mã giảm giá
//   - gọi POST /api/discounts/validate
// ==============================
const discountService = {
  validate: (code, subtotal) =>
    api.post("/discounts/validate", { code, subtotal }),
};

export default discountService;
