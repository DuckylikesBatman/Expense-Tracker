// Role-based access control middleware — call after protect
// Usage: router.use(authorize('admin', 'superadmin'))
// Returns a 403 Forbidden page if the logged-in user's role isn't in the allowed list
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render('403', {
        title: '403 – Forbidden',
        user: req.user || null
      });
    }
    next();
  };
}

module.exports = authorize;
