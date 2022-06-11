(function () {

  'use strict';

  var iqama_ranges;
  var prayer_times_ranges;

  helpers.config().success(function (data) {
    // Fill in known information
    $("#org_name").val(data['org_name']);
    $("#location").val(data['location']);
    $("#tz_offset").val(data['tz_offset']);
    $("#lat").val(data['lat']);
    $("#lng").val(data['lng']);
    $("#prayer_time_url").val(data['prayer_time_url']);
    $("#announcements").prop('checked', data['announcements'] === 'true');
  });

  $(document).ready(function () {
    $("#config").submit(function (e) {
      e.preventDefault();
      var formData = {};
      $("#config").find("input[name]").each(function (index, node) {
        if (node.name == 'announcements') {
          formData[node.name] = node.checked;
        } else {
          formData[node.name] = node.value;
        }
      });
      $.post('/config', formData).done(function (res) {
        if (res.response.status == "OK") {
          helpers.alert('success', 'Configuration updated successfully!');
        } else {
          helpers.alert('danger', 'Error updating configuration.');
        }
      });
    });

    $("#iqama-tab").click(function () {
      $("#iqama_objs").empty()
      helpers.asyncIqama().success(function (data) {
        iqama_ranges = JSON.parse(data);

        for (var key in iqama_ranges['iqamas']) {
          var times = iqama_ranges['iqamas'][key];
          var el = helpers.iqama_row(key.split("-")[0], key.split("-")[1],
              times);
          $("#iqama_objs").append(el);

          $(el).on('click', '.glyphicon-remove', function () {
            removeRange(this);
          });
        }
      });
    });

    $("#prayer-times-tab").click(function () {
      $("#prayer-times_objs").find("tr:gt(0)").remove()
      helpers.asyncPrayerTimesFromConfig().success(function (data) {
        prayer_times_ranges = data;
        for (let key in prayer_times_ranges['prayer_times']) {
          let times = prayer_times_ranges['prayer_times'][key];
          let el = helpers.prayer_times_row(key.split("-")[0],
              key.split("-")[1], times);
          $("#prayer-times_objs").append(el);
          $(el).on('click', '.glyphicon-remove', function () {
            removePrayerTimeRange(this);
          });
        }
      });
    });

    $("#new_range").click(function () {
      var valid = true;
      $('input', $(this).closest('tr')).each(function () {
        valid = valid && this.checkValidity();
      });
      if (valid) {
        addRange();
      } else {
        helpers.alert('danger', 'Please follow the format listed.');
      }
    });

    $("#new_pt_range").click(function () {
      let valid = true;
      $('input', $(this).closest('tr')).each(function () {
        valid = valid && this.checkValidity();
        if (!valid) {
          this.classList.add('has-error')
        } else {
          this.classList.remove('has-error')
        }
      });
      if (valid) {
        addPrayerTimesRange();
      } else {
        helpers.alert('danger', 'Please follow the format listed.');
      }
    });

  });

  function removeRange(el) {
    var key = $(el).closest('tr').attr('id');
    delete iqama_ranges['iqamas'][key];
    $(el).closest('tr').remove();
    helpers.asyncUpdateIqamas(iqama_ranges).success(function (res) {
      if (res.response.status == "OK") {
        helpers.alert('success', 'Iqama ranges updated successfully!');
      } else {
        helpers.alert('danger', 'Error updating iqama ranges.');
      }
    });
  }

  function addRange() {
    var range = [$("#i_start").val(), $("#i_end").val()].join("-");
    var new_range = {
      'fajr': $("#i_fajr").val(),
      'dhuhr': $("#i_dhuhr").val(),
      'asr': $("#i_asr").val(),
      'maghrib': $("#i_maghrib").val(),
      'isha': $("#i_isha").val()
    }
    iqama_ranges['iqamas'][range] = new_range;

    var el = helpers.iqama_row($("#i_start").val(), $("#i_end").val(),
        new_range);
    $("#iqama_objs").append(el);

    $(el).on('click', '.glyphicon-remove', function () {
      removeRange(this);
    });

    $('input', $("#new_range").closest('tr')).each(function () {
      $(this).val('');
    });

    helpers.asyncUpdateIqamas(iqama_ranges).success(function (res) {
      if (res.response.status == "OK") {
        helpers.alert('success', 'Iqama ranges updated successfully!');
      } else {
        helpers.alert('danger', 'Error updating iqama ranges.');
      }
    });
  }

  function addPrayerTimesRange() {
    let range = [$("#pt_start").val(), $("#pt_end").val()].join("-");
    let new_range = {
      'fajr_a': $("#fajr_a").val(),
      'fajr_i': $("#fajr_i").val(),
      'dhuhr_a': $("#dhuhr_a").val(),
      'dhuhr_i': $("#dhuhr_a").val(),
      'asr_a': $("#asr_a").val(),
      'asr_i': $("#asr_i").val(),
      'maghrib_a': $("#maghrib_a").val(),
      'maghrib_i': $("#maghrib_i").val(),
      'isha_a': $("#isha_a").val(),
      'isha_i': $("#isha_i").val(),
      'jumma1_a': $("#jumma1_a").val(),
      'jumma1_i': $("#jumma1_i").val(),
      'jumma2_a': $("#jumma2_a").val(),
      'jumma2_i': $("#jumma2_i").val(),
    }
    prayer_times_ranges['prayer_times'][range] = new_range;

    let el = helpers.prayer_times_row($("#pt_start").val(),
        $("#pt_start").val(), new_range);
    $("#prayer-times_objs").append(el);

    $(el).on('click', '.glyphicon-remove', function () {
      removePrayerTimeRange(this);
    });

    $('input', $("#new_pt_range").closest('tr')).each(function () {
      $(this).val('');
    });

    savePrayerTimes(prayer_times_ranges);
  }

  function removePrayerTimeRange(el) {
    let key = $(el).closest('tr').attr('id');
    delete prayer_times_ranges['prayer_times'][key];
    $(el).closest('tr').remove();
    savePrayerTimes(prayer_times_ranges);
  }

  function savePrayerTimes(newValues) {
    helpers.asyncUpdatePrayerTimes(newValues).success(function (res) {
      if (res.response.status == "OK") {
        helpers.alert('success', 'Prayer times updated successfully!');
      } else {
        helpers.alert('danger', 'Error updating prayer times.');
      }
    });
  }

})();
