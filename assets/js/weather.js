$(document).ready(function() {
  $.ajax({
  url : "http://api.wunderground.com/api/4356bb932290f7bc/geolookup/q/autoip.json",
  dataType : "jsonp",
  success : function(parsed_json) {
  var location = parsed_json['location']['city'];
  var temp_f = parsed_json['current_observation']['temp_f'];
  alert("Current temperature in " + location + " is: " + temp_f);
  }
  });
});
$("#sosBanner").append(temp_f);
