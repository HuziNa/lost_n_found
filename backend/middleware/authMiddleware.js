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

export const requireBakeryOwner = (req, res, next) => {
  if (req.authUser?.role !== "bakeryOwner") {
    return res.status(403).json({
      message: "Only bakery owners can access this resource.",
    });
  }

  return next();
};

export const requireCustomer = (req, res, next) => {
  if (req.authUser?.role !== "customer") {
    return res.status(403).json({
      message: "Only customers can place orders.",
    });
  }

  return next();
};

export const requireAdmin = (req, res, next) => {
  if (req.authUser?.role !== "admin") {
    return res.status(403).json({
      message: "Only admins can access this resource.",
    });
  }

  return next();
};
