// Restrict access to specific roles
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
