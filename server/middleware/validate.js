const VALID_CATEGORIES = ['Tech', 'Sports', 'Academic', 'Social', 'Music', 'Career'];

function validateEventBody(req, res, next) {
  const { title, date, category, time, location, capacity } = req.body;

  if (title === undefined || title === null) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const trimmedTitle = String(title).trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    return res.status(400).json({ error: 'Title must be between 1 and 100 characters' });
  }

  if (!date) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  if (!time) {
    return res.status(400).json({ error: 'Time is required (HH:MM format)' });
  }
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: 'Time must be in HH:MM format' });
  }

  if (!location || !String(location).trim()) {
    return res.status(400).json({ error: 'Location is required' });
  }

  if (capacity === undefined || capacity === null) {
    return res.status(400).json({ error: 'Capacity is required' });
  }
  const cap = Number(capacity);
  if (!Number.isInteger(cap) || cap < 1) {
    return res.status(400).json({ error: 'Capacity must be a positive integer' });
  }

  if (req.body.description !== undefined && req.body.description !== null) {
    const desc = String(req.body.description).trim();
    if (desc.length > 1000) {
      return res.status(400).json({ error: 'Description must be 1000 characters or fewer' });
    }
    req.body.description = desc || null;
  }

  req.body.title = trimmedTitle;
  req.body.location = String(location).trim();
  req.body.capacity = cap;
  next();
}

function validateCategory(req, res, next) {
  const { category } = req.query;
  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  next();
}

function validateEventId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }
  req.params.id = id;
  next();
}

module.exports = { validateEventBody, validateCategory, validateEventId, VALID_CATEGORIES };
