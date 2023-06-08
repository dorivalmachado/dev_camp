import {createTransport} from "nodemailer"
import "dotenv/config"
import { ISendEmail } from "../interfaces/utils.interface"

const sendEmail = async (options: ISendEmail): Promise<void> => {
    const host: string = process.env.SMTP_HOST || ""
    const port: number = Number(process.env.SMTP_PORT) || 2525
    const user: string = process.env.SMTP_USERNAME || ""
    const pass: string = process.env.SMTP_PASSWORD || ""

    if(!host || !port || !user || !pass){
        throw new Error("Missing SMTP credentials")
    }

  let transporter = createTransport({
    host,
    port,
    auth: {
      user,
      pass
    },
  });

  const fromEmail: string = process.env.FROM_EMAIL || ""
  const fromName: string = process.env.FROM_NAME || ""
  const  message = {
    from: `${fromEmail} <${fromName}>`, 
    to: options.email, 
    subject: options.subject, 
    text: options.message, 
  };

  const info = await transporter.sendMail(message)
  console.log("Message sent: %s", info.messageId);

}

export {sendEmail}