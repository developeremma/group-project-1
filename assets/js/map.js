var map, infoWindow;
var ObjArray = [];
var cityName;
var service;
var marker;
var MarkerArray = [];
var varType;
var latitude;
var longitude;

var pos = { lat: 37.7918126, lng: -122.3937578 }; //shiv: Do not remove these, it will get overwritten

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCsKeWe6ioIHzQYmJII_t3Ot09R6xC1Lp8",
    authDomain: "sosproject-12b7e.firebaseapp.com",
    databaseURL: "https://sosproject-12b7e.firebaseio.com",
    projectId: "sosproject-12b7e",
    storageBucket: "",
    messagingSenderId: "872847968348"
};

firebase.initializeApp(config);

var database = firebase.database();

function initMap() {
    if (navigator.geolocation) //geo location API
    {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            map = new google.maps.Map(document.getElementById('map'), {
                center: pos,
                zoom: 15
            });

            service = new google.maps.places.PlacesService(map);

            infoWindow = new google.maps.InfoWindow();

            infoWindow.setPosition(pos);
            infoWindow.setContent('<p style="color:red;font-weight: bold;">You are stuck here !!!</p><img style ="width:110px;height:50px;" src="./assets/images/stuck.jpg">');
            infoWindow.open(map);
            map.setCenter(pos);

            // Load all the data in firebase in case it does not exist.

            service.nearbySearch({
                location: pos,
                radius: 1500,
                type: ['convenience_store']
            }, callback_fb_load);

            service.nearbySearch({
                location: pos,
                radius: 1500,
                type: ['hospital']
            }, callback_fb_load);

            service.nearbySearch({
                location: pos,
                radius: 1500,
                type: ['gas_station']
            }, callback_fb_load);

        })
        console.log('All data pushed to FireBase');
    }
    //Load all the data into firebase:
}

function callback_fb_load(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            insert_into_firebase(results[i]);
        }
    }
}

function insert_into_firebase(place) {
    name = place.name;
    place_id = place.place_id;
    is_open = 'not_reported';
    latitude = place.geometry.location.lat();
    longitude = place.geometry.location.lng();
    type = place.types[0];

    cityName = place.vicinity.substring(place.vicinity.lastIndexOf(',') + 1, 100).trim();

    const city = database.ref().child("MapData").child(cityName).child(type);
    var primarykey = name.concat(place_id);

    city.child(primarykey).update({
        "name": name,
        "type": type,
        "place_id": place_id,
        "reported": 'No',
        /*"report": Open, sh: used update instead of set so that this field can be set later */
        "latitude": latitude,
        "longitude": longitude,
        "vicinity": place.vicinity,

    });

}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            ObjArray.push(results[i]);
        }
    }
}

function createMarker(markerlocation, isOpen) {

    var green_URL = ""

    if (isOpen == "Yes") {
        green_URL = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    }

    marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: markerlocation,
        icon: green_URL,
    });

    //Check if the place exists in Firebase , if not insert into Firebase

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });

    MarkerArray.push(marker);
}



function clearMarkers() {
    for (var i = 0; i < MarkerArray.length; i++) {
        MarkerArray[i].setMap(null);
    }
}


//Event handlers 

$('#hospitalsButton').on('click', function(event) {

    ObjArray = [];
    clearMarkers();

    //Reset Object array
    database.ref().child('MapData').child(cityName).child('hospital').on('value', function(snapshot) {
        //console.log(snapshot.val());
        $(".list-group").html("");

        obj = snapshot.val();
        console.log(obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                $(".list-group").append('<li class="list-group-item">' + obj[key].name + '<p> Reported Open ? : ' + obj[key].reported + '</p> </li> ');
                $("#map").height(500); //sh : why are we doing this ??
            }
            var MarkerLatLng = { lat: obj[key].latitude, lng: obj[key].longitude };
            createMarker(MarkerLatLng, obj[key].reported);
        }
    });
})

$('#foodButton').on('click', function(event) {
    $(".list-group").html("");

    //Reset Object array

    ObjArray = [];
    clearMarkers();

    database.ref().child('MapData').child(cityName).child('convenience_store').on('value', function(snapshot) {
        //console.log(snapshot.val());
        obj = snapshot.val();
        console.log(obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                $(".list-group").append('<li class="list-group-item">' + obj[key].name + '<p> Reported Open ? : ' + obj[key].reported + '</p> </li> ');
                $("#map").height(500);
            }
            var MarkerLatLng = { lat: obj[key].latitude, lng: obj[key].longitude };
            createMarker(MarkerLatLng, obj[key].reported);
        }
    });
})

$('#gasButton').on('click', function(event) {
    $(".list-group").html("");

    //Reset Object array

    ObjArray = [];
    clearMarkers();

    database.ref().child('MapData').child(cityName).child('gas_station').on('value', function(snapshot) {
        //console.log(snapshot.val());
        obj = snapshot.val();
        console.log(obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                $(".list-group").append('<li class="list-group-item">' + obj[key].name + '<p> Report Open ? : ' + obj[key].reported + '</p> </li> ');
                $("#map").height(500);
            }
            var MarkerLatLng = { lat: obj[key].latitude, lng: obj[key].longitude };
            createMarker(MarkerLatLng, obj[key].reported);
        }
    });

})
