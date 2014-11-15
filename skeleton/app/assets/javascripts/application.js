// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require_tree .
//= require jquery.serializejson

$.FollowToggle = function (el) {
  this.$el = $(el);
  this.userId = this.$el.data("user-id");
  this.followState = this.$el.data('followed');
  console.log(this.followState)
  this.render();
  this.bindEvent();
  
};

$.FollowToggle.prototype.render = function () {
  switch (this.followState){
  case ("followed"):
    this.$el.empty();
    this.$el.append("Unfollow!");
    this.$el.prop("disabled", false);
    break;
  case ("unfollowed"):
    this.$el.empty();
    this.$el.append("Follow!");
    this.$el.prop("disabled", false);
    break;
  default:
    this.$el.prop("disabled", true);
  }
};

$.FollowToggle.prototype.bindEvent = function(){
  this.$el.on("click", this.handleClick.bind(this));
}

$.FollowToggle.prototype.handleClick = function (event) {
  event.preventDefault();

  var fn = this;
  var method = (this.followState === "followed" ? "DELETE" : "POST");
  
  switch (this.followState){
  case ("followed"):
    this.followState = "unfollowing";
    break;
  case ("unfollowed"):
    this.followState = "following";
    break;
  }
  
  this.render();
  
  
  $.ajax({
    url: "/users/" + fn.userId + "/follow",
    dataType: "json",
    type: method,
    success: function () {
     fn.followState = toggle(fn.followState); 
     fn.render();
    }
  });
};

$.UserSearch = function (el) {
  this.$el = $(el);
  this.$input = $(this.$el.find("input"));
  this.$users = $(this.$el.find("ul.users"));
  this.bindEvent();                          
}                                            
                                             
$.UserSearch.prototype.bindEvent = function () {
  this.$input.on("input", this.handleInput.bind(this));
}                                            

$.UserSearch.prototype.handleInput = function (event) {
  var that = this;
  $.ajax({
    url: "/users/search",
    type: "GET",
    dataType: "json",
    data: { query: that.$input.val() },
    success: function (results) {
      that.renderResults(results);

    }
  });
}

$.UserSearch.prototype.renderResults = function (results) {
  this.$users.empty();
  var that = this
  
  
  results.forEach(function(result){
    var $li = $("<li>")
    var $a = $("<a>")
    var $button = $("<button>")
    $li.append($a)
    $li.append($button)
    $button.attr("data-user-id", result.id)
    var followState = (result.followed ? 'followed' : 'unfollowed' )
    $button.attr("data-followed", followState)
    $button.followToggle();
    $a.attr("href", "/users/" + result.id)
    $a.text(result.username)
    that.$users.append($li);
  })
}

$.TweetCompose = function(el) {
  this.$el = $(el)
  this.$el.find(".chars-left").append(140);
  this.eventHandler();
}

$.TweetCompose.prototype.eventHandler = function (){
  this.$el.on("submit", this.submit.bind(this));
  this.$el.find("textarea").on("input", this.updateCharsLeft.bind(this));
  this.$el.find("a.add-mentioned-user").on("click", this.addMentionedUser.bind(this))
  this.$el.find(".mentioned-users").on("click", "a.remove-mentioned-user", this.removeMentionedUser.bind(this))

}

$.TweetCompose.prototype.addMentionedUser = function(){
  var $scriptTag = this.$el.find("script");
  var html = $scriptTag.html();
  this.$el.find(".mentioned-users").append(html);
}

$.TweetCompose.prototype.removeMentionedUser = function(event){
  $(event.currentTarget).parent().remove()
}



$.TweetCompose.prototype.updateCharsLeft = function(event){
  var $currentTarget = $(event.currentTarget);
  var charsUsed = $currentTarget.val().length;
  var charsLeft = 140 - charsUsed;
  this.$el.find(".chars-left").empty();
  this.$el.find(".chars-left").append(charsLeft)
}

$.TweetCompose.prototype.submit = function (event) {
    var that = this;
    event.preventDefault();
    var formData = $(event.currentTarget).serializeJSON();
    var $inputs = this.$el.find(":input");
    $inputs.prop("disabled", true);
    
    $.ajax({
      url: "/tweets",
      type: "POST",
      data: formData,
      dataType: "json",
      success: function (result){
        that.handleSuccess(result);
      }
    }) 
  }

$.TweetCompose.prototype.handleSuccess = function (result) {
  this.clearInput();
  this.$el.find(":input").prop("disabled", false);
  var feed = this.$el.data("tweets-ul");
  $tweetUl = $(feed)
  $li = $("<li>")
  $li.append(JSON.stringify(result))
  $tweetUl.prepend($li)
}

$.TweetCompose.prototype.clearInput = function () {
  this.$el.find(":input").val("");
  this.$el.find(".mentioned-users").empty();
  this.$el.find(".chars-left").empty();
  this.$el.find(".chars-left").append(140);
  
}

function toggle (followState) {
  switch (followState){
  case ("unfollowing"):
    return "unfollowed";
    break;
  case ("following"):
    return "followed";
    break;
  }
}

$.fn.followToggle = function () {
  return this.each(function () {
    new $.FollowToggle(this);
  });
};

$.fn.userSearch = function () {
  return this.each(function () {
    new $.UserSearch(this);
  })
}

$.fn.tweetCompose = function () {
  return this.each(function () {
    new $.TweetCompose(this);
  })
}

$(function () {
  $("button.follow-toggle").followToggle();
  $("div.users-search").userSearch();
  $("form.tweet-compose").tweetCompose();
});

