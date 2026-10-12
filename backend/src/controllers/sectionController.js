const Section = require('../models/Section');
const Profile = require('../models/Profile');

/**
 * Get all sections for current user's profile
 * GET /api/v1/profiles/me/sections
 */
const getMySections = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const sections = await Section.find({ profileId: profile._id }).sort({ order: 1 });
    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a section
 * POST /api/v1/profiles/me/sections
 * Body: { type, title, content, visibility, order }
 */
const createSection = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { type, title, content, visibility = 'public', order } = req.body;
    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Section type and title are required',
      });
    }

    // Determine order if not specified
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const highest = await Section.findOne({ profileId: profile._id }).sort({ order: -1 });
      sectionOrder = highest ? highest.order + 1 : 0;
    }

    const section = new Section({
      profileId: profile._id,
      type,
      title,
      content: content || {},
      visibility,
      order: sectionOrder,
    });
    await section.save();

    // Update profile completion percentage
    profile.calculateCompletion();
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a section
 * PUT /api/v1/profiles/me/sections/:id
 */
const updateSection = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { id } = req.params;
    const section = await Section.findOne({ _id: id, profileId: profile._id });
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const { title, content, visibility, order } = req.body;
    if (title !== undefined) section.title = title;
    if (content !== undefined) section.content = content;
    if (visibility !== undefined) section.visibility = visibility;
    if (order !== undefined) section.order = order;

    await section.save();

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a section
 * DELETE /api/v1/profiles/me/sections/:id
 */
const deleteSection = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { id } = req.params;
    const section = await Section.findOneAndDelete({ _id: id, profileId: profile._id });
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    profile.calculateCompletion();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder sections
 * PUT /api/v1/profiles/me/sections/reorder
 * Body: { sectionOrders: [{ id: '...', order: 0 }, ...] }
 */
const reorderSections = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { sectionOrders } = req.body;
    if (!Array.isArray(sectionOrders)) {
      return res.status(400).json({
        success: false,
        message: 'sectionOrders must be an array of { id, order } objects',
      });
    }

    const updates = sectionOrders.map(({ id, order }) =>
      Section.updateOne({ _id: id, profileId: profile._id }, { $set: { order } })
    );
    await Promise.all(updates);

    const updatedSections = await Section.find({ profileId: profile._id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Sections reordered successfully',
      data: updatedSections,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
};
