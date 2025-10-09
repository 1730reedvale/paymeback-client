import React from "react";

export default function Plans() {
  return (
    <div className="p-8 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-white">Choose Your Plan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h2>
          <p className="text-lg font-semibold text-gray-700 mb-4">$0/month</p>
          <ul className="space-y-2 text-gray-800">
            <li>✓ Track IOUs</li>
            <li>✓ Basic reminders</li>
            <li>✓ Group splits</li>
            <li>✓ Debt history</li>
          </ul>
          <button
            disabled
            className="mt-6 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed"
          >
            Current
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h2>
          <p className="text-lg font-semibold text-gray-700 mb-4">
            $3.99/month or $39.99/year
          </p>
          <ul className="space-y-2 text-gray-800">
            <li>✓ Recurring debts</li>
            <li>✓ Smart suggestions</li>
            <li>✓ Attachments</li>
            <li>✓ Advanced alerts</li>
            <li>✓ Repayment stats</li>
            <li>✓ PDF exports</li>
            <li>✓ Custom themes</li>
            <li>✓ Trust scores</li>
          </ul>
          <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
