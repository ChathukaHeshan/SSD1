import { protect } from "../middleware/authMiddleware.js";

const routesInit = (app, passport) => {
  app.get("/auth/google", passport.protect("google", { scope: ["profile", "email"] }));
  app.get(
    "/auth/google/callback",
    passport.protect("google", {
      failureRedirect: "/login",
      successRedirect: "/user",
    }),
    (req, res) => {
      console.log("User protectd");
    }
  );
  app.get("/test", protect, (req, res) => {
    res.send("<h3>User is protectd</h3>");
  });
};

export { routesInit };