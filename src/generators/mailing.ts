// ============================================
// Mailing Generator
// Supports Nodemailer and Resend with React Email
// ============================================

import path from 'path';
import { BaseGenerator } from './base.js';
import { writeFile, ensureDir } from '../utils/index.js';

export class MailingGenerator extends BaseGenerator {
  name = 'Mailing';

  async generate(): Promise<void> {
    const mailingProvider = this.config.backend.mailing;
    
    if (mailingProvider === 'none') return;

    // Create mailing directories
    await ensureDir(path.join(this.backendPath, 'src', 'lib'));
    await ensureDir(path.join(this.backendPath, 'src', 'emails'));

    await Promise.all([
      this.generateMailClient(),
      this.generateEmailTemplates(),
      this.generateEmailService(),
      this.updatePackageJson(),
    ]);
  }

  private async generateMailClient(): Promise<void> {
    const provider = this.config.backend.mailing;
    
    let content = '';
    
    if (provider === 'nodemailer') {
      content = this.isTypeScript
        ? `import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, html, text, from } = options;
  
  await transporter.sendMail({
    from: from || process.env.SMTP_FROM || 'noreply@example.com',
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
}

export { transporter };
`
        : `const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(options) {
  const { to, subject, html, text, from } = options;
  
  await transporter.sendMail({
    from: from || process.env.SMTP_FROM || 'noreply@example.com',
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });
}

module.exports = { sendEmail, transporter };
`;
    } else if (provider === 'resend') {
      content = this.isTypeScript
        ? `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, html, text, from } = options;
  
  await resend.emails.send({
    from: from || process.env.RESEND_FROM || 'onboarding@resend.dev',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  });
}

export { resend };
`
        : `const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(options) {
  const { to, subject, html, text, from } = options;
  
  await resend.emails.send({
    from: from || process.env.RESEND_FROM || 'onboarding@resend.dev',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  });
}

module.exports = { sendEmail, resend };
`;
    }

    await writeFile(
      path.join(this.backendPath, 'src', 'lib', `mail.${this.ext}`),
      content
    );
  }

  private async generateEmailTemplates(): Promise<void> {
    // Welcome Email Template using React Email
    const welcomeTemplate = this.isTypeScript
      ? `import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  username,
  loginUrl = 'https://example.com/login',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to ${this.config.projectName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome, {username}!</Heading>
        <Text style={text}>
          Thank you for signing up for ${this.config.projectName}. We're excited to have you on board!
        </Text>
        <Text style={text}>
          Click the link below to get started:
        </Text>
        <Link href={loginUrl} style={link}>
          Get Started →
        </Link>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1d1c1d',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const link = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  marginTop: '32px',
};
`
      : `const {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} = require('@react-email/components');
const React = require('react');

const WelcomeEmail = ({ username, loginUrl = 'https://example.com/login' }) => (
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, 'Welcome to ${this.config.projectName}!'),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Heading, { style: h1 }, 'Welcome, ', username, '!'),
        React.createElement(Text, { style: text },
          'Thank you for signing up for ${this.config.projectName}. We\\'re excited to have you on board!'
        ),
        React.createElement(Text, { style: text }, 'Click the link below to get started:'),
        React.createElement(Link, { href: loginUrl, style: link }, 'Get Started →'),
        React.createElement(Text, { style: footer },
          'If you didn\\'t create an account, you can safely ignore this email.'
        )
      )
    )
  )
);

module.exports = { WelcomeEmail };

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1d1c1d',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const link = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  marginTop: '32px',
};
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'emails', `welcome.${this.ext}x`),
      welcomeTemplate
    );

    // Reset Password Email Template
    const resetTemplate = this.isTypeScript
      ? `import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  username: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  username,
  resetUrl,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password for ${this.config.projectName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>
          Hi {username},
        </Text>
        <Text style={text}>
          We received a request to reset your password. Click the button below to choose a new password:
        </Text>
        <Link href={resetUrl} style={link}>
          Reset Password
        </Link>
        <Text style={text}>
          This link will expire in 1 hour.
        </Text>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1d1c1d',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const link = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  marginTop: '32px',
};
`
      : `const {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} = require('@react-email/components');
const React = require('react');

const ResetPasswordEmail = ({ username, resetUrl }) => (
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, 'Reset your password for ${this.config.projectName}'),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Heading, { style: h1 }, 'Reset Your Password'),
        React.createElement(Text, { style: text }, 'Hi ', username, ','),
        React.createElement(Text, { style: text },
          'We received a request to reset your password. Click the button below to choose a new password:'
        ),
        React.createElement(Link, { href: resetUrl, style: link }, 'Reset Password'),
        React.createElement(Text, { style: text }, 'This link will expire in 1 hour.'),
        React.createElement(Text, { style: footer },
          'If you didn\\'t request a password reset, you can safely ignore this email.'
        )
      )
    )
  )
);

module.exports = { ResetPasswordEmail };

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '580px',
};

const h1 = {
  color: '#1d1c1d',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const link = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center',
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  marginTop: '32px',
};
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'emails', `reset-password.${this.ext}x`),
      resetTemplate
    );

    // Index file for email templates
    const indexContent = this.isTypeScript
      ? `export { WelcomeEmail } from './welcome.js';
export { ResetPasswordEmail } from './reset-password.js';
`
      : `const { WelcomeEmail } = require('./welcome');
const { ResetPasswordEmail } = require('./reset-password');

module.exports = { WelcomeEmail, ResetPasswordEmail };
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'emails', `index.${this.ext}`),
      indexContent
    );
  }

  private async generateEmailService(): Promise<void> {
    const content = this.isTypeScript
      ? `import { render } from '@react-email/render';
import { sendEmail } from './mail.js';
import { WelcomeEmail } from '../emails/welcome.js';
import { ResetPasswordEmail } from '../emails/reset-password.js';

export async function sendWelcomeEmail(
  to: string,
  username: string,
  loginUrl?: string
): Promise<void> {
  const html = await render(WelcomeEmail({ username, loginUrl }));
  
  await sendEmail({
    to,
    subject: 'Welcome to ${this.config.projectName}!',
    html,
  });
}

export async function sendResetPasswordEmail(
  to: string,
  username: string,
  resetUrl: string
): Promise<void> {
  const html = await render(ResetPasswordEmail({ username, resetUrl }));
  
  await sendEmail({
    to,
    subject: 'Reset Your Password',
    html,
  });
}
`
      : `const { render } = require('@react-email/render');
const { sendEmail } = require('./mail');
const { WelcomeEmail } = require('../emails/welcome');
const { ResetPasswordEmail } = require('../emails/reset-password');

async function sendWelcomeEmail(to, username, loginUrl) {
  const html = await render(WelcomeEmail({ username, loginUrl }));
  
  await sendEmail({
    to,
    subject: 'Welcome to ${this.config.projectName}!',
    html,
  });
}

async function sendResetPasswordEmail(to, username, resetUrl) {
  const html = await render(ResetPasswordEmail({ username, resetUrl }));
  
  await sendEmail({
    to,
    subject: 'Reset Your Password',
    html,
  });
}

module.exports = { sendWelcomeEmail, sendResetPasswordEmail };
`;

    await writeFile(
      path.join(this.backendPath, 'src', 'lib', `email-service.${this.ext}`),
      content
    );
  }

  private async updatePackageJson(): Promise<void> {
    const pkgPath = path.join(this.backendPath, 'package.json');
    const provider = this.config.backend.mailing;
    
    try {
      const fs = await import('fs-extra');
      const pkg = await fs.readJson(pkgPath);
      
      pkg.dependencies = pkg.dependencies || {};
      pkg.devDependencies = pkg.devDependencies || {};
      
      // React Email components - LATEST VERSION compatible with React 19
      pkg.dependencies['@react-email/components'] = '^1.0.3';
      pkg.dependencies['@react-email/render'] = '^1.0.3';
      pkg.dependencies['react'] = '^19.0.0';
      
      // Provider-specific dependencies
      if (provider === 'nodemailer') {
        pkg.dependencies['nodemailer'] = '^6.9.16';
        if (this.isTypeScript) {
          pkg.devDependencies['@types/nodemailer'] = '^6.4.17';
        }
      } else if (provider === 'resend') {
        pkg.dependencies['resend'] = '^4.0.1';
      }
      
      // Add email preview script
      pkg.scripts = pkg.scripts || {};
      pkg.scripts['email:dev'] = 'email dev --dir src/emails';
      
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    } catch {
      // Package.json doesn't exist yet, will be created by backend generator
    }
  }

  /**
   * Generate environment variables for mailing
   */
  getEnvVariables(): string {
    const provider = this.config.backend.mailing;
    
    if (provider === 'nodemailer') {
      return `
# Mailing (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Your App <noreply@yourapp.com>"
`;
    } else if (provider === 'resend') {
      return `
# Mailing (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM="Your App <onboarding@resend.dev>"
`;
    }
    
    return '';
  }
}
