//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-suresh:testing123@cluster0.oplyz.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);





const item1=new Item({
  name:"welocome todo list"
});

const item2=new Item({
  name:"welocome todo "
});

const item3=new Item({
  name:"welocome "
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List =mongoose.model("List",listSchema)



const day = date.getDate();


app.get("/", function(req, res) {

const day = date.getDate();
Item.find({},function(err,docs)
{
  if(docs.length===0){
    Item.insertMany(defaultItems,function(err)
    {
      if(err)
      {console.log(err);}
      else{console.log("successfully saved");}
    });
     res.redirect("/");
  }

res.render("list", {listTitle: day, newListItems: docs});
});



});

app.post("/", function(req, res){

  const item = req.body.newItem;
const listName= req.body.list;
  const item1=new Item({
    name:item
  });
if(listName===day)
{ console.log("day");
  item1.save();
    res.redirect("/");
  }
  else{
     console.log(listName);
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item1);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res)
{ const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName===day)
  {
   Item.findByIdAndRemove(checkedItemId,function(err)
 {
   if(!err)
   {
     console.log("deleted successfully")
   }
 })
res.redirect("/");
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  const list=new List ({
    name:customListName,
    items:defaultItems
  });
  List.findOne({name:customListName},function(err,foundlist){
    if(!err)
    {if(!foundlist)
      { console.log("exits");
        list.save();
        res.redirect("/"+customListName);
  }
  else{
    res.render("list", {listTitle:customListName, newListItems:foundlist.items});
  }}});

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
