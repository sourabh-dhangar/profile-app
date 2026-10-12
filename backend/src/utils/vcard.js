/**
 * Generate RFC 6350 / vCard 3.0 string
 * @param {Object} profile - Profile Mongoose document / object
 * @param {string} profileUrl - Web URL for the public profile
 * @returns {string} Formatted vCard text
 */
function generateVCard(profile, profileUrl = '') {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${(profile.name || 'User').replace(/[\r\n;]/g, ' ')}`,
    `N:;${(profile.name || 'User').replace(/[\r\n;]/g, ' ')};;;`,
  ];

  if (profile.headline || profile.profileType) {
    const title = profile.headline || profile.profileType;
    lines.push(`TITLE:${title.replace(/[\r\n;]/g, ' ')}`);
  }

  if (profile.bio) {
    // Escape newlines for vCard NOTE
    const escapedBio = profile.bio.replace(/\r?\n/g, '\\n').replace(/;/g, '\\;');
    lines.push(`NOTE:${escapedBio}`);
  }

  if (profile.city) {
    lines.push(`ADR;TYPE=HOME:;;;${profile.city.replace(/[\r\n;]/g, ' ')};;;`);
  }

  // Privacy-safe contact details
  if (profile.contactDetails) {
    if (profile.contactDetails.showPhone && profile.contactDetails.phone) {
      lines.push(`TEL;TYPE=CELL,VOICE:${profile.contactDetails.phone}`);
    }
    if (profile.contactDetails.showEmail && profile.contactDetails.email) {
      lines.push(`EMAIL;TYPE=INTERNET:${profile.contactDetails.email}`);
    }
  }

  // Social / Website URL
  if (profileUrl) {
    lines.push(`URL:${profileUrl}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

module.exports = {
  generateVCard,
};
