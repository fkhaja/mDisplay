var helpers = {
    parseTime: function (timeString) {
        if (timeString == '' || 'undefined') return null;

        var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
        if (time == null) return null;

        var hours = parseInt(time[1], 10);
        if (hours == 12 && !time[4]) {
            hours = 0;
        } else {
            hours += (hours < 12 && time[4]) ? 12 : 0;
        }
        var d = new Date();
        d.setHours(hours);
        d.setMinutes(parseInt(time[3], 10) || 0);
        d.setSeconds(0, 0);
        return d;
    }
}

module.exports = helpers;

