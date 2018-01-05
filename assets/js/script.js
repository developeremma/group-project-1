    var map;
    var infowindow;
    var ObjArray=[];
    var service;
    var marker;
    var pos = { lat: 37.7918126, lng: -122.3937578 }; //shiv: Do not remove these, it will get overwritten

    function initMap() {
        if (navigator.geolocation) //geo location API
        {
            navigator.geolocation.getCurrentPosition( function(position) 
                                                      {
                                                          pos = { lat: position.coords.latitude,
                                                                  lng: position.coords.longitude
                                                                }
                                                        }
                                                     )
        }

        map = new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 15
        });

        infowindow = new google.maps.InfoWindow();

        service = new google.maps.places.PlacesService(map);

        service.nearbySearch({
            location: pos,
            radius: 1500,
            type: ['hospital']
        }, callback);

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

    function createMarker(place) 
    {
        var placeLoc = place.geometry.location;
         marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });

    }

    function clearMarkers()
    {
       marker.setMap(null); 
    }

  
//Event handlers 

  $('#store').on('click',function(event){
           
            //Reset Object array

            ObjArray=[];
            /*clearMarkers();*/

            service.nearbySearch({
            location: pos,
            radius: 1500,
            type: ['department_store']
        }, callback);

  })

  $('#store').on('click',function(event){
           
            //Reset Object array

            ObjArray=[];
            /*clearMarkers();*/

            service.nearbySearch({
            location: pos,
            radius: 1500,
            type: ['pharmacy']
        }, callback);

  })