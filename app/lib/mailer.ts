import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface RoleInfo {
  name: string;
  desc: string;
}

export async function sendTeamInviteEmail({
  toEmail,
  toName,
  role,
  tempPassword,
  loginUrl,
}: {
  toEmail: string;
  toName: string;
  role: RoleInfo;
  tempPassword: string;
  loginUrl: string;
}) {
  const html = `
  <div style="font-family: -apple-system, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="margin-bottom: 4px;">Welcome to the Jerovin team, ${toName}</h2>
    <p style="color: #4b5563; margin-top: 0;">You've been added as a team member on the Jerovin admin panel.</p>

    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px; font-weight: 600;">Your role: ${role.name}</p>
      <p style="margin: 0; color: #4b5563; font-size: 14px;">${role.desc}</p>
    </div>

    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px; font-size: 14px; color: #4b5563;">Login email</p>
      <p style="margin: 0 0 14px; font-weight: 600;">${toEmail}</p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #4b5563;">Temporary password</p>
      <p style="margin: 0; font-weight: 600; font-family: monospace;">${tempPassword}</p>
    </div>

    <a href="${loginUrl}" style="display: inline-block; background: #111827; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; margin: 8px 0 24px;">Log in to Jerovin Admin</a>

    <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
      Please change your password after your first login. Based on your role, your access is limited to: <strong>${role.desc}</strong>. If anything looks incorrect or you weren't expecting this invite, contact your administrator.
    </p>

    <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">— Jerovin Admin Team</p>
  </div>`;

  return transporter.sendMail({
    from: `"Jerovin Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `You've been added to the Jerovin team as ${role.name}`,
    html,
  });
}

export async function sendPasswordResetEmail({
  toEmail,
  code,
}: {
  toEmail: string;
  code: string;
}) {
  const html = `
  <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="margin-bottom: 4px;">Reset your Jerovin password</h2>
    <p style="color: #4b5563; margin-top: 0;">Use the code below to set a new password. This code expires in 15 minutes.</p>
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">${code}</p>
    </div>
    <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">— Jerovin</p>
  </div>`;

  return transporter.sendMail({
    from: `"Jerovin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your Jerovin password reset code",
    html,
  });
}
