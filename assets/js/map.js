    var map;
    var infowindow;
    var ObjArray=[];
    var MarkerArray=[];
    var service;
    var marker;
    var varType;
    var latitude;
    var longitude;
    var pos = { lat: 37.7918126, lng: -122.3937578 }; //shiv: Do not remove these, it will get overwritten
    
    /* 
    
    comment firebase stuff
    
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
*/
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
            })
        }
    }

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) 
        {
            for (var i = 0; i < results.length; i++) 
            {
                createMarker(results[i]);
                ObjArray.push(results[i]); 


                // Will hold all the objects of the current type;
                console.log(ObjArray[i]);
            }
        }
    }

        function createMarker(place) {
        var placeLoc = place.geometry.location;

        marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        //Check if the place exists in Firebase , if not insert into Firebase

/*
          name = place.name;
	      place_id = place.place_id;
	      is_open = true;
	      latitude = place.geometry.location.lat();
	      longitude = place.geometry.location.lng(); 
	      type=place.types[0];

	      // Change what is saved in firebase
	      
	      database.ref().push({
	        		name: name,
	        		type : type, 
	        		place_id: place_id,
	        		is_open: is_open,
	        		latitude: latitude,
				longitude: longitude
		    });
*/

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
        MarkerArray.push(marker);
    }

    function clearMarkers() 
    {
   		for (var i = 0; i < MarkerArray.length; i++ ) 
   		{
    		MarkerArray[i].setMap(null);
    	}
   }

  
//Event handlers 

  $('#hospitalsButton').on('click',function(event){
            $(".list-group").html("");

            //Reset Object array

            ObjArray=[];
            clearMarkers();

            service.nearbySearch({
            location: pos,
            radius: 1500,
            type: ['hospitals']
        }, callback);
 	for(var i=0; i< 10; i++){

    		$(".list-group").append('<li class="list-group-item">'+ObjArray.name+"</li>");
		 $("#map").height(500);
    }
  })

  $('#foodButton').on('click',function(event){
            $(".list-group").html("");

            //Reset Object array

            ObjArray=[];
            clearMarkers();

            service.nearbySearch({
            location: pos,
            radius: 1500,
            type: ['restaurant']
        }, callback);
   for(var i=0; i< 10; i++){

    $(".list-group").append('<li class="list-group-item">'+ObjArray.name+"</li>");
    $("#map").height(500);
    }
  })
  $('#gasButton').on('click',function(event){
    $(".list-group").html("");

            //Reset Object array

            ObjArray=[];
            clearMarkers();

            service.nearbySearch({
            location: pos,
            radius: 1500,
            type: ['gas_station']
        }, callback);
         for(var i=0; i< 10; i++){
    $(".list-group").append('<li class="list-group-item">'+ObjArray.name+"</li>");
    $("#map").height(500);
    }
  })
