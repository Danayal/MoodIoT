/*
 *      Copyright (c) 2016 Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.1 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://floralicense.org/license/
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

/*global tau, getcontent */

/* exported app */

/**
 * App.js controls music play and the main page display, including changes in the title of music and the background image.
 */
var app =
(function() {
    var app = {},
        globalPage, // Sets current page information for page navigation.
        musicPlayList = [], // Sets all music information.
        currentPlayNumber, // Sets current play number. (0: first)
        musicStatus = false, // true: now playing, false: pause or not playing.
        myaudio = document.querySelector('#myaudio'), // Gets audio element by myaudio id.
        interval, // for interval manage.
        musicTime, // Current music playing time, increment by one every second.
        deviceStatus = "gear", // At first, set "gear" as current device status.
        TITLE_NO_TRACK = "Now Playing",
        TITLE_BT_DISCONNECTED = "BT disconnected",
        BACKGROUND_IMAGE_NO_ALBUM = "/../image/music_no_album_art.png";
    	SONGTITLE = "Hot & Cold";
    	ARTISTNAME = "Katy Perry";
    	PLAYLIST = "Uplifting Playlist"
    	
    		
    	
//    <div id="div_title"></div>
//    <div id="div_artistname"></div>
//    <div id="div_songtitle"></div>
//    <div id="div_playlist"></div>
//    <div id="div_suitsyourmood"></div>

    /**
     * Changes the string of a html element.
     * @private
     * @param {String} id - element's id
     * @param {String} changeStr - to change string
     */
    function changeHtmlString(id, changeStr) {
        var changeId = document.querySelector("#" + id);

        changeId.innerHTML = changeStr;
    }

    /**
     * Changes the background image of an element.
     * @private
     * @param {String} id - element's id
     * @param {String} changeUrl - to change url
     */
    function changeBackgroundImage(id, changeUrl) {
        var changeId = document.querySelector("#" + id);

        changeId.style.backgroundImage = "url('" + changeUrl + "')";
    }

    /**
     * Changes control page as currentPlayNumber.
     * @private
     */
    function changeControlPage() {
        changeHtmlString("div_title", musicPlayList[currentPlayNumber].titleName);
        changeHtmlString("div_sub_title", musicPlayList[currentPlayNumber].artistName);
        changeBackgroundImage("div_background", musicPlayList[currentPlayNumber].thumbnailFilePath);
    }

    /**
     * Changes currentPlayNumber variable as direction.
     * @private
     * @param {String} direction - Receiving input direction from the user.
     */
    function changePlayNumber(direction) {

        // When the rotary event is clockwise or next button is clicked.
        if (direction === "CW" || direction === "next") {

            // CurrentPlayNumber plus 1, then, get the next music information in musicPlayList.
            // If currentPlayNumber reaches musicPlayList's length, set the currentPlayNumber is 0.
            if (currentPlayNumber === (musicPlayList.length - 1)) {
                currentPlayNumber = 0;
            } else {
                currentPlayNumber++;
            }
        }

        // When the rotary event is counterclockwise or previous button is clicked.
        else if (direction === "CCW" || direction === "prev") {

            // CurrentPlayNumber plus 1, then, get the previous music information in musicPlayList.
            // If currentPlayNumber reaches 0, set the currentPlayNumber is last number.
            if (currentPlayNumber === 0) {
                currentPlayNumber = musicPlayList.length - 1;
            } else {
                currentPlayNumber--;
            }
        }
    }

    /**
     * Plays the music from the beginning.
     * Starts the music as parameter. ("next" or "previous" : next or previous music, nothing : current music)
     * If music status is "play", it plays the music.
     * If music status is "pause", it does nothing.
     * @private
     * @param {String} direction - Receiving input direction from the user.
     */
    function startMusic(direction) {

        // It requires music play list exist with the gear status.
        if (deviceStatus === "Device Gear" && musicPlayList.length !== 0) {
            changePlayNumber(direction);
            changeControlPage();

            myaudio.src = musicPlayList[currentPlayNumber].musicFilePath;
            clearInterval(interval);
            musicTime = 0;

            if (musicStatus === true) {
                myaudio.play();

                // check current music time using setInterval.
                interval = setInterval(function() {
                    musicTime++;

                    // when a music is played to the end, move to the next music.
                    if (musicTime > (musicPlayList[currentPlayNumber].duration / 1000)) {
                        startMusic("next");
                    }
                }, 1000);
            }
        }
    }

    /**
     * Controls a music play and pause.
     * It only work on gear status.
     * @private
     */
    function controlMusic() {
        var div_play = document.querySelector('#div_play');

        // It requires music play list exist with the gear status.
        if (deviceStatus === "Device Gear" && musicPlayList.length !== 0) {

            // When sample initiate, there is not audio source information in myaudio element.
            // then, add first music path. (currentPlayNumber is 0)
            if (myaudio.src === "") {
                myaudio.src = musicPlayList[currentPlayNumber].musicFilePath;
                musicStatus = true;
                div_play.className = 'btn pause';
                startMusic();
            }

            // In the others case, it controls play and pause.
            else {

                // If audio paused, it play audio. and change the pause button to the play button.
                if (myaudio.paused) {
                    myaudio.play();

                    // check current music time using setInterval
                    interval = setInterval(function() {
                        musicTime++;

                        // when a music is played to the end, move to the next music.
                        if (musicTime > (musicPlayList[currentPlayNumber].duration / 1000)) {
                            startMusic("next");
                        }
                    }, 1000);
                    div_play.className = 'btn pause';
                    musicStatus = true;
                }

                // If audio played, it pause audio. and change the play button to the pause button.
                else {
                    myaudio.pause();
                    clearInterval(interval);
                    div_play.className = 'btn play';
                    musicStatus = false;
                }
            }
        }
    }

    /**
     * Handles rotary event.
     * the rotary direction does not matter in this sample.
     * @private
     * @param {Object} event
     */
    function rotaryEventHandler(event) {
        var direction = event.detail.direction;

        // Call changeControlPage function in the main page
        if (globalPage === "main") {
            //changeControlPage(direction);
            startMusic(direction);
        }
    }

    /**
     * Initializes the first control screen.
     * Device status is Gear at first.
     * It displays the information of the first music.(title, artist and background).
     * If there is no music, it does not display any information.
     * @private
     */
    function initControlPage() {

        // There is no music list.
        if (musicPlayList.length === 0) {
           // changeHtmlString("div_title", div_now_playing);
            changeHtmlString("div_artistname", ARTISTNAME);
            changeHtmlString("div_songtitle", SONGTITLE);
            changeHtmlString("div_playlist", PLAYLIST);
         //   changeHtmlString("div_songtitle", SONGTITLE);

            
//            <div id="div_artistname"></div>
//            <div id="div_songtitle"></div>
//            <div id="div_playlist"></div>
//            <div id="div_suitsyourmood"></div>

            changeBackgroundImage("div_background", BACKGROUND_IMAGE_NO_ALBUM);
        }

        // If there is a music list, it displays the information of the first music.
        else {
            currentPlayNumber = 0;
            changeHtmlString("div_title", "Now playing");
            changeHtmlString("div_artistname", ARTISTNAME);

            changeBackgroundImage("div_background", musicPlayList[currentPlayNumber].thumbnailFilePath);
        }
    }

    /**
     * Displays mobile status screen.
     * This sample does not support full function for mobile starts, so it simply displays "BT disconnected"
     * If any music is playing, it stops.
     * @private
     */
    function changeDeviceMobile() {
        changeHtmlString("div_title", "Now Playing");
        changeHtmlString("div_sub_title", "Katy Perry");
        changeBackgroundImage("div_background", BACKGROUND_IMAGE_NO_ALBUM);

        // Music stops.
        myaudio.pause();
        clearInterval(interval);
        document.querySelector("#div_play").className = 'btn play';
        document.querySelector("#div_device").className = 'mobile';
        musicStatus = false;
    }

    /**
     * Display gear status screen. It calls the initControlPage function again.
     * @private
     */
    function changeDeviceGear() {
        initControlPage();
        document.querySelector("#div_device").className = 'gear';
        startMusic();

    }

    /**
     * Changes device status to the other status. (gear -> mobile, mobile -> gear)
     * @private
     * @param {Object} target - current clicked selector object.
     */
    function changeDeviceStatus(target) {

        // Current device status is gear. change device status to mobile.
        if (deviceStatus === "Device Gear") {
            // Using target object, change the data-title attribute to "Device Mobile",
            // then, add class "device-mobile".
            target.setAttribute("data-title", "Device Mobile");
            target.className = "ui-item device-mobile";

            deviceStatus = "Device Mobile";
            changeDeviceMobile();
        }

        // Current device status is mobile. change device status to gear.
        else if (deviceStatus === "Device Mobile") {

            // Using target object, change the data-title attribute to "Device Gear",
            // then, add class "device-gear".
            target.setAttribute("data-title", "Device Gear");
            target.className = "ui-item device-gear";

            deviceStatus = "Device Gear";
            changeDeviceGear();
        }
    }

    /**
     * Sets current device status to deviceStatus variable.
     * then, call changeDeviceStatus function.
     * @public
     * @param {String} currentStatus - current device status.
     * @param {Object} target - current clicked selector object.
     */
    app.setDeviceStatus = function setDeviceStatus(currentStatus, target) {
        deviceStatus = currentStatus;
        changeDeviceStatus(target);
    };

    /**
     * Sets current page status to globalPage variable.
     * @public
     * @param {String} page - current page status.
     */
    app.setGlobalPage = function setGloabalPage(page) {
        globalPage = page;
    };

    /**
     * Waits to refresh music information of getcontent using setInterval.
     * getRefreshed function of getcontent returns current refresh status(true: refresh, false: not refresh).
     * After refresh music information, set music play list information to musicPlayList variable.
     * then, clear this interval and call initControlPage function.
     * @private
     */
    function initGetMusic() {
        var interval = setInterval(function() {
            if (getcontent.getRefreshed()) {
                musicPlayList = getcontent.getMusicPlayList();
                clearInterval(interval);
                initControlPage();
            }
        }, 10);
    }

    /**
     * Handles hardware back Event in every page.
     * This sample exits on the main page, and it returns to the main page if the back key is pressed in the pop-up.
     * @private
     * @param {Object} event
     */
    function backEventHandler(event) {
        var popupCircle = document.querySelector("#moreoptionsPopupCircle");

        // The hardware back key occurs.
        if (event.keyName === "back") {
            if (globalPage === "main") {
                try {
                    tizen.application.getCurrentApplication().exit();
                } catch (ignore) {}
            } else {
                tau.closePopup(popupCircle);
                globalPage = "main";
            }
        }
    }

    /**
     * Binds all events (tizen hardware key, click and rotary events).
     * @private
     */
    function bindEvents() {
        document.addEventListener('tizenhwkey', backEventHandler);
        document.querySelector("#div_play").addEventListener('click', controlMusic);
        document.querySelector("#div_prev").addEventListener('click', function() {
            startMusic("prev");
        });
        document.querySelector("#div_next").addEventListener('click', function() {
            startMusic("next");
        });
        document.addEventListener('rotarydetent', rotaryEventHandler);
    }

    /**
     * Binds events, get music list, and set music informations.
     * call refreshMusics function of getcontent for get music informations.
     * @private
     */
    function init() {
        globalPage = "main"; // Current page is "main" page.
        deviceStatus = "Device Gear"; // At first, device status is "gear" status.
        bindEvents();
        getcontent.refreshMusics();
        initGetMusic();
    }

    window.onload = init();

    return app;
}());