var helpers = (function() {
  let _helpers = {};

  // Determine if a date is between a start and end
  // date --> expects format of 'MM/DD'
  // range -> expects format of 'MM/DD-MM/DD'
  _helpers.isBetween = function(date, range) {
    let month_num = range.split("-")[0].split("/")[0],
        final_day = range.split("-")[1].split("/")[1];

    return date.split("/")[0] == month_num && date.split("/")[1] <= final_day;
  };

  // Make and return a moment object from a time
  // time --> expects format of 'h:mm am/pm'
  _helpers.makeMoment = function(time) {
    return moment(moment().format("YYYY-MM-DD") + " " + time, 'YYYY-MM-DD h:mm a');
  };

  // Find info for next prayer based on today's iqama times and current time
  // [returns fajr if current time is after isha]
  // iqama_times -> hash of iqama times for today
  // pray_times --> hash of prayer times for today
  // m_i_time ----> Maghrib's iqama time (since it depends on athan time)
  _helpers.nextPrayerInfo = function(prayer_times, pray_times, m_i_time) {
    let now = moment(),
        info = {};

    prayer_times['maghrib'] = m_i_time.split(" ")[0];

    // for(let prayer in prayer_times) {
    //   prayer == 'fajr' ? prayer_times[prayer] += " am" : prayer_times[prayer] += " pm";
    // }

    for(let prayer in prayer_times) {
      let iqama_moment = this.makeMoment(prayer_times[prayer]),
          pray_moment  = this.makeMoment(pray_times[prayer]);

      if (now.diff(iqama_moment) < 0) {
        info['prayer'] = prayer[0].toUpperCase() + prayer.slice(1);
        info['arabic'] = this.toArabic(prayer);
        info['iqama'] = now.to(iqama_moment);
        info['athan'] = now.to(pray_moment);
        break;
      }
    }

    if(!info['prayer']) {
      info['prayer'] = 'Fajr';
      info['arabic'] = this.toArabic('fajr');
      info['iqama']  = now.to(this.makeMoment(prayer_times['fajr']).add(1, 'd'));
      info['athan']  = now.to(this.makeMoment(pray_times['fajr']).add(1, 'd'));
    }

    return info;
  };

  // Finds the correct iqama date range based on today's date
  // data --> JSON file with all iqama date ranges
  _helpers.getIqamaRange = function(data) {
    let today = moment().format("MM/DD"),
          key = "";

      for(var range in data['iqamas']) {
        if (helpers.isBetween(today, range)) {
          key = range;
          break;
        }
      }

    return data['iqamas'][range];
  };

  // Finds the correct iqama date range based on today's date
  // data --> JSON file with all iqama date ranges
  _helpers.getPrayerTimesRange = function(data) {
    let today = moment().format("MM/DD"),
        key = "";

    for(var range in data['prayer_times']) {
      if (helpers.isBetween(today, range)) {
        key = range;
        break;
      }
    }

    return data['prayer_times'][range];
  };

  // Async fetches the iqamas JSON file
  _helpers.asyncIqamas = function() {
    return $.ajax({
      url: 'data/iqamas.json',
      dataType: "json"
    });
  };

  // Async call to fetch filenames from announcments folder
  _helpers.asyncAnnouncements = function() {
    return $.ajax({
      url: 'slides'
    });
  }

  // Async call to fetch config details
  _helpers.config = function () {
   return $.ajax({
      url: "config-detail",
     async: false
   });
  }

  // Async call to fetch iqama times
  _helpers.asyncIqama = function() {
   return $.ajax({
      url: "iqamas"
    });
  }

  // Async call to fetch iqama times
  _helpers.asyncPrayerTimesFromConfig = function() {
    return $.ajax({
      url: "prayerTimesFromConfig"
    });
  }

  // Async call to fetch iqama times
  _helpers.asyncPrayerTimesFromUrl = function() {
    return $.ajax({
      url: "prayerTimesFromUrl"
    });
  }

  // Async call to update iqama ranges
  _helpers.asyncUpdateIqamas = function(data) {
    return $.ajax({
      url:'/iqama-update',
      type:"POST",
      data:JSON.stringify(data),
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    });
  }

  // Async call to update iqama ranges
  _helpers.asyncUpdatePrayerTimes = function(data) {
    return $.ajax({
      url:'/prayer-times-update',
      type:"POST",
      data:JSON.stringify(data),
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    });
  }

  // Returns the arabic word for the given prayer
  // prayer --> english word, non-capitalized
  _helpers.toArabic = function(prayer) {
    var arabics = {'fajr': 'الفجر', 'dhuhr': 'الظهر', 'asr': 'العصر', 'maghrib': 'المغرب', 'isha': 'العشاء' };

    return arabics[prayer];
  }

  // Display an alert of the type given with the intended message
  // Uses the generic Bootstrap types [success, danger, warning, etc]
  _helpers.alert = function(type, message) {
    $('#alert').html('' +
      '<div class="alert alert-' + type + ' alert-dismissible" role="alert" auto-close="2000">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        '<span>' +
          message +
        '</span>' +
      '</div>');

    setTimeout(function() {
      $(".alert").alert('close');
    }, 2000);  }

  // Return a HTML object that represents one row of an iqama range
  _helpers.iqama_row = function(start, end, times) {
    return $('' +
      '<tr id="' + [start, end].join('-') + '">' +
        '<td>' + start + '</td>' +
        '<td>' + end   + '</td>' +
        '<td>' + times['fajr'] + '</td>' +
        '<td>' + times['dhuhr'] + '</td>' +
        '<td>' + times['asr'] + '</td>' +
        '<td>' + times['maghrib'] + '</td>' +
        '<td>' + times['isha'] + '</td>' +
        '<td>' +
          '<div class="btn-group" role="group">' +
            '<button type="button" class="btn btn-default">' +
              '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>');
  }

  // Return a HTML object that represents one row of a prayer time range
  _helpers.prayer_times_row = function(start, end, times) {
    return $('' +
      '<tr id="' + [start, end].join('-') + '">' +
      '<td>' + start + '</td>' +
      '<td>' + end   + '</td>' +
      '<td>' + times['fajr_a'] + '</td>' +
      '<td>' + times['fajr_i'] + '</td>' +
      '<td>' + times['dhuhr_a'] + '</td>' +
      '<td>' + times['dhuhr_i'] + '</td>' +
      '<td>' + times['asr_a'] + '</td>' +
      '<td>' + times['asr_i'] + '</td>' +
      '<td>' + times['maghrib_a'] + '</td>' +
      '<td>' + times['maghrib_i'] + '</td>' +
      '<td>' + times['isha_a'] + '</td>' +
      '<td>' + times['isha_i'] + '</td>' +
      '<td>' + times['jumma1_a'] + '</td>' +
      '<td>' + times['jumma1_i'] + '</td>' +
      '<td>' + times['jumma2_a'] + '</td>' +
      '<td>' + times['jumma2_i'] + '</td>' +
      '<td>' +
      '<div class="btn-group" role="group">' +
      '<button type="button" class="btn btn-default">' +
      '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>' +
      '</button>' +
      '</div>' +
      '</td>' +
      '</tr>');
  }

  return _helpers;
})();
