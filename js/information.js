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
        period = "PM";
    }
    if(hr == 0) {
        hr += 12;
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
            $("#cycle").text(schedule[0].cycle);
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
                    $(".start-times").append(`<h4>${time.replace(/^0+/, "")}</h4>`);
                }
                time = schedule[i].description.time;
                time = time.slice(0, time.indexOf("-")).trim();
                $(".arrows").append(`<h3><span class="material-icons">keyboard_double_arrow_right</span></h3>`);
                $(".periods").append(`<h3>${schedule[i].description.course}</h3>`);
                $(".start-times").append(`<h4>${time.replace(/^0+/, "")}</h4>`);
                $(".arrows").children().css("color", $(":root").css("--bg-grey"));
            }
        });
    });
}
function updateSchedule() {
    var curr = new Date();
    var idx = -1;
    try {
        var mid = ~~(schedule.length/2);
        for(var i = 0; i < schedule.length; i++) {
            if(Date.parse(schedule[i].time.start) < curr.getTime() && curr.getTime() < Date.parse(schedule[i].time.end)) {
                idx = i;
                if(i >= mid) {
                    idx += 1;
                }
                break;
            }
        }
        if(idx == -1 && Date.parse(schedule[mid-1].time.end) < curr.getTime() && curr.getTime() < Date.parse(schedule[mid].time.start)) {
            idx = mid;
        }
        $(".arrows").children().css("color", $(":root").css("--bg-grey"));
        if(idx != -1) {
            $(".arrows").children().eq(idx).css("color", $(":root").css("--gold"));
        }
        if(idx == -1) {
            if(curr.getTime() < Date.parse(schedule[0].time.start) && curr.getDate() == new Date(Date.parse(schedule[0].time.start)).getDate()) {
                var next = new Date(Date.parse(schedule[0].time.start));
                var hr = next.getHours() - curr.getHours();
                var min = next.getMinutes() - curr.getMinutes();
                if(min < 0) {
                    min = 60+min;
                    hr--;
                }
                if(min < 10) {
                    min = "0"+min;
                }
                $("#next-period").text(`School starts in ${hr}:${min}`);
            } else {
                $("#next-period").text(`School is over`);
            }
        } else {
            var next = new Date(Date.parse(schedule[(idx <= mid ? idx : idx-1)].time.end));
            var hr = next.getHours() - curr.getHours();
            var min = next.getMinutes() - curr.getMinutes();
            if(min < 0) {
                min = 60+min;
                hr--;
            }
            if(min < 10) {
                min = "0"+min;
            }
            var hours = (hr > 0 ? `${hr} hour${hr != 1 ? "s" : ""} and ` : "");
            var minutes = `${min} minute${min != 1 ? "s" : ""}`;
            $("#next-period").text((idx == schedule.length ? "School" : (idx == mid ? "Lunch" : "Period")) + ` ends in ${hours}${minutes}`);
        }
    } catch(err) {}
}

$(document).ready(function() {
    setSchedule();
    setDate();
    setTimeout(setInterval(setDate, 500), 1000-ms);
});