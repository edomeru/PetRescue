import React from 'react';

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent">
        Pawtora – User Data Deletion Instructions
      </h1>
      <p className="text-sm text-slate-400 mb-6">Last updated: October 2026</p>

      <section className="space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          According to Facebook Platform Rules and standard data privacy guidelines, users have the right to request deletion of their gameplay data and associated platform identifiers.
        </p>

        <h2 className="text-lg font-semibold text-white mt-6">How to Delete Your Data from Facebook:</h2>
        <ol className="list-decimal pl-5 space-y-2 text-slate-400">
          <li>Go to your Facebook Profile's <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
          <li>Navigate to <strong>Apps and Websites</strong> where you will see all games and services connected to your account.</li>
          <li>Find <strong>Pawtora</strong> in the list.</li>
          <li>Click the <strong>Remove</strong> button.</li>
          <li>Check the option to delete all history and interactions with Pawtora, and confirm.</li>
        </ol>

        <h2 className="text-lg font-semibold text-white mt-6">Direct Data Deletion Request:</h2>
        <p>
          If you wish to have all stored cloud data, saved level records, and coin balances permanently purged from our Firebase database, please send an email to:
        </p>
        <p className="font-mono bg-slate-900 p-3 rounded border border-slate-800 text-pink-400">
          edmer_alarte@yahoo.com
        </p>
        <p className="text-slate-400 text-xs">
          Include your Facebook User ID or the game instance identifier. All associated database records will be permanently deleted within 48 hours.
        </p>
      </section>
    </div>
  );
}
