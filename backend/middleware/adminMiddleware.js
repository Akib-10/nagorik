// backend/middleware/adminMiddleware.js
// Must run AFTER `protect` (it relies on req.user).
// isAdmin is read from the database on every request (protect re-fetches the
// user), so revoking admin with scripts/makeAdmin.js takes effect immediately.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: 'Admin access required' });
};
