// backend/src/services/pushNotification.js
// Sends browser push notifications via Web Push API
// Setup: run `npx web-push generate-vapid-keys` and add keys to .env
// Requires: npm install web-push

let webpush;
try { webpush = require("web-push"); } catch { webpush = null; }

if (webpush && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || "admin@fathom.farm"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

// In-memory subscription store (use MongoDB in production)
const subscriptions = new Map(); // userId → [subscription]

exports.saveSubscription = (userId, subscription) => {
  const existing = subscriptions.get(String(userId)) || [];
  // Avoid duplicates
  const endpoints = existing.map(s => s.endpoint);
  if (!endpoints.includes(subscription.endpoint)) {
    subscriptions.set(String(userId), [...existing, subscription]);
  }
};

exports.sendAlert = async (userId, title, body, data = {}) => {
  if (!webpush || !process.env.VAPID_PUBLIC_KEY) return; // not configured
  const subs = subscriptions.get(String(userId)) || [];
  const payload = JSON.stringify({ title, body, data, icon: "/tab-icon.png" });
  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410) {
          // Subscription expired — remove it
          const remaining = (subscriptions.get(String(userId)) || [])
            .filter(s => s.endpoint !== sub.endpoint);
          subscriptions.set(String(userId), remaining);
        }
      })
    )
  );
};

exports.getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || null;