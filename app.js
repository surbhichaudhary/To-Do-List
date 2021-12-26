const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const capitalize = require("capitalize");
const _ = require("lodash");


const app =express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const i1 = new Item({
    name:"Welcome to your ToDo List"
});
const i2 = new Item({
    name:"Hit the + button to add new items"
});
const i3 = new Item({
    name:"<- Hit this to delete an item"
});

const defaultItems = [i1,i2,i3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get("/", function(req,res){
    Item.find({}, function(err, result){
        if(result.length === 0 ){
            Item.insertMany( defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Sucessfully added items");
                }
            });
            res.redirect("/");
        }
        res.render("list", {listTitle: "Today", newListItems: result});
    });
});

app.post("/", function(req,res){
    const newitem = req.body.newItem;
    const listItem = req.body.list;

    const item = new Item({
        name: newitem
    });

    if(listItem === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listItem}, function(err,result){
            result.items.push(item);
            result.save();
            res.redirect("/" + listItem);
        });
    }
});

app.post("/delete", function(req,res){
    const deleted = req.body.checkbox;
    const listN = req.body.listName;

    if(listN === "Today"){
        Item.findByIdAndRemove(deleted, function(err){
            if(!err){
                console.log("Successfully deleted")
                res.redirect("/");
            }
         });
    }
    else{
        List.findOneAndUpdate({name: listN}, {$pull: {items: {_id: deleted}}}, function(err, result){
            if(!err){
                res.redirect("/" + listN );
            }
        });
    }
});

app.get("/:customList", function(req,res){
    const listName = _.capitalize(req.params.customList);

    List.findOne({name: listName}, function(err,result){
        if(!err){
            if(!result){
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + listName);
            }
            else{
                res.render("list",{listTitle: result.name, newListItems:result.items });
            }
        }
    });
    //
});
  
app.get("/about", function(req, res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
})
