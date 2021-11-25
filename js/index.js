const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var ms = 0;
var schedule;
var pdate = 0;

function setDate() {
    var today = new Date();
    var day = days[today.getDay()];
    var month = months[today.getMonth()];
    var date = today.getDate();
    var hr = today.getHours();
    var min = today.getMinutes();
    var period = "AM";
    ms = ms = today.getMilliseconds();
    if(min < 10) {
        min = "0"+min;
    }
    if(hr >= 12) {
        if(hr > 12) {
            hr -= 12;
        }
        period = "PM"
    }
    if(hr == 0) {
        hr += 12
    }
    $("#date").text(`${day}, ${month} ${date}`);
    $("#time").text(`${hr}:${min} ${period}`);
    updateSchedule();
    if(pdate != date) {
        setSchedule();
        pdate = date;
    }
}
function setSchedule() {
    $.getJSON("https://maclyonsden.com/api/term/current", function(term) {
        $.getJSON(`https://maclyonsden.com/api/term/${term.id}/schedule`, function(sched) {
            schedule = sched;
            $("#week").text(schedule[0].cycle);
            $(".arrows").empty();
            $(".periods").empty();
            $(".start-times").empty();
            var time;
            for(var i = 0; i < schedule.length; i++) {
                if(i == ~~(schedule.length/2) && i > 0) {
                    time = schedule[i-1].description.time;
                    time = time.slice(time.lastIndexOf('-')+1).trim();
                    $(".arrows").append(`<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`);
                    $(".periods").append(`<h3>Lunch</h3>`);
                    $(".start-times").append(`<h4>${time}</h4>`);
                }
                time = schedule[i].description.time;
                time = time.slice(0, time.indexOf("-")).trim();
                $(".arrows").append(`<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`);
                $(".periods").append(`<h3>${schedule[i].description.course}</h3>`);
                $(".start-times").append(`<h4>${time}</h4>`);
                $(".arrows").children().css("color", $(":root").css("--light-grey"));
            }
        });
    });
}
function updateSchedule() {
    var curr = new Date().getTime();
    var idx = -1;
    try {
        for(var i = 0; i < schedule.length; i++) {
            if(Date.parse(schedule[i].time.start) < curr && curr < Date.parse(schedule[i].time.end)) {
                idx = i
                if(i >= ~~(schedule.length/2)) {
                    idx += 1
                }
                break;
            }
        }
        if(idx == -1 && Date.parse(schedule[~~(schedule.length/2)-1].time.end) < curr && curr < Date.parse(schedule[~~(schedule.length/2)].time.start)) {
            idx = ~~(schedule.length/2)
        }
        $(".arrows").children().css("color", $(":root").css("--light-grey"));
        console.log(idx);
        if(idx != -1) {
            $(".arrows").children().eq(idx).css("color", $(":root").css("--gold"));
        }
    } catch(err) {}
}

$(document).ready(function() {
    setSchedule();
    setDate();
    setTimeout(setInterval(setDate, 1000), 1000-ms);
});