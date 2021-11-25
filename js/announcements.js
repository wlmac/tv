var announcements;
var clubs;
var idx = 0;
var pr;

function getClub(id) {
    for(var i = 0; i < clubs.length; i++) {
        if(clubs[i].id == id) {
            return clubs[i].name;
        }
    }
}
function getAnnouncements() {
    pr = new Promise((resolve, reject) => {
        $.getJSON("https://maclyonsden.com/api/organizations", function(orgs) {
            clubs = orgs;
            $.getJSON("https://maclyonsden.com/api/announcements", function(announce) {
                var idx = 0;
                var curr = new Date();
                curr.setDate(curr.getDate()-5);
                for(idx = 0; idx < announce.length; idx++) {
                    if(Date.parse(announce[idx].last_modified_date) < curr.getTime()) {
                        break;
                    }
                }
                announcements = announce.slice(0, idx+1);
                if(announcements.length > 8) {
                    announcements = announcements.slice(0, 8);
                }
                console.log("API Call");
                resolve();
            });
        });
    });
}
function setAnnouncement() {
    try {
        var post = announcements[idx];
        $("#title").text(post.title);
        var upload = new Date(Date.parse(post.last_modified_date));
        var month = months[upload.getMonth()];
        var date = upload.getDate();
        var hr = upload.getHours();
        var min = upload.getMinutes();
        var period = "a.m.";
        if(min < 10) {
            min = "0"+min;
        }
        if(hr >= 12) {
            if(hr > 12) {
                hr -= 12;
            }
            period = "p.m.";
        }
        if(hr == 0) {
            hr += 12
        }
        $("#org").html(`${getClub(post.organization.id)}<date> • ${month} ${date}, ${hr}:${min} ${period}</date>`);
        $("#announcement-body").html(marked.parse(post.body.replaceAll("/media/", "https://maclyonsden.com/media/")));
        idx++;
        idx %= announcements.length;
    } catch(err) {console.log(err);}
}

$(document).ready(function() {
    getAnnouncements();
    pr.then(() => {
        console.log(announcements[idx]);
        var t = Math.max(announcements[idx].body.split(" ").length*1000/3 + 5000*(announcements[idx].body.match(/\/media\//g) || []).length, 5000);
        execute();

        function changeTimer() {
            t = Math.max(announcements[idx].body.split(" ").length*1000/3 + 5000*(announcements[idx].body.match(/\/media\//g) || []).length, 5000);
        }
        function execute() {
            console.log(announcements[idx].title);
            console.log(~~(t/1000));
            setAnnouncement();
            if(idx == 0) {
                getAnnouncements();
            }
            var scrollable = $("#announcement-body");
            scrollable.scrollTop(0);
            if(t > 10000) {
                setTimeout(function () {
                    scrollable.animate({scrollTop: scrollable.prop("scrollHeight") }, t-10000);
                }, 5000);
            } else {
                scrollable.animate({scrollTop: scrollable.prop("scrollHeight") }, t);
            }
            changeTimer();
            setTimeout(execute, t);
        }
    });
})