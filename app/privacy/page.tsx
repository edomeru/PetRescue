import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
        Pawtora – Privacy Policy
      </h1>
      <p className="text-sm text-slate-400 mb-6">Last updated: October 2026</p>

      <section className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          Welcome to <strong>Pawtora</strong>, operated and published by <strong>Alarte Edmer D</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We respect your privacy and are committed to protecting any information you share while playing our game across all supported platforms (including Facebook Instant Games, itch.io, GameJolt, CrazyGames, and our web portal at https://pawtora.site).
        </p>

        <h2 className="text-lg font-semibold text-white mt-6">1. Information We Collect</h2>
        <p>
          Pawtora is designed as a casual puzzle game. We only collect minimal information necessary for gameplay and cloud progress saving:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li><strong>Anonymous Gameplay Progress:</strong> Level stars, rescued pets, and coin balances stored via local storage and secure anonymous database synchronization.</li>
          <li><strong>Platform Player ID:</strong> When played on Facebook Instant Games, your public platform user ID and display name are used strictly to display your in-game identity and save progress.</li>
          <li><strong>Purchases:</strong> Transaction verification identifiers when purchasing optional in-game items (coins, boosters, pet adoptions). We never store or process credit card numbers directly.</li>
        </ul>

        <h2 className="text-lg font-semibold text-white mt-6">2. How We Use Information</h2>
        <p>
          We use the collected information solely to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li>Restore your saved game progress across sessions.</li>
          <li>Credit purchased coins, accessories, and pet unlocks to your account.</li>
          <li>Ensure fair play and diagnose software issues.</li>
        </ul>

        <h2 className="text-lg font-semibold text-white mt-6">3. Third-Party Services</h2>
        <p>
          We partner with trusted platforms including Meta / Facebook Instant Games, Google Firebase, and Stripe to provide secure cloud data and payment processing. Each partner handles data according to their respective privacy standards.
        </p>

        <h2 className="text-lg font-semibold text-white mt-6">4. Contact Us</h2>
        <p>
          If you have questions regarding this privacy policy or your data, please contact the development team at: <span className="text-pink-400">edmer_alarte@yahoo.com</span>.
        </p>
      </section>
    </div>
  );
}
