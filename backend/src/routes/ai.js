const express = require('express');
const router = express.Router();

/**
 * Built-in generative templates for intelligent, offline-resilient bio generation
 */
const BIO_PATTERNS = {
  professional: [
    (p, kw) => `${p} dedicated to delivering high-impact solutions. Specialized in ${kw || 'scalable systems and innovation'}. Focused on engineering excellence and measurable results.`,
    (p, kw) => `Experienced ${p} bridging the gap between vision and execution. Passionate about ${kw || 'quality craft, collaboration, and modern technology'}.`,
    (p, kw) => `Results-driven ${p} transforming complex challenges into elegant solutions. Core focus: ${kw || 'sustainable growth, performance, and best practices'}.`,
  ],
  creative: [
    (p, kw) => `Crafting digital magic as a ${p} ✨ Exploring the intersection of design, code, and story. Building with ${kw || 'passion and bold ideas'}.`,
    (p, kw) => `Daydreamer & disciplined ${p} 🎨 Obsessed with thoughtful details and experiences that resonate. Focused on ${kw || 'curating impactful work'}.`,
    (p, kw) => `Creative ${p} making waves across digital spaces. Shaping stories and products around ${kw || 'authenticity and expression'}.`,
  ],
  minimalist: [
    (p, kw) => `${p}. Building with ${kw || 'purpose, simplicity, and speed'}.`,
    (p, kw) => `${p} • Focus: ${kw || 'clean execution & craft'} • Less noise, more signal.`,
    (p, kw) => `${p} based in the digital world. Curating ${kw || 'minimalist solutions and ideas'}.`,
  ],
  punchy: [
    (p, kw) => `${p} on a mission. Shipping fast, iterating relentlessly, mastering ${kw || 'the modern stack'}. Let's build something unforgettable. 🚀`,
    (p, kw) => `High-energy ${p} turning bold concepts into reality. Driven by curiosity and ${kw || 'relentless execution'}. ⚡`,
    (p, kw) => `Zero fluff. Pure impact. ${p} innovating in ${kw || 'modern tech & products'}. Check out my work below 👇`,
  ],
};

const CAPTION_PATTERNS = {
  engaging: [
    (topic) => `Here's a behind-the-scenes look at ${topic || 'what we are building today'}! What do you think of this approach? Drop your thoughts below 👇 #buildinpublic #creator #viral #reels`,
    (topic) => `The one thing I wish I knew earlier about ${topic || 'this journey'}. Save this for your next project! 💡 #tips #lifehacks #process #creatorgrowth`,
    (topic) => `Watch till the end to see how ${topic || 'this came together'}! 🎬 #reelsvideo #bts #dailygrind #foryou`,
  ],
  punchy: [
    (topic) => `No shortcuts, just consistency. ${topic || 'Leveling up every single day'} 🚀 #grind #focus #levels #reels`,
    (topic) => `This changed everything for me: ${topic || 'working in public'} ⚡ #mindset #shipit #execute`,
    (topic) => `30 seconds of pure focus on ${topic || 'building the craft'}. Let's get it. 💥 #creator #explore #reelsindia`,
  ],
  creative: [
    (topic) => `Finding rhythm and flow through ${topic || 'every detail of the process'} ✨ #aesthetic #mood #creativeprocess #vlog`,
    (topic) => `A little spark of inspiration for anyone working on ${topic || 'their passions'} today 🌿 #artofcraft #storytelling #reels`,
    (topic) => `Turning raw ideas into reality: ${topic || 'from concept to execution'} 🎨 #creativelife #dailyvlog #inspire`,
  ],
};

/**
 * POST /api/v1/ai/generate-bio
 * Body: { profession, tone, keywords, currentBio }
 */
router.post('/generate-bio', async (req, res, next) => {
  try {
    const {
      profession = 'Creator',
      tone = 'professional',
      keywords = [],
      currentBio = '',
    } = req.body;

    const normalizedTone = (tone && BIO_PATTERNS[tone.toLowerCase()]) ? tone.toLowerCase() : 'professional';
    const kwString = Array.isArray(keywords)
      ? keywords.filter(Boolean).join(', ')
      : typeof keywords === 'string'
      ? keywords
      : '';

    const generators = BIO_PATTERNS[normalizedTone] || BIO_PATTERNS.professional;
    const suggestions = generators.map((fn) => fn(profession, kwString));

    if (currentBio && currentBio.trim().length > 0) {
      suggestions.unshift(
        `Polished version: ${currentBio.trim()} (Refined for ${normalizedTone} tone with emphasis on ${profession}).`
      );
    }

    res.status(200).json({
      success: true,
      data: {
        profession,
        tone: normalizedTone,
        suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/ai/generate-caption
 * Body: { topic, tone }
 */
router.post('/generate-caption', async (req, res, next) => {
  try {
    const { topic = 'my work', tone = 'engaging' } = req.body;
    const normalizedTone = (tone && CAPTION_PATTERNS[tone.toLowerCase()]) ? tone.toLowerCase() : 'engaging';
    const generators = CAPTION_PATTERNS[normalizedTone] || CAPTION_PATTERNS.engaging;
    const suggestions = generators.map((fn) => fn(topic));

    res.status(200).json({
      success: true,
      data: {
        topic,
        tone: normalizedTone,
        suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
