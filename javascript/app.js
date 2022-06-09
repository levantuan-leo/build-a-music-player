const musicContainer = document.querySelector('.music-container');
const progressContainer = document.querySelector('.progress-container');
const progress = document.querySelector('.progress');
const prev = document.querySelector('.prev');
const playPause = document.querySelector('.play-pause');
const next = document.querySelector('.next');
const musicLyrics = document.querySelector('.music-lyrics');
const spinner = document.querySelector('.spinner');
const audio = document.querySelector('#audio');
const cover = document.querySelector('#cover');
const title = document.querySelector('#title');
const artist = document.querySelector('#artist');
const scrollbox = document.querySelector("#control-scrollbox");
const circle = document.querySelector("#circle");
const content = document.querySelector("#lyrics-content");

//First, We create a list of song titles
var songs = ["Everything_I_Need", "Floating", "Despacito", "Sign", "Roar", "Two_Steps_From_Hell"];

// Play or pause song
function playSong(){
    audio.play();
    musicContainer.classList.add("play");
    // Change icon
    playPause.querySelector('i.fas').classList.remove('fa-play');
    playPause.querySelector('i.fas').classList.add('fa-pause');
}
function pauseSong(){
    audio.pause();
    musicContainer.classList.remove("play");
    // Change icon
    playPause.querySelector('i.fas').classList.remove('fa-pause');
    playPause.querySelector('i.fas').classList.add('fa-play');
}
// On click: play - pause
playPause.addEventListener('click', () => {
    var isPlaying = musicContainer.classList.contains("play");
     if(isPlaying) pauseSong();
    else playSong();
});
spinner.addEventListener('click', function(e){
    if((e.offsetX < 175 && e.offsetX > 125) && (e.offsetY < 175 && e.offsetY > 125)){
        musicContainer.classList.contains("play") ? pauseSong() : playSong();
    }
});

// Previous song
function prevSong(){
    index = (index - 1) < 0 ? (songs.length - 1) : index - 1;
    loadSong("./songs/" + songs[index] + ".mp3");
    playSong();
}
// Next song
function nextSong(){
    index = (index + 1) < songs.length ? index + 1 : 0;
    loadSong("./songs/" + songs[index] + ".mp3");
    playSong();
}

//-----change song events-----
// On click: previous and next
prev.addEventListener('click', prevSong);
next.addEventListener('click', nextSong);
//Auto change the song when ended
audio.addEventListener('ended', nextSong);

// Progress
function updateProgress(e){
    const {duration, currentTime} = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;

    //update lyrics
    updateLyrics();
}
audio.addEventListener('timeupdate', updateProgress);
//-----------------
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    const currentTime = (clickX / width) * duration;

    $(`#lyrics-content span:nth-child(${number})`).prev().removeClass('is-active');
    number = $('#lyrics-content span').filter(function (index) {return currentTime > $(`#lyrics-content span:nth-child(${index + 1})`).css("--duration")}).length - 1;
    audio.currentTime = currentTime;
}
progressContainer.addEventListener('click', setProgress);

//#region variables
// Keep track of song
let index = 0;
// lyrics text 'n'th
let number = 1;
// jump to new lyric
var scrollStep;
//#endregion

// Initailly load song info DOM
loadSong("./songs/" + songs[index] + ".mp3");

// Update song details
function loadSong(url){
    // get source audio
    audio.src = url;

    // load song info
    loadInfo(url);
}

// load info
function loadInfo(url){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        // Read file
        jsmediatags.read(xhr.response, {
            onSuccess: function(tag) {
                // Print the tag
                //console.log(tag);
                // if success, then get info
                title.innerHTML = ((tag.tags.title) ? tag.tags.title : "undefined") + "</br><span>" + ((tag.tags.artist) ? tag.tags.artist : "undefined") +"</span>";
                // cover the picture
                // use ajax to upload tag info, or create some new form elements
                if(tag.tags.picture){
                var data = tag.tags.picture.data;
                var format = tag.tags.picture.format;
                var base64String = "";
                 for (var i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                cover.src = `data:${format};base64,${window.btoa(base64String)}`;
                }
                else{
                    cover.src="./image_box/cover.png"; 
                }

                // finally, load the lyrics
                loadLyrics(tag.tags.lyrics);
            },
            onError: function (error) {
                console.log(error);
            }
        });
    }
    xhr.send();
}

// load Lyrics
function loadLyrics(data) {
    // reset first nth-child
    number = 1;

    // remove lyrics if so
    if(content.querySelectorAll('span')){content.querySelectorAll('span').forEach(lyric => lyric.remove());}
    
    // add lyrics
    if(data){
        lrc = data.lyrics.split("\n");
    
        let wrapper = "";
    
        for(let i = 0; i < lrc.length; i++) {
            var time = toTime(lrc[i].substring(1, 9));
            var text = lrc[i].substring(10, lrc[i].length);
            wrapper += `<span style="--duration:${time};">${text}</span>`;
        }

        content.insertAdjacentHTML("afterbegin", wrapper);
        $('#scroll-length').css('height', content.scrollHeight + musicLyrics.clientHeight / 2);
        scrollbox.scrollTop = 1000;
    }
    // animation: load lyrics
    $('#control-scrollbox').animate({ scrollTop: 0 }, { easing: "swing", duration: 500 });
    
    // set scroll steps
    $('#lyrics-content span:first-child').addClass('is-over');
    scrollStep = parseInt($('.is-over:first-child').css('height')) + parseInt($('.is-over:first-child').css('margin-top'));
    $('#lyrics-content span:first-child').removeClass('is-over');

}

// scroll lyrics
scrollbox.addEventListener('scroll', function () {
    circle.style.marginTop = (scrollbox.scrollTop * 2) + "px";
    content.style.top = "-" + scrollbox.scrollTop + "px";
});

// update lyrics (use jquery)
function updateLyrics() {
    if (audio.currentTime > $(`#lyrics-content span:nth-child(${number})`).css("--duration")) {
        // update lyrics
         $(`#lyrics-content span:nth-child(${number})`).addClass('is-active');
        if (number > 1) {
            $(`#lyrics-content span:nth-child(${number})`).prev().removeClass('is-active');
            $('#lyrics-content span').filter(function (index) {
                return index + 1 < number && $(this).attr("class") !== "is-over";
            }).addClass('is-over');
            $('#lyrics-content span').filter(function (index) {
                return index + 1 > number;
            }).removeClass();
        }

        // center lyric
        var scroll = $('#lyrics-content .is-active').offset().top - $('#lyrics-content .is-active').parents().offset().top - scrollStep * 2;
        $('#control-scrollbox').animate({ scrollTop: scroll + "px" }, { easing: "swing", duration: 100 })

        number++;
    }
}

// change time (##:##.##) to (#.###) (EX: 00:00.05 -> 0.05)
function toTime(time){
    if(!isNaN(parseFloat(time))){
        var min = parseFloat(time.substring(0, 2));
        var sec = parseFloat(time.substring(3, time.length));
        return (min * 60 + sec);
    }
}

//------------------------------------------------------------------------------------------------
// Get Value of CSS Rotation    
function getAngle(){    
    var st = window.getComputedStyle(spinner, null);

    //rotate(Xdeg) = matrix(cos(X), sin(X), -sin(X), cos(X), 0, 0);
    var tr = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform") ||
            "Either no transform set, or browser doesn't do getComputedStyle";

    // var values = tr.split('(')[1].split(')')[0].split(',');
    // Replace with... 
    var values = tr.split('(')[1],
        values = values.split(')')[0],
        values = values.split(',');

    var angle = Math.round(Math.atan2(values[1] /*sin(X)*/, values[0] /*cos(X)*/) * (180 / Math.PI));
    return angle;
}

// key events
/* keypress vs keydown
 - 'keypress' :xay ra khi ban nhan bat ky phim ky tu nao.
 - 'keydown' or 'keyup' : xay ra khi nhan mot phim bat ky.
*/
// keypress: 32 [space], 109 [m]
function toggleMute() { audio.volume = audio.volume != 0 ? 0 : 1 }
$(document).bind('keypress', function (event) {
    //console.log(event.keyCode);
    switch (event.keyCode) {
        case 32:
            playSong();
            break;
        case 109:
            toggleMute();
    }
});
// rewind and forward
function rewind5s() {
    console.log('←');
}
function forward5s() {
    console.log('→');
}
// keydown: 37 [←], 39 [→]
$(document).bind('keydown', function (event) {
    switch (event.keyCode) {
        case 37:
            rewind5s();
            break;
        case 39:
            forward5s();
            break;
    }
});