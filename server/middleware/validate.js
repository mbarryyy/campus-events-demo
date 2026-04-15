const VALID_CATEGORIES = ['Tech', 'Sports'];

function validateEventBody(req, res, next) {
  const { title, date, category } = req.body;

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
    return res.status(400).json({ error: 'Category must be Tech or Sports' });
  }

  req.body.title = trimmedTitle;
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
