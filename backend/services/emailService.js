import nodemailer from "nodemailer";

let cachedTransporter;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

const isEmailConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM,
  );
};

const formatMoney = (value) => Number(value || 0).toFixed(2);

const buildTextBody = ({
  customerName,
  orderId,
  bakeryName,
  createdAt,
  items,
  totalPrice,
}) => {
  const lines = [
    `Hi ${customerName || "Customer"},`,
    "",
    "Your order has been placed successfully.",
    `Order ID: ${orderId}`,
    `Bakery: ${bakeryName || "N/A"}`,
    `Placed At: ${createdAt}`,
    "",
    "Order Items:",
  ];

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.productName} | qty: ${item.quantity} | line total: ${formatMoney(item.finalPrice)}`,
    );

    if (item.selectedOptions?.length) {
      item.selectedOptions.forEach((option) => {
        const layerInfo = option.layer ? ` | layer ${option.layer}` : "";
        lines.push(
          `   - ${option.optionName}: ${option.choiceName}${layerInfo}`,
        );
      });
    }
  });

  lines.push(
    "",
    `Total: ${formatMoney(totalPrice)}`,
    "",
    "Thank you for ordering.",
  );

  return lines.join("\n");
};

const buildHtmlBody = ({
  customerName,
  orderId,
  bakeryName,
  createdAt,
  items,
  totalPrice,
}) => {
  const itemRows = items
    .map((item) => {
      const selectedOptions = (item.selectedOptions || [])
        .map((option) => {
          const layerInfo = option.layer ? ` (Layer ${option.layer})` : "";
          return `<li>${option.optionName}: ${option.choiceName}${layerInfo}</li>`;
        })
        .join("");

      return `
        <li>
          <strong>${item.productName}</strong><br/>
          Quantity: ${item.quantity}<br/>
          Line Total: ${formatMoney(item.finalPrice)}
          ${selectedOptions ? `<ul>${selectedOptions}</ul>` : ""}
        </li>
      `;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <p>Hi ${customerName || "Customer"},</p>
      <p>Your order has been placed successfully.</p>
      <p>
        <strong>Order ID:</strong> ${orderId}<br/>
        <strong>Bakery:</strong> ${bakeryName || "N/A"}<br/>
        <strong>Placed At:</strong> ${createdAt}
      </p>
      <p><strong>Order Items:</strong></p>
      <ol>${itemRows}</ol>
      <p><strong>Total:</strong> ${formatMoney(totalPrice)}</p>
      <p>Thank you for ordering.</p>
    </div>
  `;
};

const buildApprovalTextBody = ({ ownerName, bakeryName }) => {
  const lines = [
    `Hi ${ownerName || "Bakery Owner"},`,
    "",
    `Your bakery application for ${bakeryName || "your bakery"} has been approved.`,
    "You can now log in and access your bakery owner dashboard.",
    "",
    "Thank you for joining our marketplace.",
  ];

  return lines.join("\n");
};

const buildRejectionTextBody = ({ ownerName, bakeryName }) => {
  const lines = [
    `Hi ${ownerName || "Bakery Owner"},`,
    "",
    `Your bakery application for ${bakeryName || "your bakery"} was not approved at this time.`,
    "If you have questions or want to reapply, please contact support.",
    "",
    "Thank you for your interest.",
  ];

  return lines.join("\n");
};

export const sendOrderConfirmationEmail = async ({
  to,
  customerName,
  orderId,
  bakeryName,
  createdAt,
  items,
  totalPrice,
}) => {
  if (!to) {
    return { sent: false, reason: "missing-recipient" };
  }

  if (!isEmailConfigured()) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  const transporter = getTransporter();

  const subject = `Order Confirmation #${orderId}`;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text: buildTextBody({
        customerName,
        orderId,
        bakeryName,
        createdAt,
        items,
        totalPrice,
      }),
      html: buildHtmlBody({
        customerName,
        orderId,
        bakeryName,
        createdAt,
        items,
        totalPrice,
      }),
    });

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
};

export const sendBakeryApprovalEmail = async ({ to, ownerName, bakeryName }) => {
  if (!to) {
    return { sent: false, reason: "missing-recipient" };
  }

  if (!isEmailConfigured()) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  const transporter = getTransporter();
  const subject = "Bakery application approved";

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text: buildApprovalTextBody({ ownerName, bakeryName }),
    });

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
};

export const sendBakeryRejectionEmail = async ({ to, ownerName, bakeryName }) => {
  if (!to) {
    return { sent: false, reason: "missing-recipient" };
  }

  if (!isEmailConfigured()) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  const transporter = getTransporter();
  const subject = "Bakery application update";

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text: buildRejectionTextBody({ ownerName, bakeryName }),
    });

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
};
