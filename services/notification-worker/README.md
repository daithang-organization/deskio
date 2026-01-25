# Notification Worker

Background worker service xử lý email notifications cho Deskio platform.

## Mục đích

Notification Worker là background service chịu trách nhiệm:

- Listen to notification events từ message queue (Redis/BullMQ)
- Gửi email notifications cho users
- Email template rendering
- Retry logic cho failed emails
- Email delivery tracking và logging

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Queue:** BullMQ + Redis
- **Email:** Nodemailer (SMTP)
- **Template Engine:** Handlebars
- **Logging:** Winston/Pino
- **Testing:** Jest

## Features

### 1. Email Notifications

- Ticket created (to customer)
- Ticket replied (to customer/agent)
- Ticket assigned (to agent)
- Ticket status changed
- Welcome email (new user registration)
- Password reset email
- Email verification

### 2. Queue Processing

- Listen to multiple event types
- Concurrent job processing
- Retry failed jobs
- Dead letter queue
- Job prioritization

### 3. Template System

- Dynamic email templates (Handlebars)
- Template variables injection
- Multi-language support (future)
- HTML + plain text versions

### 4. Delivery Tracking

- Log email sent status
- Track delivery failures
- Retry configuration
- Bounce handling (future)

## Project Structure

```
notification-worker/
├── src/
│   ├── main.ts                         # Worker entry point
│   ├── app.module.ts
│   ├── processors/
│   │   ├── notification.processor.ts   # Main queue processor
│   │   └── email.processor.ts          # Email-specific processing
│   ├── services/
│   │   ├── email.service.ts            # Nodemailer integration
│   │   ├── template.service.ts         # Template rendering
│   │   └── logger.service.ts           # Logging
│   ├── templates/                      # Email templates
│   │   ├── ticket-created.hbs
│   │   ├── ticket-replied.hbs
│   │   ├── ticket-assigned.hbs
│   │   ├── ticket-status-changed.hbs
│   │   ├── welcome.hbs
│   │   ├── password-reset.hbs
│   │   ├── email-verification.hbs
│   │   ├── partials/
│   │   │   ├── header.hbs
│   │   │   ├── footer.hbs
│   │   │   └── button.hbs
│   │   └── layouts/
│   │       └── default.hbs
│   ├── config/
│   │   └── configuration.ts
│   └── types/
│       └── events.types.ts
├── test/
├── .env.example
└── package.json
```

## Event Types

### ticket.created

```typescript
{
  type: 'ticket.created',
  data: {
    ticketId: 'uuid',
    customerId: 'uuid',
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    title: 'Cannot login',
    description: 'I cannot log into my account',
    ticketUrl: 'https://portal.deskio.com/tickets/uuid'
  }
}
```

### ticket.replied

```typescript
{
  type: 'ticket.replied',
  data: {
    ticketId: 'uuid',
    replyId: 'uuid',
    recipientEmail: 'customer@example.com',
    recipientName: 'John Doe',
    ticketTitle: 'Cannot login',
    replyContent: 'Thank you for contacting us...',
    authorName: 'Jane Agent',
    ticketUrl: 'https://portal.deskio.com/tickets/uuid'
  }
}
```

### ticket.assigned

```typescript
{
  type: 'ticket.assigned',
  data: {
    ticketId: 'uuid',
    agentId: 'uuid',
    agentEmail: 'agent@example.com',
    agentName: 'Jane Agent',
    ticketTitle: 'Cannot login',
    customerName: 'John Doe',
    priority: 'HIGH',
    ticketUrl: 'https://console.deskio.com/tickets/uuid'
  }
}
```

### ticket.status_changed

```typescript
{
  type: 'ticket.status_changed',
  data: {
    ticketId: 'uuid',
    recipientEmail: 'customer@example.com',
    recipientName: 'John Doe',
    ticketTitle: 'Cannot login',
    oldStatus: 'OPEN',
    newStatus: 'RESOLVED',
    ticketUrl: 'https://portal.deskio.com/tickets/uuid'
  }
}
```

### user.registered

```typescript
{
  type: 'user.registered',
  data: {
    userId: 'uuid',
    email: 'newuser@example.com',
    name: 'New User',
    verificationToken: 'token',
    verificationUrl: 'https://portal.deskio.com/verify?token=token'
  }
}
```

### user.password_reset

```typescript
{
  type: 'user.password_reset',
  data: {
    userId: 'uuid',
    email: 'user@example.com',
    name: 'John Doe',
    resetToken: 'token',
    resetUrl: 'https://portal.deskio.com/reset-password?token=token',
    expiresIn: '1 hour'
  }
}
```

## Environment Variables

```env
# Node
NODE_ENV=development

# Redis (Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Defaults
EMAIL_FROM=Deskio Support <noreply@deskio.com>
EMAIL_REPLY_TO=support@deskio.com

# App URLs
CUSTOMER_PORTAL_URL=http://localhost:3100
AGENT_CONSOLE_URL=http://localhost:3200
ADMIN_CONSOLE_URL=http://localhost:3300

# Queue Configuration
QUEUE_NAME=notifications
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3

# Logging
LOG_LEVEL=info
```

## Development

### Setup & Run

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build
pnpm build

# Start production
pnpm start:prod
```

### Testing

```bash
# Unit tests
pnpm test

# Test with specific queue event
pnpm test:event ticket.created
```

## Implementation Examples

### Main Processor

```typescript
// src/processors/notification.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { TemplateService } from '../services/template.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private emailService: EmailService,
    private templateService: TemplateService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'ticket.created':
          return await this.handleTicketCreated(job.data);

        case 'ticket.replied':
          return await this.handleTicketReplied(job.data);

        case 'ticket.assigned':
          return await this.handleTicketAssigned(job.data);

        case 'ticket.status_changed':
          return await this.handleTicketStatusChanged(job.data);

        case 'user.registered':
          return await this.handleUserRegistered(job.data);

        case 'user.password_reset':
          return await this.handlePasswordReset(job.data);

        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
          return;
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}:`, error);
      throw error; // Re-throw to trigger retry
    }
  }

  private async handleTicketCreated(data: any) {
    const html = await this.templateService.render('ticket-created', {
      customerName: data.customerName,
      ticketTitle: data.title,
      ticketDescription: data.description,
      ticketUrl: data.ticketUrl,
      ticketId: data.ticketId,
    });

    await this.emailService.send({
      to: data.customerEmail,
      subject: `Ticket Created: ${data.title}`,
      html,
    });

    this.logger.log(`Sent ticket created email to ${data.customerEmail}`);
  }

  private async handleTicketReplied(data: any) {
    const html = await this.templateService.render('ticket-replied', {
      recipientName: data.recipientName,
      ticketTitle: data.ticketTitle,
      replyContent: data.replyContent,
      authorName: data.authorName,
      ticketUrl: data.ticketUrl,
    });

    await this.emailService.send({
      to: data.recipientEmail,
      subject: `New Reply: ${data.ticketTitle}`,
      html,
    });

    this.logger.log(`Sent reply notification to ${data.recipientEmail}`);
  }

  private async handleTicketAssigned(data: any) {
    const html = await this.templateService.render('ticket-assigned', {
      agentName: data.agentName,
      ticketTitle: data.ticketTitle,
      customerName: data.customerName,
      priority: data.priority,
      ticketUrl: data.ticketUrl,
    });

    await this.emailService.send({
      to: data.agentEmail,
      subject: `Ticket Assigned: ${data.ticketTitle}`,
      html,
    });

    this.logger.log(`Sent assignment notification to ${data.agentEmail}`);
  }

  private async handleTicketStatusChanged(data: any) {
    const html = await this.templateService.render('ticket-status-changed', {
      recipientName: data.recipientName,
      ticketTitle: data.ticketTitle,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      ticketUrl: data.ticketUrl,
    });

    await this.emailService.send({
      to: data.recipientEmail,
      subject: `Ticket ${data.newStatus}: ${data.ticketTitle}`,
      html,
    });

    this.logger.log(`Sent status change notification to ${data.recipientEmail}`);
  }

  private async handleUserRegistered(data: any) {
    const html = await this.templateService.render('welcome', {
      name: data.name,
      verificationUrl: data.verificationUrl,
    });

    await this.emailService.send({
      to: data.email,
      subject: 'Welcome to Deskio!',
      html,
    });

    this.logger.log(`Sent welcome email to ${data.email}`);
  }

  private async handlePasswordReset(data: any) {
    const html = await this.templateService.render('password-reset', {
      name: data.name,
      resetUrl: data.resetUrl,
      expiresIn: data.expiresIn,
    });

    await this.emailService.send({
      to: data.email,
      subject: 'Reset Your Password',
      html,
    });

    this.logger.log(`Sent password reset email to ${data.email}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed:`, error);
  }
}
```

### Email Service

```typescript
// src/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP connection established');
      }
    });
  }

  async send(options: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        replyTo: this.configService.get('EMAIL_REPLY_TO'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });

      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}
```

### Template Service

```typescript
// src/services/template.service.ts
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  async onModuleInit() {
    // Register partials
    await this.registerPartials();

    // Precompile templates
    await this.loadTemplates();
  }

  private async registerPartials() {
    const partialsDir = path.join(__dirname, '../templates/partials');
    const files = await fs.readdir(partialsDir);

    for (const file of files) {
      const name = path.basename(file, '.hbs');
      const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
      Handlebars.registerPartial(name, content);
    }
  }

  private async loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates');
    const files = await fs.readdir(templatesDir);

    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const name = path.basename(file, '.hbs');
        const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
        this.templates.set(name, Handlebars.compile(content));
      }
    }
  }

  async render(templateName: string, data: any): Promise<string> {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return template(data);
  }
}
```

## Email Templates

### ticket-created.hbs

```handlebars
{{> header}}

<h1>Ticket Created</h1>

<p>Hello {{customerName}},</p>

<p>Thank you for contacting us. Your ticket has been created successfully.</p>

<div class="ticket-info">
  <h2>{{ticketTitle}}</h2>
  <p><strong>Ticket ID:</strong> {{ticketId}}</p>
  <p>{{ticketDescription}}</p>
</div>

<p>We'll respond as soon as possible. You can track your ticket status using the link below:</p>

{{> button text="View Ticket" url=ticketUrl}}

<p>Best regards,<br>Deskio Support Team</p>

{{> footer}}
```

### ticket-replied.hbs

```handlebars
{{> header}}

<h1>New Reply on Your Ticket</h1>

<p>Hello {{recipientName}},</p>

<p>{{authorName}} has replied to your ticket: <strong>{{ticketTitle}}</strong></p>

<div class="reply-content">
  {{{replyContent}}}
</div>

{{> button text="View & Reply" url=ticketUrl}}

<p>Best regards,<br>Deskio Support Team</p>

{{> footer}}
```

## Queue Configuration

### BullMQ Module Setup

```typescript
// app.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs
      },
    }),
  ],
})
export class AppModule {}
```

## Monitoring & Logging

### Health Check

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('health')
export class HealthController {
  constructor(@InjectQueue('notifications') private notificationQueue: Queue) {}

  @Get()
  async check() {
    const jobCounts = await this.notificationQueue.getJobCounts();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      queue: {
        waiting: jobCounts.waiting,
        active: jobCounts.active,
        completed: jobCounts.completed,
        failed: jobCounts.failed,
      },
    };
  }
}
```

## Error Handling & Retry

- Failed jobs automatically retried 3 times
- Exponential backoff: 2s, 4s, 8s
- Failed jobs moved to failed queue
- Manual retry from dashboard

## Testing

### Test Event Publisher

```bash
# Publish test event to queue
node scripts/test-event.js ticket.created
```

```javascript
// scripts/test-event.js
const { Queue } = require('bullmq');

const queue = new Queue('notifications', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

queue.add('ticket.created', {
  ticketId: 'test-123',
  customerEmail: 'test@example.com',
  customerName: 'Test User',
  title: 'Test Ticket',
  description: 'This is a test',
  ticketUrl: 'http://localhost:3100/tickets/test-123',
});
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

CMD ["node", "dist/main.js"]
```

## Troubleshooting

### Issue: Emails not sending

- Check SMTP credentials
- Verify SMTP server reachable
- Check email logs
- Test SMTP connection

### Issue: Jobs stuck in queue

- Check Redis connection
- Restart worker
- Check queue status
- Review failed jobs

### Issue: Templates not rendering

- Verify template files exist
- Check Handlebars syntax
- Review template data

## Notes

- **No REST API** - This is a worker, không expose HTTP endpoints (except health check)
- Monitor queue depth regularly
- Implement email rate limiting if needed
- Consider email service providers (SendGrid, AWS SES) for production
- Keep templates organized và versioned
- Test email rendering across clients
- Implement unsubscribe functionality (future)
- Track email analytics (opens, clicks - future)
