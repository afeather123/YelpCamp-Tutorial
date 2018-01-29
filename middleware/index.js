//all the middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        //does the user own the campground?
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Could not find the requested campground.");
                res.redirect("back");
            } else {

                if(!foundCampground){
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }

                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You are not logged in to the appropriate account to edit this campground.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("/login");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        //does the user own the campground?
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Could not find the requested comment.");
                res.redirect("back");
            } else {

                if(!foundComment){
                    req.flash("error", "Item not found");
                    res.redirect("back");
                }

                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You are not logged in to the appropriate account to edit this comment.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("/login");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login");
};

module.exports = middlewareObj;
