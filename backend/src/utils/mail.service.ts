import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Puedes usar otro servicio como 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // Tu correo electrónico
        pass: process.env.EMAIL_PASSWORD, // Tu contraseña de aplicación (no la de tu correo)
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${to}`);
    } catch (error) {
      console.error('Error enviando el correo:', error);
      throw new Error('Error enviando el correo');
    }
  }

  async sendMailQueue(to: string, subject: string, text: string): Promise<void> {
    await this.mailQueue.add('sendMail', { to, subject, text });
  }
}