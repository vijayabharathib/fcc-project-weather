var apiURLOriginal="https://api.openweathermap.org/data/2.5/weather?lat=13&lon=80&appid=0f92d0a980ae6e7fec3a210ee045a359";
var apiURL ="http://api.openweathermap.org/data/2.5/weather?units=metric&";
var apiKey="0f92d0a980ae6e7fec3a210ee045a359";
var iconURL="https://openweathermap.org/img/w/";
var locationAvailable=false;
var coordinates={lat: "",lon:""};
var debug=false; //no logs if false! dev mode switch.

//log to console only when debug mode is on
var log=function(s){
  if(debug)
    console.log(s);
};

//stub data format for development only
var stub={
  "coord":{
    "lon":79.95,
    "lat":12.97},
  "weather":[{
    "id":801,
    "main":"Clouds",
    "description":"few clouds",
    "icon":"02n"}],
  "base":"stations",
  "main":{
    "temp":24.14,
    "pressure":1010.68,
    "humidity":58,
    "temp_min":24.14,
    "temp_max":24.14,
    "sea_level":1020.92,
    "grnd_level":1010.68},
  "wind":{
    "speed":3.77,
    "deg":84.5033},
  "clouds":{
    "all":12},
  "dt":1476891739,
  "sys":{
    "message":0.0108,
    "country":"IN",
    "sunrise":1476837068,
    "sunset":1476879519},
  "id":1255630,
  "name":"Sriperumbudur",
  "cod":200
};

var weatherAPIData={};//container for api response
$(document).ready(function(){ //let the document load first, patience!
  /**
    * get current coordiantes using html5 navigator api
    * store when  coordinates are available
    * show error when geolocation fails
    * use timeout, cache & accuracy - options object
    */
  function getCoordinates(){
    log("inside getcoordinates");
    $('#progress').html("Receiving coordinates...");
    if ('geolocation' in navigator) {
      log("geolocation functionality available");
      navigator
        .geolocation
        .getCurrentPosition(
          showPosition,
          positionError,
          geoOptions);
    }
  }
  var geoOptions={ timeout: 10000,
            maximumAge: 0,
            enableHighAccuracy: true};
  function showPosition(position){
    log("coordinates successfully received inside showPosition");
    locationAvailable=true; //used before asking for weather data
    //store coords for api ajax call
    coordinates.lat=position.coords.latitude;
    coordinates.lon=position.coords.longitude;
    log("inside show position: lat:"
        + coordinates.lat + "lon:" + coordinates.lon);
    //nice to have coordinates display
    /*$("#data").html("latitude: "
        + position.coords.latitude
        + ";longitude: "
        + position.coords.longitude);*/
    getWeather();
  }
  /**
    * call back positionError if geolocation fails
    * show error on screen
    * ignore timeout (browser glitches even on success)
    */
  function positionError(error){
    log("inside position error with error code " + error.code);
    if(error.code==1){
      locationAvailable=false;
      $("#progress").html("Error getting coordinates: Permission denied");
    } else if (error.code==2) {
      locationAvailable=false;
      $("#progress").html("Error: Unable to get location.");
    } else {
      log("unhandled position error 3 - timeout");
      //firefox seems to be returning 3 even after success calls
      //hence, left unhandled
    }
  }

  function getWeather(){
    log("inside getweather");
    if(locationAvailable==false)
      return; //do not proceed further
    log("getWeather: location available");
    $('#progress').html("Receiving weather details...");
    $.ajax( {
      url: apiURL
        + "lat=" + coordinates.lat
        + "&lon=" + coordinates.lon
        + "&appid=" + apiKey,
      success: function(data) {
        weatherAPIData=data; //store response in contrainer for rendering
        var t=new Date();
        $('#progress').html("Weather details updated at "
            + t.toTimeString() + ".");
        log("weather details received");
        renderWeather();
      },
      cache: true
    });
  }
  function renderWeather(){
    if(locationAvailable==false)
      return; //do not proceed further
    log("renderWeather : proceeding");
    $('.temperature').html(weatherAPIData.main.temp);
    $('.unit').html("&deg;C");
    $('.location').html(weatherAPIData.name + ", " + weatherAPIData.sys.country);
    var icon=weatherAPIData.weather[0].icon;
    $('.icon').css("background-image",
        "url('" + iconURL + icon + ".png')");
    /**
      *extras excluded for now
    $('.weather').html(weatherAPIData.weather[0].main
        + " | "
        + weatherAPIData.weather[0].description);
    $('.wind').html("Wind speed"
        + weatherAPIData.wind.speed + "m/s at "
        + weatherAPIData.wind.deg + " degrees");
        */
    if(icon[icon.length-1]=="d"){
      $("body").addClass("day");
      $("body").removeClass("night");
    }else if(icon[icon.length-1]=="n"){
      $("body").addClass("night");
      $("body").removeClass("day");
    }
  }

  // get location and render weather
  // after page load
  log("page loaded");
  getCoordinates();

  /**
    * toggle between celsius and fahrenheit
    * add/remove fontawesome classes
    * calculate and update temperature
    * fahrenheit = (celsius * 9/5)+32
    */
  $('.toggle').on("click",function(){
    var current=$('.unit').text();
    if(current[current.length-1]=="F"){ //check last letter of current text
      var cel=Math.round(weatherAPIData.main.temp*100); //scale up by *100
      cel/=100; //scale down
      $('.temperature').html(cel);
      $('.unit').html("&deg;C");
      $('.toggle').removeClass("fa-toggle-on");
      $('.toggle').addClass("fa-toggle-off");
    } else {
      //calc farenheit and multiply by 100 for scale up (two decimal hack)
      var far=Math.round(((weatherAPIData.main.temp * 9 / 5 )+32)*100);
      far/=100; //scal down to two decimals
      $('.temperature').html(far);
      $('.unit').html("&deg;F");
      $('.toggle').removeClass("fa-toggle-off");
      $('.toggle').addClass("fa-toggle-on");
    }
  });

  /**
    * refresh weather on demand
    */
  $('.get-weather').on("click",function(){
    log("inside Get/Refresh weather button click");
    getCoordinates();
  });
});
