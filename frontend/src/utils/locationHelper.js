/**
 * Location & WhatsApp Cross-Platform Sharing Helpers
 * Standardized for mobile and desktop devices.
 */

/**
 * Generate a valid universal Google Maps search / navigation URL
 * @param {string} address - Street address or landmark
 * @param {{ lat?: number, lng?: number, latitude?: number, longitude?: number }} [coords]
 * @returns {string} Google Maps URL compatible with Android, iOS and Web
 */
export function generateGoogleMapsUrl(address, coords = null) {
  const lat = coords?.lat ?? coords?.latitude;
  const lng = coords?.lng ?? coords?.longitude;

  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const cleanAddr = String(address || '').trim();
  const queryAddr = cleanAddr.toLowerCase().includes('hyderabad')
    ? cleanAddr
    : `${cleanAddr}, Hyderabad, Telangana, India`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryAddr)}`;
}

/**
 * Generate universal WhatsApp share link for delivery/site location
 * @param {object} params
 * @param {string} params.location - Pickup or delivery site address
 * @param {string} [params.mapsUrl] - Optional pre-computed Google Maps URL
 * @param {string} [params.tripId] - Booking reference ID
 * @param {string} [params.customerName] - Customer name
 * @param {string} [params.customerPhone] - Customer phone number
 * @param {string} [params.time] - Duty time
 * @param {string} [params.date] - Duty date
 * @param {string} [params.directPhone] - If set, messages this specific number directly
 * @returns {string} WhatsApp URL compatible with mobile WhatsApp app & WhatsApp Web
 */
export function generateWhatsAppLocationUrl({
  location,
  mapsUrl = null,
  tripId = '',
  customerName = '',
  customerPhone = '',
  time = '',
  date = '',
  directPhone = '',
}) {
  const finalMapsUrl = mapsUrl || generateGoogleMapsUrl(location);
  
  let message = `🚗 *Mana Drivers - Duty Location Details*\n\n`;
  if (tripId) message += `📋 *Trip ID:* ${tripId}\n`;
  if (customerName) message += `👤 *Customer:* ${customerName}\n`;
  if (customerPhone) message += `📞 *Customer Contact:* ${customerPhone}\n`;
  if (date || time) message += `⏰ *Duty Schedule:* ${date} ${time ? 'at ' + time : ''}\n`;
  message += `📍 *Site/Pickup Location:*\n${location}\n\n`;
  message += `🗺️ *Open in Google Maps:*\n${finalMapsUrl}`;

  const cleanTargetPhone = String(directPhone || '').replace(/\D/g, '').slice(-10);

  if (cleanTargetPhone.length === 10) {
    return `https://wa.me/91${cleanTargetPhone}?text=${encodeURIComponent(message)}`;
  }

  // Universal WhatsApp share link (works on Android intent, iOS WhatsApp, and WhatsApp Web)
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Open delivery/site location directly in Google Maps
 * @param {string} address
 * @param {object} [coords]
 */
export function openLocationInGoogleMaps(address, coords = null) {
  const url = generateGoogleMapsUrl(address, coords);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}

/**
 * Open WhatsApp with delivery/site location and Google Maps link
 * @param {object} params
 */
export function shareLocationOnWhatsApp(params) {
  const url = generateWhatsAppLocationUrl(params);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
