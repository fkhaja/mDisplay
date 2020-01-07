(function() {

  'use strict';

  var iqama_ranges;
  
  helpers.asyncConfig().success(function(data) {
    
    // Fill in known information
    $("#org_name").val(data['org_name']);
    $("#location").val(data['location']);
    $("#tz_offset").val(data['tz_offset']);
  });

  $(document).ready(function() {
    $("#config").submit(function(e){
      e.preventDefault();
      var formData = {};
      $("#config").find("input[name]").each(function (index, node) {
        formData[node.name] = node.value;
      });
      var address_text = formData.location;
      
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address_text }, function(results, status, err) {
        if (err) {
          console.log(err)
        }
        if (status == google.maps.GeocoderStatus.OK) {
          var pos = results[0].geometry.location;
          formData.lat = pos.lat();
          formData.lng = pos.lng();
          $.post('/config', formData).done(function(res) {
            if(res.response.status == "OK") {
              helpers.alert('success', 'Configuration updated successfully!');
            } else {
              helpers.alert('danger', 'Error updating configuration.');
            }
          });
        }
      }); 
    });

    $("#get-location").click(function(e) {
      e.preventDefault();
      populateLocation();
    }); 

    $("#iqama-tab").click(function() {
      helpers.asyncIqama().success(function(data) {
        iqama_ranges = JSON.parse(data);

        for(var key in iqama_ranges['iqamas']) {
          var times = iqama_ranges['iqamas'][key];
          var el = helpers.iqama_row(key.split("-")[0], key.split("-")[1], times);
          $("#iqama_objs").append(el);

          $(el).on('click', '.glyphicon-remove', function() {
            removeRange(this);
          });
        }

      });
    });

    $("#new_range").click(function() {
      var valid = true;
      $('input', $(this).closest('tr')).each(function() { 
        valid = valid && this.checkValidity(); 
      });
      if(valid) {
        addRange();
      } else {
        helpers.alert('danger', 'Please follow the format listed.');
      }
    });

  });

  function populateLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var geocoder = new google.maps.Geocoder();
          geocoder.geocode({ 'address': pos['lat'] + ',' + pos['lng'] }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              $('#location').val(results[0].formatted_address);
            }
          }); 
      }, function() {
        handleLocationError(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false);
    }
  }
  

  function handleLocationError(browserHasGeolocation) {
    browserHasGeolocation ?
                          alert('Error: The Geolocation service failed.') :
                          alert('Error: Your browser doesn\'t support geolocation.');
  }

  function removeRange(el) {
    var key = $(el).closest('tr').attr('id');
    delete iqama_ranges['iqamas'][key];
    $(el).closest('tr').remove();           
    helpers.asyncUpdateIqamas(iqama_ranges).success(function(res){
      if(res.response.status == "OK") {
        helpers.alert('success', 'Iqama ranges updated successfully!');
      } else {
        helpers.alert('danger', 'Error updating iqama ranges.');
      }
    });
  }

  function addRange() {
    var range = [$("#i_start").val(), $("#i_end").val()].join("-");
    var new_range  = {
      'fajr': $("#i_fajr").val(),
      'dhuhr': $("#i_dhuhr").val(),
      'asr': $("#i_asr").val(),
      'maghrib': $("#i_maghrib").val(),
      'isha': $("#i_isha").val()
    }
    iqama_ranges['iqamas'][range] = new_range;

    var el = helpers.iqama_row($("#i_start").val(), $("#i_end").val(), new_range);
    $("#iqama_objs").append(el);

    $(el).on('click', '.glyphicon-remove', function() {
      removeRange(this);
    });

    $('input', $("#new_range").closest('tr')).each(function() { 
        $(this).val(''); 
      });
               
    helpers.asyncUpdateIqamas(iqama_ranges).success(function(res){
      if(res.response.status == "OK") {
        helpers.alert('success', 'Iqama ranges updated successfully!');
      } else {
        helpers.alert('danger', 'Error updating iqama ranges.');
      }
    });
  }


})();
