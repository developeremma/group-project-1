
$(document).ready(function() {
  
  var a_lat;
  var a_long;

  
  if (!navigator.geolocation){
    alert("Geolocation is not supported by your browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(showPosition, error);

  //HELPER FUNCTIONS

  function error() {
  	//triggered when user hits block on location prompt
    $('#messageModal').modal('toggle');

  }
  
function showPosition(position) {
    a_lat =  position.coords.latitude;
    a_long =  position.coords.longitude;
    getCityName(a_lat, a_long);
    getWeatherData(a_lat, a_long);
}

  function getWeatherData(lat, long){
     var apiKey = "a0fc21e3a03ab5c3325f547ad2c565cf";//emmas key
     var exclude = "?exclude=minutely,hourly,daily,alerts,flags";
     var unit = "?units=si";
     var url = "https://api.darksky.net/forecast/" + apiKey + "/" + lat + "," + long + exclude + unit;
     
    //get darksky api data
    $.ajax({
      url: url,
      dataType: "jsonp",
      success: function (weatherData) { 

        $('#weather-description').text(weatherData.currently.summary);
        var celsius= toCelsius(weatherData.currently.temperature);
        $('#weather-value').html(celsius + '<a  id="convert" href="#" class="btn btn-primary btn_temp">°C</a>');
        $('#weather-value').val(celsius);
      }
    });
  }
  
  function getCityName(lat, long){
    var cityName;
    var countryCode;
    var countryName;
    
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+ lat + "," + long;
    $.getJSON(url, function(data) {
          var arr_address_comp = data.results[0].address_components;
          arr_address_comp.forEach(function(val) {
              if(val.types[0] === "locality" ){
                 cityName = val.long_name;
              }
              if(val.types[0] === "country" ){
                   countryCode = val.short_name;
                   countryName = val.long_name;
              }
        });
        $('#weather-location').text(cityName + ", " + countryName);   
    });
  }
  
  function toCelsius(f) {
    return Math.round((5/9) * (f-32));
  }
  
  function toFahrenheit(c){
    return Math.round(c * 9 / 5 + 32);
  }
  //click event to convert temperature
  $(document).on('click', '#convert', function(){
        
         if($("#convert").text() == "°C"){
             var temp = $("#weather-value").val();
             var far = toFahrenheit($("#weather-value").val());
             $('#weather-value').html(far + '<a  id="convert" href="#" class="btn btn-primary btn_temp">°F</a>');
             $("#weather-value").val(far);    
         }else{
             var cel = toCelsius($("#weather-value").val());
             $('#weather-value').html(cel + '<a  id="convert" href="#" class="btn btn-primary btn_temp">°C</a>');
             $("#weather-value").val(cel);
         }
      });
}); 
