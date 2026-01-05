import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // IMPORTANT
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify(); // 👈 THIS WILL THROW REAL ERROR

  await transporter.sendMail({
    from: `"The Archive Liferoom" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
