export const requireAuth = (req, res, next) => {
  const sessionUserId = req.session?.userId;

  if (!sessionUserId) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
    });
  }

  req.authUser = {
    id: sessionUserId,
    role: req.session?.role || null,
  };

  return next();
};
