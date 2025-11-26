const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html }) {
  // 👉 LOG ENV MỖI LẦN GỬI
  console.log("ENV SMTP_USER =", process.env.SMTP_USER);
  console.log("ENV SMTP_PASS exist =", !!process.env.SMTP_PASS);

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error("❌ [MAIL] Thiếu SMTP_USER hoặc SMTP_PASS trong env!");
    return;
  }

  // Tạo transporter NGAY TRONG HÀM, dùng host + port
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // 587 -> false
    auth: { user, pass },
  });

  try {
    console.log("📧 [MAIL] Đang gửi tới:", to);

    const info = await transporter.sendMail({
      from: `"E-Shop" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("✅ [MAIL] Gửi thành công, id:", info.messageId);
  } catch (err) {
    console.error("❌ [MAIL] Gửi email thất bại:", err);
  }
}

module.exports = sendEmail;
