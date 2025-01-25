import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from '../utils/mail.service';

@Processor('mail')
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process('sendMail')
  async handleSendMail(job: Job<{ to: string; subject: string; text: string }>) {
    const { to, subject, text } = job.data;
    await this.mailService.sendMail(to, subject, text);
  }
}