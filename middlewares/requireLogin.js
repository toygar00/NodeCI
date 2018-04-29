module.exports = (req, res, next) => {
  console.log("what", req.user);
  if (!req.user) {
    return res.status(401).send({ error: "You must log in!" });
  }

  next();
};
