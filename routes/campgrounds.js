var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");

router.get("/", function (req, res) {

    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search),"gi");
        Campground.find({name: regex}, function(err, foundCampgrounds){
          if(err){
            console.log(err);
          } else {
            var noMatch;
            if(foundCampgrounds.length < 1){
              noMatch = "No campgrounds match that search, try again";
            }
            res.render("campgrounds/index", {campgrounds:foundCampgrounds, error: noMatch});
          }
        });
    } else {
      Campground.find({},function(err,allCampgrounds){
          if(err){
              console.log(err);
          } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds});
          }
      });
    }

});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//CREATE - add new campground to database
router.post("/", middleware.isLoggedIn, function (req, res) {
    if(!req.body.location){
        req.flash("error", "Location field cannot be empty");
        return res.redirect("back");
    }
    var name = req.body.name;
    var image = req.body.img;
    var description = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function(err, data){
        if(err){
            req.flash("error", "Invalid location");
            return res.redirect("back");
        }
        if(data.results.length <= 0){
            req.flash("error", "Location entered doesn't match any search results");
            return res.redirect("back");
        }
        console.log(data.results);
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = {name: name, image: image, description: description, author: author, price: price, location: location, lat: lat, lng: lng};
        console.log(req.user);
        Campground.create(
            newCampground,function(err,campground){
                if(err){
                    console.log(err);
                } else {
                    console.log(campground);
                    res.redirect("/campgrounds");
                }
            });
    });

});

// SHOW - show mroe infor about one campground
router.get("/:id", function(req,res){
    //Find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    //is this user logged in at all?
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

//UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    if(!req.body.location){
        req.flash("error", "Location field cannot be empty");
        return res.redirect("back");
    }
    //find and update the correct campground
    geocoder.geocode(req.body.location, function(err, data){
        if(err){
            req.flash("error", "Invalid location");
            return res.redirect("back");
        }
        if(data.results.length <= 0){
            req.flash("error", "Location entered doesn't match any search results");
            return res.redirect("back");
        }
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_addess;
        var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
        Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedCampground){
            if(err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    });

});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
