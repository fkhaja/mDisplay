(function(){
  'use strict';
  prayTimes.setMethod('ISNA');
  // Maghrib salat time in minutes after athan
  var maghrib_buffer = 10;
  var pray_times, iqama_times, m_p_time, m_i_time, n_pray_info;
  var location = {};
  var tz_offset;

  helpers.asyncConfig().success(function(config) {
    $("#org_name")[0].innerHTML = config.org_name;
    tz_offset = config.tz_offset;
    location['lat'] = config.lat;
    location['lng'] = config.lng;
  });

  function secondlyUpdate() {
    updateClock();
    updateDateTime();
    updateNextPrayer();
    setTimeout(secondlyUpdate, 1000);
  }

  function dailyUpdate() {
    var ms_to_midnight = moment().endOf('day') - moment();
    updatePrayerTime();
    setTimeout(dailyUpdate, ms_to_midnight);
  }

  secondlyUpdate();
  dailyUpdate();

  helpers.asyncConfig().success(function(config) {
    $("#org_name")[0].innerHTML = config.org_name;
    tz_offset = config.tz_offset;
    location['lat'] = config.lat;
    location['lng'] = config.lng;
  });
  // displayAnnouncments();

  function displayAnnouncments() {
    helpers.asyncAnnouncements().success(function(announcments) {

      for (var i in announcments) {
        var $html = '<div class="item"> <img src=imgs/slides/' + announcments[i] + ' /> </div>';

        $('.carousel-inner').append($html);
      }

    });

    $('.carousel').carousel({
      pause: 'none',
      interval: 7500
    });
  }

  function updatePrayerTime() {
    // helpers.asyncIqamas().success(function(iqamas) {
    helpers.asyncIqamasFromUrl().success(function(iqamas) {
      pray_times  = prayTimes.getTimes(new Date(), [location.lat, location.lng], tz_offset, 'auto', '12h');
      iqama_times = helpers.getIqamaRange(iqamas);
      m_p_time    = helpers.makeMoment(pray_times['maghrib']);
      m_i_time    = m_p_time.add(maghrib_buffer, 'm').format("h:mm a");
      n_pray_info = helpers.nextPrayerInfo(iqama_times, pray_times, m_i_time);

      $("#t_fajr")     .text('Azan: '+pray_times['fajr']);
      $("#t_sunrise")  .text(pray_times['sunrise']);
      $("#t_dhuhr")    .text('Azan: '+pray_times['dhuhr']);
      $("#t_asr")      .text('Azan: '+pray_times['asr']);
      $("#t_maghrib")  .text('Azan: '+pray_times['maghrib']);
      $("#t_isha")     .text('Azan: '+pray_times['isha']);

      $("#i_fajr")     .text('Iqama: '+iqama_times['fajr']);
      $("#i_dhuhr")    .text('Iqama: '+iqama_times['dhuhr']);
      $("#i_asr")      .text('Iqama: '+iqama_times['asr']);
      $("#i_isha")     .text('Iqama: '+iqama_times['isha']);

      $("#i_maghrib")  .text('Iqama: '+m_i_time);

      new Clock(document.getElementById("canvas_fajr"), iqama_times['fajr'].split(":")[0], iqama_times['fajr'].split(":")[1].split(" ")[0]);
      new Clock(document.getElementById("canvas_sunrise"), pray_times['sunrise'].split(":")[0], pray_times['sunrise'].split(":")[1].split(" ")[0]);
      new Clock(document.getElementById("canvas_dhuhr"), iqama_times['dhuhr'].split(":")[0], iqama_times['dhuhr'].split(":")[1].split(" ")[0]);
      new Clock(document.getElementById("canvas_asr"), iqama_times['asr'].split(":")[0], iqama_times['asr'].split(":")[1].split(" ")[0]);
      new Clock(document.getElementById("canvas_maghrib"), m_i_time.split(":")[0], m_i_time.split(":")[1].split(" ")[0]);
      new Clock(document.getElementById("canvas_isha"), iqama_times['isha'].split(":")[0], iqama_times['isha'].split(":")[1].split(" ")[0]);

    });

  }

  function updateNextPrayer() {
    if (n_pray_info && iqama_times && pray_times && m_i_time) {
      n_pray_info = helpers.nextPrayerInfo(iqama_times, pray_times, m_i_time);
      $("#next_prayer").text(n_pray_info['prayer']);
      $("#n_prayer_a") .text(n_pray_info['arabic']);
      $("#athan_mins") .text(n_pray_info['athan']);
      $("#salat_mins") .text(n_pray_info['iqama']);

      // Indicate next prayer for analog clock panel view
      var prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      for (var i in prayerNames) $('#panel-' + prayerNames[i]).removeClass('active');
      var prayer = n_pray_info['prayer'].toLowerCase();
      $('#panel-' + prayer).addClass('active');
    }
  }

  function updateClock() {
    var now = moment(),
        second = now.seconds() * 6,
        minute = now.minutes() * 6 + second / 60,
        hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

    $('#hour').css("transform", "rotate(" + hour + "deg)");
    $('#minute').css("transform", "rotate(" + minute + "deg)");
    $('#second').css("transform", "rotate(" + second + "deg)");
  }

  function updateDateTime() {
    $("#date").text(moment().format("dddd, MMMM Do YYYY -- iDo iMMMM iYYYY"));
    $("#time").text(moment().format("h:mm:ss a"));
  }

})();
