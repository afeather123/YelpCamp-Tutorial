var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var _ = require("lodash");
var moment = require("moment");

router.get("/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
                Comment.find().where("author.id").equals(foundUser._id).exec(function(err, comments){
                    var content = comments.concat(campgrounds);
                    content = _.sortBy(content, function(o) { return new moment(o.createdAt); }).reverse();
                    console.log(content);
                    res.render("users/show", {user: foundUser, content: content});
                });
            });
        }
    });
});



module.exports = router;
