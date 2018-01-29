var env = process.env.NODE_ENV || "dev";
if(env === "dev"){
    console.log("In developer environemnt");
    require("dotenv").config();
}
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    methodOverride =  require("method-override"),
    flash = require("connect-flash");
    //seedDB = require("./seeds.js");

var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    userRoutes = require("./routes/users"),
    indexRoutes = require("./routes/index");

if(env === "dev") {
    //mongoose.connect("mongodb://localhost/yelp_camp");
    mongoose.connect("mongodb://alecfeatherston:mdl313Saizan@ds117868.mlab.com:17868/yelpcampakf");
} else {
    mongoose.connect("mongodb://alecfeatherston:mdl313Saizan@ds117868.mlab.com:17868/yelpcampakf");
}

//mongodb://alecfeatherston:mdl313*Saizan#@ds117868.mlab.com:17868/yelpcampakf
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the database
app.locals.moment = require("moment");
//Passport configuration
app.use(require("express-session")({
    secret: "I cry myself to sleep every night",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Started server");
});
