// configure and declare firebase
var config = {
    apiKey: "AIzaSyAymzKB2MeA0jYRXxUDR6bYNN0gTqHXX0A",
    authDomain: "nphopper-b2f2d.firebaseapp.com",
    databaseURL: "https://nphopper-b2f2d.firebaseio.com",
    projectId: "nphopper-b2f2d",
    storageBucket: "nphopper-b2f2d.appspot.com",
    messagingSenderId: "643486232483"
};
firebase.initializeApp(config);
var database = firebase.database();

var mapPointsArray;

// array for dropdown options
var stateAbbr = ["AL", "AK", "AZ", "AR", "CA", "CO",
    "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL",
    "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA",
    "MI", "MN", "MS", "MO", "MT", "NB", "NV", "NH",
    "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
    "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY"];


// object containing center lat lng for each state. Used if park does not have a listed latLong.
var stateLatLng = {
    "AL": [32.806671, -86.79113], "AK": [61.370716, -152.404419], "AZ": [33.729759, -111.431221], "AR": [34.969704, -92.373123],
    "CA": [36.116203, -119.681564], "CO": [39.059811, -105.311104], "CT": [41.597782, -72.755371], "DE": [39.318523, -75.507141],
    "DC": [38.897438, -77.026817], "FL": [27.766279, -81.686783], "GA": [33.040619, -83.643074], "HI": [21.094318, -157.498337],
    "ID": [44.240459, -114.478828], "IL": [40.349457, -88.986137], "IN": [39.849426, -86.258278], "IA": [42.011539, -93.210526],
    "KS": [38.5266, -96.726486], "KY": [37.66814, -84.670067], "LA": [31.169546, -91.867805], "ME": [44.693947, -69.381927],
    "MD": [39.063946, -76.802101], "MA": [42.230171, -71.530106], "MI": [43.326618, -84.536095], "MN": [45.694454, -93.900192],
    "MS": [32.741646, -89.678696], "MO": [38.456085, -92.288368], "MT": [46.921925, -110.454353], "NB": [41.12537, -98.268082],
    "NV": [38.313515, -117.055374], "NH": [43.452492, -71.563896], "NJ": [40.298904, -74.521011], "NM": [34.840515, -106.248482],
    "NY": [42.165726, -74.948051], "NC": [35.630066, -79.806419], "ND": [47.528912, -99.784012], "OH": [40.388783, -82.764915],
    "OK": [35.565342, -96.928917], "OR": [44.572021, -122.070938], "PA": [40.590752, -77.209755], "RI": [41.680893, -71.51178],
    "SC": [33.856892, -80.945007], "SD": [44.299782, -99.438828], "TN": [35.747845, -86.692345], "TX": [31.054487, -97.563461],
    "UT": [40.150032, -111.862434], "VT": [44.045876, -72.710686], "VA": [37.769337, -78.169968], "WA": [47.400902, -121.490494],
    "WV": [38.491226, -80.954453], "WI": [44.268543, -89.616508], "WY": [42.755966, -107.30249]
}

// loop through dropdown options to create list items
for (let i = 0; i < stateAbbr.length; i++) {
    var listItem = $("<li>");
    var stateLink = $("<a>").addClass("stateAbbr").attr("id", stateAbbr[i]).text(stateAbbr[i]);
    $("#mydropdown").append(listItem.append(stateLink));
}

// declare parks object
var parks = {};

// onclick for dropdown state selection
$(".stateAbbr").on("click", function (event) {
    event.preventDefault();
    $("#park-cards").empty();
    $("#info-weather").empty();
    $("#info-weather").html("<p>Click an Info button to learn more about the park</p>");

    var stateName = $(this).attr('id');

    // National Parks AJAX GET request
    var queryUrlPark = "https://developer.nps.gov/api/v1/parks?stateCode=" + stateName + "&api_key=lxOPi608bnDQFfAJ9UkWno5bLkgRjppyRS1Rpa3l";
    $.ajax({
        url: queryUrlPark,
        method: "GET"
    }).then(function (res) {
        mapPointsArray = [];
        for (i = 0; i < res.data.length; i++) {
            parkCode = res.data[i].parkCode;
            parkName = res.data[i].name;
            parkDesignation = res.data[i].designation;
            parkDescription = res.data[i].description;
            parkUrl = res.data[i].url;
            parkDirectionsUrl = res.data[i].directionsUrl;
            var [parkLat, parkLng] = res.data[i].latLong.split(",").map(function (str) { return str.substring(str.indexOf(":") + 1) });
            // Parks without a latLong pinned on the middle of state.
            // Google Maps centers automatically on middle of state.
            if (res.data[i].latLong == "") {
                parkLat = stateLatLng[stateName][0];
                parkLng = stateLatLng[stateName][1];
            }
            var checked;
            displayIndex = i + 1;
            mapPointsArray.push([displayIndex, stateName, parkLat, parkLng]);

            var parkInfo = {
                stateName,
                parkCode,
                parkName,
                parkDesignation,
                parkDescription,
                parkUrl,
                parkDirectionsUrl,
                parkLat,
                parkLng,
                checked,
                displayIndex
            }
            parks[i] = parkInfo;

            var newCard = $("<div class='card'>");
            newCard.append("<p><h6>" + displayIndex + ") " + parkName + " " + parkDesignation + "</h6></p>");
            newCard.append("<p><label><input type='checkbox' class='filled-in parkCheck' id='check-" + parkCode + "' value='" + i + "'><span>Visited</span></label>");
            newCard.append("</p><a class='waves-effect waves-light btn-small parkInfoButton' id='btn-" + parkCode + "' value='" + i + "'>info</a>");
            $("#park-cards").append(newCard);

            database.ref(parkCode).on('value', function (snapshot) {
                if (snapshot.val().checked) {
                    $(`#check-${snapshot.val().parkCode}`).attr('checked', true)
                }
            });
        }

        initMap();

        $(".parkInfoButton").on("click", function (event) {
            $("#info-weather").empty();
            buttonIndex = $(this).attr("value")
            var infoCard = $("<div class='card'>");
            infoCard.append("<p><h6>" + parks["" + buttonIndex + ""].displayIndex + ") " + parks["" + buttonIndex + ""].parkName + " " + parks["" + buttonIndex + ""].parkDesignation + "</h6></p>");
            infoCard.append("<p>" + parks["" + buttonIndex + ""].parkDescription + "</p>");
            infoCard.append("<p><h6><a href=" + parks["" + buttonIndex + ""].parkUrl + ">National Parks Website</a></h6></p>");
            infoCard.append("<p><h6><a href=" + parks["" + buttonIndex + ""].parkDirectionsUrl + ">Directions</a></h6></p>");
            $("#info-weather").append(infoCard);
        });

        $(".parkCheck").on("click", function (event) {
            if (this.checked) {
                parks[$(this).val()].checked = true;
                database.ref(parks[$(this).val()].parkCode).set(parks[$(this).val()]);
            }
            else {
                parks[$(this).val()].checked = false;
                database.ref(parks[$(this).val()].parkCode).set(parks[$(this).val()]);
            }
        });
    });
});

var map;
function initMap() {
    if (Array.isArray(mapPointsArray) && mapPointsArray.length > 0) {
        stateName = mapPointsArray[0][1];
        stateLat = stateLatLng[stateName][0];
        stateLng = stateLatLng[stateName][1];

        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: stateLat, lng: stateLng },
            zoom: 6
        });

        for (i = 0; i < mapPointsArray.length; i++) {
            stateParkLat = mapPointsArray[i][2];
            stateParkLng = mapPointsArray[i][3];
            stateIndex = i + 1
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(stateParkLat, stateParkLng),
                map: map,
                label: "" + stateIndex + ""
            });
        }
    }
    else {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 2
        });
    }
}