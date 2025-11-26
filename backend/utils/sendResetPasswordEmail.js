const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"E-Shop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🔐 Khôi phục mật khẩu - E-Shop",
    html: `
      <div style="background:#f4f6fb;padding:40px 0;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.08);overflow:hidden;">
          
          <!-- HEADER -->
          <div style="background:linear-gradient(90deg,#2563eb,#1d4ed8);padding:20px;text-align:center;color:white;">
            <h2 style="margin:0;">E-Shop</h2>
            <p style="margin:5px 0 0;">Khôi phục mật khẩu</p>
          </div>

          <!-- BODY -->
          <div style="padding:30px;color:#1f2937;">
            <p style="font-size:16px;">Xin chào <strong>${name}</strong>,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại <b>E-Shop</b>.</p>

            <p style="margin-top:15px;">Mã xác thực OTP của bạn là:</p>

            <div style="text-align:center;margin:25px 0;">
              <div style="
                display:inline-block;
                background:#eff6ff;
                color:#2563eb;
                font-size:32px;
                letter-spacing:8px;
                font-weight:bold;
                padding:15px 30px;
                border-radius:10px;
                border:2px dashed #2563eb;
              ">
                ${otp}
              </div>
            </div>

            <p style="font-size:14px;color:#6b7280;">
              Mã có hiệu lực trong <b>5 phút</b>.  
              Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
            </p>

            <hr style="margin:25px 0;border:none;border-top:1px solid #e5e7eb" />

            <p style="font-size:13px;color:#9ca3af;">
              Trân trọng,<br/>
              Đội ngũ <b>E-Shop</b>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = sendResetPasswordEmail;
