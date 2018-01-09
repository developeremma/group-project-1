var map, infoWindow;
var ObjArray = [];
var cityName;
var service;
var marker;
var MarkerArray = [];
var varType;
var latitude;
var longitude;
var updatePlaceKey;
var updatePlaceType;

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
            }, callback_fb_volunteer_load);

            console.log('All data pushed to FireBase');

        })
    }
}

function callback_fb_volunteer_load(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            insert_into_firebase(results[i]);
        }
    }

    database.ref().child("MapData").child(cityName).child("volunteer").on('child_added', function(childSnapshot) {
        // User input data
        var obj = childSnapshot.val();
        var inputName = obj.name;
        var inputPhone = obj.phone;

        // Append all the values to the table in the HTML
        $("#volunteerTable").append("<tr><td>" + inputName + "</td><td>" + inputPhone + "</td><td>" + "</td></tr>");

        var MarkerLatLng = { lat: obj.latitude, lng: obj.longitude };
        createMarker(MarkerLatLng, 'Volunteer', obj);
    });
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
        /*"reported": 'No',*/
        "latitude": latitude,
        "longitude": longitude,
        "vicinity": place.vicinity,
    });
}

function createMarker(markerlocation, type, Object) {

    switch (type) {
        case 'Volunteer':
            icon_URL = "./assets/images/volunteer.png";
            break;
        case 'Hospital':
            icon_URL = "./assets/images/hospital.png";
            break;
        default:
            icon_URL = "";
    }

    marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: markerlocation,
        icon: icon_URL,
    });

    //Check if the place exists in Firebase , if not insert into Firebase


    google.maps.event.addListener(marker, 'click', function() {
        var infowindow = new google.maps.InfoWindow();

        switch (type) {

            case 'Volunteer':
                infowindow.setContent('<p style="font-weight: bold;"> Volunteer Name : ' + Object.name +
                    '</p> <p style="color:blue;"> Phone : ' + Object.phone + '</p>');
                infowindow.open(map, this);
                break;
            default:
                infowindow.setContent('<p style="font-weight: bold;">' + type + ' Name : ' + Object.name +
                    '</p> <p style="color:blue;"> Is Open : ' + Object.reported + '</p>');
                infowindow.open(map, this);
        }
    });

    if (type != 'Volunteer') {
        MarkerArray.push(marker);
    }
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
        $(".btn-group-vertical").html("");

        obj = snapshot.val();
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                $(".btn-group-vertical").append('<button type="list-button" class="btn btn-danger sosbuttons" place_type=' + obj[key].type + ' place_id="' + obj[key].name.concat(obj[key].place_id) + '" id="listbuttons">' + obj[key].name + '<p> Reported Open ? : ' + obj[key].reported + '</p> </button> ');
//                 $("#map").height(500); 
            }
            var MarkerLatLng = { lat: obj[key].latitude, lng: obj[key].longitude };
            createMarker(MarkerLatLng, 'Hospital', obj[key]);


        }
    });
})

$(document).on('click', '.sosbuttons', function(event) {
    updatePlaceKey = $(this).attr('place_id');
    updatePlaceType = $(this).attr('place_type');
    $('#mapsModal').modal({
        show: true
    });
});

//Modal Event Listners

$('#open').on('click', function() {
    $('#mapsModal').modal('toggle');
    const city = database.ref().child("MapData").child(cityName).child(updatePlaceType);
    var primarykey = updatePlaceKey;

    city.child(primarykey).update({
        "reported": 'Open',
        LastReported : firebase.database.ServerValue.TIMESTAMP,
    });

});


$('#closed').on('click', function() {
    $('#mapsModal').modal('toggle');
    const city = database.ref().child("MapData").child(cityName).child(updatePlaceType);
    var primarykey = updatePlaceKey;

    city.child(primarykey).update({
        "reported": 'Closed',
        LastReported : firebase.database.ServerValue.TIMESTAMP,
    });
});

$('#foodButton').on('click', function(event) {
    

    //Reset Object array

    ObjArray = [];
    clearMarkers();

    database.ref().child('MapData').child(cityName).child('convenience_store').on('value', function(snapshot) {
        //console.log(snapshot.val());
        $(".btn-group-vertical").html("");
        obj = snapshot.val();
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                $(".btn-group-vertical").append('<button type="list-button" class="btn btn-danger sosbuttons" place_type=' + obj[key].type + ' place_id="' + obj[key].name.concat(obj[key].place_id) + '" id="listbuttons">' + obj[key].name + '<p> Reported Open ? : ' + obj[key].reported + '</p> </button> ');
//                 $("#map").height(500);
            }
            var MarkerLatLng = { lat: obj[key].latitude, lng: obj[key].longitude };
            createMarker(MarkerLatLng, 'Store', obj[key]);
            $(".btn-group-vertical").click(function() {
                $('#mapsModal').modal({
                    show: true
                });
            });
        }
    });
})

$('#gasButton').on('click', function(event) {
    $(".btn-group-vertical").html("");

    //Reset Object array

    ObjArray = [];
    clearMarkers();

    database.ref().child('MapData').child(cityName).child('gas_station').on('value', function(snapshot) {
        //console.log(snapshot.val());
        $(".btn-group-vertical").html("");
        obj = snapshot.val();
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                $(".btn-group-vertical").append('<button type="list-button" class="btn btn-danger sosbuttons" place_type=' + obj[key].type + ' place_id="' + obj[key].name.concat(obj[key].place_id) + '" id="listbuttons">' + obj[key].name + '<p> Reported Open ? : ' + obj[key].reported + '</p> </button> ');
//                 $("#map").height(500);
            }
            var MarkerLatLng = { lat: obj[key].latitude, lng: obj[key].longitude };
            createMarker(MarkerLatLng, 'Gas Station', obj[key]);
            $(".btn-group-vertical").click(function() {
                $('#mapsModal').modal({
                    show: true
                });
            });
        }
    });

})

// Initialize Firebase

$("#volunteerSubmit").on('click', function(event) {

    event.preventDefault();

    // Grabs user input
    var inputName = $("#volunteerName").val().trim();
    var inputPhone = $("#volunteerPhone").val().trim();

    // Creates local "temporary" object for holding volunteer data

    // Push new values to the database

    const volunteerRef = database.ref().child("MapData").child(cityName).child("volunteer");
    var volunteerKey = inputName.concat(inputPhone); //Primary

    volunteerRef.child(volunteerKey).update({
        name: inputName,
        phone: inputPhone,
        city: cityName,
        latitude: pos.lat,
        longitude: pos.lng
    });
    // Clear out text fields after submit
    $("#volunteerName").val("");
    $("#volunteerPhone").val("");
});
