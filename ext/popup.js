// This is the main script file for the LIFX Chrome Extension
// This script is composed by a block of helper functions that make--
// --calls to the LIFX and block flow functions that exceute the logic--
// --of the view.

//TOKEN and :SELECTOR are defined globally so they don't need to be passed.


// Note: LIFX API allows CORS so we can directly cURL from the client side
// without additional headers.


//------------------------------Helper Functions----------------------------- //


// cURL Request to Check for Available Lights. Also checking if Token is valid via
// status code.
function availableLights(){
  $.ajax({
   url: "https://api.lifx.com/v1/lights/all/",
   beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer" + " " + tokenLIFX);
   },
   type: 'GET',
   dataType: 'json',
   contentType: 'application/json',
   processData: false,
   data: '',
   success: function (data) {
    //this block of code parses the available lights and populates the dropdown to select them.
      var lightsArray = [];
      $.each(data, function(i, lightObject){
        var lightTuple = []; // Here I'm using an internal temporary--
        //--array to create a nested array that works as a tuple [lightID:light:Label]
        lightTuple.push(lightObject.id); // Adding Light ID to the Tuple.
        lightTuple.push(lightObject.label); // Adding LightLabel to the Tuple.
        lightsArray.push(lightTuple)
        console.log(lightsArray);
      });

      $.each(lightsArray, function(i, lightInfo){
        console.log()
        $("#dropdownBulb").append('<option value="' + lightInfo[0] +'">' + lightInfo[1] + '</option>');
        });

      //This block of code setups all the UI if successful. It also sets up selector = all as default.
      selector = "all"; // Defining Selector as "All" Initially
      $('#tokenSection').hide(); //hide the token section and show controls.
      $('#bulbSection').show();
      $('#brightSection').show();
      $('#colorSection').show();
  },
    error: function () {
      //Alert that Token is Invalid.
      revealSnackbar();
      //purging the local memory
      chrome.storage.local.remove("token");
   }
  });
}


// cURL Request to Change Brightness with LIFX API.
function changeBright(brightValue, powerState){
  var dataBright = {
                    "brightness" : brightValue,
                    "power": powerState
                  }
  $.ajax({
   url: "https://api.lifx.com/v1/lights/"+ selector +"/state",
   beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer" + " " + tokenLIFX);
   },
   type: 'PUT',
   dataType: 'json',
   contentType: 'application/json',
   processData: false,
   data: JSON.stringify(dataBright),
   success: function (data) {
    //alert(JSON.stringify(data));
      console.log("Brightish..");
  },
    error: function () {
      console.log(dataBright);
   }
  });
}


// cURL Request to Change Color with LIFX API.
function changeColor(hexValue){
  var dataColor = {
                    "color" : hexValue
                  }
  $.ajax({
   url: "https://api.lifx.com/v1/lights/"+ selector +"/state",
   beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer" + " " + tokenLIFX);
   },
   type: 'PUT',
   dataType: 'json',
   contentType: 'application/json',
   processData: false,
   data: JSON.stringify(dataColor),
   success: function (data) {
    //alert(JSON.stringify(data));
      console.log("Brightish..");
  },
    error: function () {
      console.log(dataBright);
   }
  });
}

// UI-Function

function revealSnackbar() {
  var notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar(
    {
      message: 'Invalid Token'
    }
  );
}



//------------------------------  Flow Functions----------------------------- //


// Get LIFX Token From User. This function runs when the user submits the Token.
// if availablelights(); gets a 200 status code then the token is saved
// in the local storage.
function getToken (){
  $("#submitValue").click(function(){
    tokenLIFX = $("#field").val(); //Global Variable
    availableLights(); // Getting available lights
    var obj = {'token': tokenLIFX};
    // Save it using the Chrome extension storage API.
    chrome.storage.local.set(obj, function() {
      // Notify that we saved.
      console.log('Token saved');
    });
  });
}


// 1) Get Valid Token if not available. Continue if available.
// This function would run first checking for available tokens
// in the local storage. If there's not an available token, then
// it would define the state necessary to get one (View wise).
chrome.storage.local.get("token", function (result){
    tokenLIFX = result.token
    if (typeof tokenLIFX == "string" ){
      // Hide Submit Token Section
      console.log("token is stored!")
      $('#tokenSection').hide();
      availableLights();
    } else {
      console.log("token is NOT stored!");
      getToken();
      $('#bulbSection').hide();
      $('#brightSection').hide();
      $('#colorSection').hide();
    }
});



/// These functions are mainly controls to select bulbs and
/// change their color and brightness.

// 2) Listen for Bulb Selection :Selector
$('#dropdownBulb').change(
  function(){
    selector = $("#dropdownBulb").val(); //Global Variable
});


// Brightness Control
$('input#slider').change(
function(){
    var sliderValue = $(this).val();
    if (sliderValue == 0) {
        changeBright(0, "off");
    } else if (sliderValue == 1) {
      changeBright(0.3, "on");
    } else if (sliderValue == 2) {
      changeBright(0.6, "on");
    } else if (sliderValue == 3) {
      changeBright(1, "on");
    }
});

// Color Control
$('input[type=radio]').change(
function(){
    var colorId = $(this).attr('id');
    if (colorId == "red-filter") {
        changeColor("#D34D29");
    } else if (colorId == "orange-filter") {
        changeColor("#EAA245");
    } else if (colorId == "yellow-filter") {
        changeColor("#E5D14B");
    } else if (colorId == "green-filter") {
        changeColor("#8AB62E");
    } else if (colorId == "teal-filter") {
        changeColor("#73AB96");
    } else if (colorId == "blue-filter") {
        changeColor("#709DD3");
    } else if (colorId == "purple-filter") {
        changeColor("#8A7DB2");
    } else if (colorId == "pink-filter") {
        changeColor("#BC82A8");
    } else if (colorId == "neutral-filter") {
        changeColor("#F4F5E9");
    } else if (colorId == "classic-filter") {
        changeColor("#FFFF99");
    }

});











