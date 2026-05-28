import React from "react";
import { SEOHead } from "@/components/SEOHead";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-invert prose-primary">
      <SEOHead title="Terms of Use - FreeFileWizard" description="Terms of Use for FreeFileWizard platform." />
      
      <h1>Terms of Use</h1>
      <p className="lead text-muted-foreground">Last Updated: March 2026</p>

      <h2>1. Acceptance</h2>
      <p>By accessing or using FreeFileWizard ("the Platform"), you agree to be bound by these Terms of Use. If you disagree with any part of the terms, you may not access the Platform.</p>

      <h2>2. Use of Services</h2>
      <p>The Platform provides free online tools for general use. You agree to use these tools only for lawful purposes. We reserve the right to restrict access to anyone who abuses the platform, including attempting to bypass rate limits or compromise our infrastructure.</p>

      <h2>3. Intellectual Property</h2>
      <p>The layout, design, data, graphics, and code of FreeFileWizard are the intellectual property of the company. However, any content you process through our tools remains your intellectual property.</p>

      <h2>4. Partner Program Terms</h2>
      <p>Users who join the Partner Program to display Cross-Ads or integrate via API must adhere to our Partner Guidelines. Partners must not display ads on sites containing illegal, adult, or otherwise prohibited content. We reserve the right to suspend partner accounts without notice.</p>

      <h2>5. Prohibited Activities</h2>
      <ul>
        <li>Using tools to process illegal content</li>
        <li>Automated scraping without API permission</li>
        <li>Attempting to reverse engineer proprietary backend systems</li>
        <li>Distributing malware or malicious files through our network</li>
      </ul>

      <h2>6. Disclaimers</h2>
      <p>THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.</p>

      <h2>7. Limitation of Liability</h2>
      <p>In no event shall FreeFileWizard be liable for any indirect, incidental, special, consequential or punitive damages, including loss of profits, data, or use, arising out of your use of the Platform.</p>

      <h2>8. Governing Law</h2>
      <p>These Terms shall be governed by the laws of the applicable jurisdiction without regard to its conflict of law provisions.</p>

      <h2>9. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. We will notify users of significant changes through the Platform.</p>
    </div>
  );
}