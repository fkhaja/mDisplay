(function(){
  'use strict';
  prayTimes.setMethod('ISNA');
  // Maghrib salat time in minutes after athan
  var maghrib_buffer = 10;
  var calculated_times, prayer_times, pray_times, iqama_times, m_p_time, m_i_time, n_pray_info;
  var location = {};
  var tz_offset, prayer_time_url, display_announcements;

  helpers.config().success(function(config) {
    $("#org_name")[0].innerHTML = config.org_name;
    tz_offset = config.tz_offset;
    location['lat'] = config.lat;
    location['lng'] = config.lng;
    prayer_time_url = config.prayer_time_url;
    display_announcements = config.announcements === 'true'
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
  if (display_announcements) {
    displayAnnouncments();
  }

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

    $('.carousel').bind('slid.bs.carousel', function (e) {
      let index = $(e.target).find(".active").index();
      if(index != 0) {
        $('#english-header').text("Announcements");
        $('#arabic-header').text("الإعلانات");
      } else {
        $('#english-header').text("Prayer Times");
        $('#arabic-header').text("أوقات الصلاة");
      }
    })

  }

  function updatePrayerTime() {
    if (prayer_time_url) {
      getPrayerTimesFromUrl()
    } else {
      getPrayerTimesFromConfig()
    }

    // helpers.asyncIqamas().success(function(iqamas) {
    // helpers.asyncIqamasFromUrl().success(function(iqamas) {
    //   pray_times  = prayTimes.getTimes(new Date(), [location.lat, location.lng], tz_offset, 'auto', '12h');
    //   iqama_times = helpers.getIqamaRange(iqamas);
    //   m_p_time    = helpers.makeMoment(pray_times['maghrib']);
    //   m_i_time    = m_p_time.add(maghrib_buffer, 'm').format("h:mm a");
    //   n_pray_info = helpers.nextPrayerInfo(iqama_times, pray_times, m_i_time);
    //
    //   $("#fajr_a")     .text('Azan: '+pray_times['fajr']);
    //   $("#t_sunrise")  .text(pray_times['sunrise']);
    //   $("#dhuhr_a")    .text('Azan: '+pray_times['dhuhr']);
    //   $("#asr_a")      .text('Azan: '+pray_times['asr']);
    //   $("#maghrib_a")  .text('Azan: '+pray_times['maghrib']);
    //   $("#isha_a")     .text('Azan: '+pray_times['isha']);
    //
    //   $("#fajr_i")     .text('Iqama: '+iqama_times['fajr']);
    //   $("#dhuhr_i")    .text('Iqama: '+iqama_times['dhuhr']);
    //   $("#asr_i")      .text('Iqama: '+iqama_times['asr']);
    //   $("#maghrib_i")      .text('Iqama: '+iqama_times['maghrib']);
    //   $("#isha_i")     .text('Iqama: '+iqama_times['isha']);
    //
    //   // $("#maghrib_i")  .text('Iqama: '+m_i_time);
    //
    //   renderPrayerTimeClocks();
    // });

  }

  function getAutoPrayerTimes() {
    pray_times  = prayTimes.getTimes(new Date(), [location.lat, location.lng], tz_offset, 'auto', '12h');
    return pray_times
  }

  function getPrayerTimesFromUrl() {
    helpers.asyncPrayerTimesFromUrl().success(function(res) {
      calculated_times  = prayTimes.getTimes(new Date(), [location.lat, location.lng], tz_offset, 'auto', '12h');
      prayer_times = res;
      m_p_time    = helpers.makeMoment(calculated_times['maghrib']);
      m_i_time    = m_p_time.add(maghrib_buffer, 'm').format("h:mm a");
      n_pray_info = helpers.nextPrayerInfo(calculated_times, prayer_times, m_i_time);

      $("#fajr_a")     .text('Azan: '+prayer_times['fajr_a']);
      $("#t_sunrise")  .text(calculated_times['sunrise']);
      $("#dhuhr_a")    .text('Azan: '+prayer_times['dhuhr_a']);
      $("#asr_a")      .text('Azan: '+prayer_times['asr_a']);
      $("#maghrib_a")  .text('Azan: '+prayer_times['maghrib_a']);
      $("#isha_a")     .text('Azan: '+prayer_times['isha_a']);

      $("#fajr_i")     .text('Iqama: '+prayer_times['fajr_i']);
      $("#dhuhr_i")    .text('Iqama: '+prayer_times['dhuhr_i']);
      $("#asr_i")      .text('Iqama: '+prayer_times['asr_i']);
      $("#maghrib_i")      .text('Iqama: '+prayer_times['maghrib_i']);
      $("#isha_i")     .text('Iqama: '+prayer_times['isha_i']);

      // $("#maghrib_i")  .text('Iqama: '+m_i_time);

      renderPrayerTimeClocks();
    });
  }

  function getPrayerTimesFromConfig() {
    helpers.asyncPrayerTimesFromConfig().success(function(prayerTimes) {
      calculated_times  = prayTimes.getTimes(new Date(), [location.lat, location.lng], tz_offset, 'auto', '12h');
      prayer_times = helpers.getPrayerTimesRange(prayerTimes);
      if (!prayer_times) {
        throw new Error('Range not found')
      }
      m_p_time    = helpers.makeMoment(calculated_times['maghrib']);
      m_i_time    = m_p_time.add(maghrib_buffer, 'm').format("h:mm a");
      n_pray_info = helpers.nextPrayerInfo(calculated_times, prayer_times, m_i_time);

      $("#fajr_a")     .text('Azan: '+prayer_times['fajr_a']);
      $("#t_sunrise")  .text(calculated_times['sunrise']);
      $("#dhuhr_a")    .text('Azan: '+prayer_times['dhuhr_a']);
      $("#asr_a")      .text('Azan: '+prayer_times['asr_a']);
      $("#maghrib_a")  .text('Azan: '+calculated_times['sunset']);
      $("#isha_a")     .text('Azan: '+prayer_times['isha_a']);

      $("#fajr_i")     .text('Iqama: '+prayer_times['fajr_i']);
      $("#dhuhr_i")    .text('Iqama: '+prayer_times['dhuhr_i']);
      $("#asr_i")      .text('Iqama: '+prayer_times['asr_i']);
      $("#maghrib_i")      .text('Iqama: '+prayer_times['maghrib_i']);
      $("#isha_i")     .text('Iqama: '+prayer_times['isha_i']);

      // $("#maghrib_i")  .text('Iqama: '+m_i_time);

      renderPrayerTimeClocks();
    });
  }

  function renderPrayerTimeClocks() {
    new Clock(document.getElementById("canvas_fajr"), prayer_times['fajr_i'].split(":")[0], prayer_times['fajr_i'].split(":")[1].split(" ")[0]);
    new Clock(document.getElementById("canvas_sunrise"), calculated_times['sunrise'].split(":")[0], calculated_times['sunrise'].split(":")[1].split(" ")[0]);
    new Clock(document.getElementById("canvas_dhuhr"), prayer_times['dhuhr_i'].split(":")[0], prayer_times['dhuhr_i'].split(":")[1].split(" ")[0]);
    new Clock(document.getElementById("canvas_asr"), prayer_times['asr_i'].split(":")[0], prayer_times['asr_i'].split(":")[1].split(" ")[0]);
    new Clock(document.getElementById("canvas_maghrib"), prayer_times['maghrib_i'].split(":")[0], prayer_times['maghrib_i'].split(":")[1].split(" ")[0]);
    // new Clock(document.getElementById("canvas_maghrib"), m_i_time.split(":")[0], m_i_time.split(":")[1].split(" ")[0]);
    new Clock(document.getElementById("canvas_isha"), prayer_times['isha_i'].split(":")[0], prayer_times['isha_i'].split(":")[1].split(" ")[0]);

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
