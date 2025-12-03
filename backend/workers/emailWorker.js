require("dotenv").config();
const { Worker } = require("bullmq");
const sendEmail = require("../utils/sendEmail");   // tái dùng util gửi mail

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao hàng",
  delivered: "Đã giao thành công",
};

new Worker(
  "userQueue",
  async (job) => {
    console.log("[WORKER] Nhận job:", job.name);

    if (job.name === "order_confirmation") {
      const {
        email,
        name,
        phone,
        address,
        orderId,
        status,
        subtotal,
        shippingFee,
        tax,
        discountAmount,
        loyaltyDiscountAmount,
        total,
        loyaltyPointsEarned,
        items,
      } = job.data;

      // Build HTML cho từng dòng sản phẩm
      const orderItemsHtml = (items || [])
        .map(
          (i) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;">
                ${i.variantName || "Sản phẩm"}
              </td>
              <td style="padding:8px;text-align:center;border-bottom:1px solid #eee;">
                ${i.quantity}
              </td>
              <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;">
                ${Number(i.lineTotal || 0).toLocaleString("vi-VN")} ₫
              </td>
            </tr>
          `
        )
        .join("");

      const shortCode = orderId.slice(-6).toUpperCase();
      const statusLabel = STATUS_LABELS[status] || status;

      const html = `
        <div style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;padding:20px;box-shadow:0 4px 10px rgba(0,0,0,0.05)">
            
            <h2 style="color:#111827;text-align:center;margin-bottom:10px;">
              ✅ Đơn hàng của bạn đã được tạo thành công
            </h2>

            <p style="text-align:center;color:#6b7280;margin-top:0;">
              Cảm ơn bạn đã mua sắm tại <strong>E-Shop</strong>!
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

            <p><strong>Mã đơn:</strong> #${shortCode}</p>
            <p><strong>Khách hàng:</strong> ${name}</p>
            <p><strong>SĐT:</strong> ${phone}</p>
            <p><strong>Địa chỉ:</strong> ${address}</p>

            <p><strong>Trạng thái hiện tại:</strong>
              <span style="
                padding:4px 10px;
                border-radius:20px;
                background:#fef3c7;
                color:#92400e;
                font-weight:600;
              ">
                ${statusLabel}
              </span>
            </p>

            <h3 style="margin-top:20px;">📦 Chi tiết sản phẩm</h3>

            <table width="100%" style="border-collapse:collapse;font-size:14px;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:8px;text-align:left;">Sản phẩm</th>
                  <th style="padding:8px;text-align:center;">SL</th>
                  <th style="padding:8px;text-align:right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>

            <h3 style="margin-top:20px;">💰 Thanh toán</h3>
            <p>Tạm tính: ${Number(subtotal || 0).toLocaleString("vi-VN")} ₫</p>
            <p>Phí ship: ${Number(shippingFee || 0).toLocaleString("vi-VN")} ₫</p>
            <p>Thuế: ${Number(tax || 0).toLocaleString("vi-VN")} ₫</p>
            <p>Giảm giá: -${Number(discountAmount || 0).toLocaleString("vi-VN")} ₫</p>
            <p>Giảm bằng điểm: -${Number(loyaltyDiscountAmount || 0).toLocaleString("vi-VN")} ₫</p>

            <h2 style="color:#dc2626;">
              Tổng thanh toán: ${Number(total || 0).toLocaleString("vi-VN")} ₫
            </h2>

            <p>🎁 Điểm tích lũy từ đơn này: <strong>${loyaltyPointsEarned || 0} điểm</strong></p>

            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

            <p style="font-size:12px;color:#6b7280;text-align:center;">
              Nếu bạn có thắc mắc, vui lòng liên hệ CSKH qua hotline hoặc trả lời email này.
              <br/>
              &copy; ${new Date().getFullYear()} E-Shop. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: `🧾 Xác nhận đơn hàng #${shortCode}`,
        html,
      });

      console.log(`[WORKER] Đã gửi email xác nhận đơn ${shortCode} tới ${email}`);
    } else {
      console.log("[WORKER] Job không hỗ trợ:", job.name);
    }
  },
  { connection }
);

console.log("Worker đang lắng nghe hàng đợi userQueue cho email đơn hàng...");
