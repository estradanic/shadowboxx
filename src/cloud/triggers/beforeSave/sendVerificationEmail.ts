import { createTransport } from "nodemailer";

/** Function to send verification email when email changes */
const sendVerificationEmail = async (user: Parse.User) => {
  const config = await new Parse.Query("Config").first({ useMasterKey: true });
  if (!config?.get("zohoPassword")) {
    console.error("Failed to send verification email: no Zoho password");
    throw new Parse.Error(500, "Failed to send verification email");
  }

  const transport = createTransport({
    host: "smtppro.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "admin@shadowboxx.app",
      pass: config.get("zohoPassword"),
    },
  });

  const code = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  user.set("verificationCode", code);

  if (user.isNew()) {
    user.set("email", user.getUsername());
  } else {
    const oldUser = await new Parse.Query(Parse.User).get(user.id, {
      useMasterKey: true,
    });
    user.set("oldEmail", oldUser.get("email"));
  }

  const mailOptions = {
    from: '"Shadowboxx Admin" <admin@shadowboxx.app>',
    to: user.get("email"),
    subject: "Shadowboxx Email Verification",
    text: `Hi ${user.get("firstName")}, your verification code is ${code}`,
    html: `<p>Hi ${user.get(
      "firstName"
    )}, your verification code is ${code}</p>`,
  };

  transport.sendMail(mailOptions, (e, i) => {
    if (e) {
      console.error("Failed to send verification email", e);
      throw new Parse.Error(500, "Failed to send verification email");
    }
    console.log(
      "Verification email sent to user",
      user.get("email"),
      i.messageId,
      i.response
    );
  });
};

export default sendVerificationEmail;
