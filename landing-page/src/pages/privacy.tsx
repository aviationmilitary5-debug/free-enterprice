import React from "react";
import { SEOHead } from "@/components/SEOHead";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-invert prose-primary">
      <SEOHead title="Privacy Policy - FreeFileWizard" description="Privacy policy for FreeFileWizard platform." />
      
      <h1>Privacy Policy</h1>
      <p className="lead text-muted-foreground">Last Updated: March 2026</p>

      <h2>1. Data Collection</h2>
      <p>FreeFileWizard is designed to process data client-side. For most tools, your files are processed entirely within your web browser and are never uploaded to our servers. We collect standard web analytics data (such as IP addresses, browser types, and usage patterns) to monitor and improve platform performance.</p>

      <h2>2. Cookies & Tracking</h2>
      <p>We use cookies and similar tracking technologies to enhance user experience, remember preferences, and analyze traffic. You can control cookie settings through your browser preferences.</p>

      <h2>3. Third Party Advertising (Google AdSense)</h2>
      <p>We use third-party advertising companies, including Google AdSense, to serve ads when you visit our website. These companies may use aggregated information (not including your name, address, email address or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
      <ul>
        <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
        <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
        <li>Users may opt out of personalized advertising by visiting Ads Settings.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>Because the majority of processing is client-side, your files remain secure on your device. For services that require server interaction (such as our Partner API or database connectors), we implement industry-standard encryption and security protocols.</p>

      <h2>5. User Rights</h2>
      <p>You have the right to request access to, correction of, or deletion of any personal data we hold about you. To exercise these rights, please contact us.</p>

      <h2>6. Contact</h2>
      <p>If you have questions about this Privacy Policy, please contact us at privacy@freefilewizard.com.</p>
    </div>
  );
}