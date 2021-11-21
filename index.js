const express = require("express");
const app = express();
const path = require("path");
app.use(express.urlencoded({ extended: false }));
const passport = require('./middleware/passport')
const session = require("express-session");
const ejsLayouts = require("express-ejs-layouts");
const reminderController = require("./controller/reminder_controller");
const authController = require("./controller/auth_controller");
const { ensureAuthenticated, forwardAuthenticated , isAdmin} = require('./middleware/checkAuth')

app.use(express.static(path.join(__dirname, "public")));

app.use(ejsLayouts);

app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Middleware for express
app.use(express.json());
app.use(ejsLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes start here

app.get("/reminders", ensureAuthenticated, reminderController.list);

app.get("/reminder/new", ensureAuthenticated,reminderController.new);

app.get("/reminder/:id", ensureAuthenticated,reminderController.listOne);

app.get("/reminder/:id/edit", ensureAuthenticated, reminderController.edit);

app.post("/reminder/", ensureAuthenticated,reminderController.create);

// app.get("/adminDashboard", isAdmin,(req, res) => {
//   res.render("adminDashboard")
// })

// Implement this yourself
app.post("/reminder/update/:id", ensureAuthenticated,reminderController.update);

// Implement this yourself
app.post("/reminder/delete/:id", ensureAuthenticated,reminderController.delete);

// Fix this to work with passport! The registration does not need to work, you can use the fake database for this.
app.get("/register", forwardAuthenticated, authController.register);
app.get("/login", forwardAuthenticated, authController.login);
app.post("/register", authController.registerSubmit);

app.post("/login", 
passport.authenticate("local", {
  successRedirect: "/reminders",
  failureRedirect: "/login",
})
,authController.loginSubmit);

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback', 
passport.authenticate('github'),
function(req, res) {
  res.redirect('/reminders');
});

app.listen(3001, function () {
  console.log(
    "Server running. Visit: localhost:3001/reminders in your browser 🚀"
  );
});

//, { failureRedirect: '/login' })
