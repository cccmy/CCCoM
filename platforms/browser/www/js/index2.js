/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var homeURL = "http://www.cccmy.org";
//var blog;
//var sermons;
var isOnline = navigator.onLine || false;


document.addEventListener("deviceready", onDeviceReady, false);


// PhoneGap is loaded and it is now safe to make calls PhoneGap methods
function onDeviceReady() {
    $('#logList').append('<li>Startup');
    document.addEventListener("backbutton", function (e) {
        e.preventDefault(); 
        navigator.notification.confirm("Are you sure want to exit?", onConfirmExit, "Confirmation", ['Yes','No']);
    }, false );
    document.addEventListener("offline", toggleOnline, false);
    document.addEventListener("online", toggleOnline, false);

    $('#logList').append('<li>After Load Status=' + isOnline);
    $('#logList').append('<li>Refreshing news data 1st time');
    loadNewsAtStart();
    $('#logList').append('<li>Refreshing sermon data 1st time');
    loadSermonAtStart();
	
    navigator.splashscreen.hide();
    $('#logList').append('<li>App load completed');
	window.plugin.toast.showShortBottom('Loading complete');

    
}


function onConfirmExit(button) {
    if(button==2){ //If User select a No, then return back;
        return;
    }else{
        navigator.app.exitApp(); // If user select a Yes, quit from the app.
    }
}

function toggleOnline(e) {
    // Handle the online event
    $('#logList').append('<li>Network status change detected');
    $('#logList').append('<li>Previously online = ' + isOnline);
    $('#logList').append('<li>Current state = ' + e.type);
	
	if ((e.type == "offline") && (isOnline)) {
	    isOnline = false;
		window.plugin.toast.showShortBottom('offline');
//        $('#logList').append('<li>Online:' + isOnline);
//        $('#logList').append('<li>Disabling refresh buttons');
        $('#refreshNewsButton').hide;
        $('#refreshSermonButton').hide;
	} else {
		if (!isOnline) {
        	isOnline = true;
			window.plugin.toast.showShortBottom('online');
	//        $('#logList').append('<li>Online: ' + isOnline);
	//        $('#logList').append('<li>Enabling refresh buttons');
	        $('#refreshNewsButton').show;
	        $('#refreshSermonButton').show;
		}
	}
}

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
}

function loadNewsAtStart() {
	$.mobile.loading( 'show', {
		text: 'loading News',
		textVisible: true,
		theme: 'a',
		html: ""
	});
    $('#logList').append('<li>Checking storage for news data.');
    try { var localNewsData = window.localStorage.getItem('blogData16');}
    catch(err) {$('#logList').append('<li>' + err.message);}
//    $('#logList').append('<p>' + localNewsData + '</p>');
    if (localNewsData===null) {
        if (isOnline) {
            // Local storage does not exist, need to download
            $('#logList').append('<li>No new data and online');
            downloadNews();
            loadLocalNews();
        } else {
            $('#newsList').empty();
            $('#newsList').append('<li>No news data and no internet connection');
            $('#newsList').append('<li>Connect your device to the internet and refresh');
            $('#newsList').refresh;
        }
    } else {
        $('#logList').append('<li>Offline news data available');
        loadLocalNews();
        $('#logList').append('<li>Offline news data loaded.');
    }
    $('#logList').append('<li>Finish loading news 1st time');
    $.mobile.loading( 'hide');
}

function refreshNews() {
    // Make sure its online
    if (isOnline) {
      // make a request
        $('#logList').append('<li>Refreshing news from web.');
        downloadNews();
        loadLocalNews();
//    $('#sermonFooter').append('done!");
    } else {
      // offline
        $('#logList').append('<li>Not connected. Loading from storage.');
        loadLocalNews();
    }
}

function downloadNews() {
    // Get JSON from blog rss
    $.getJSON('http://blog.cccmy.org/feeds/posts/default?alt=json', function(blog){
        // Convert JSON to string
        $('#logList').append('<li>Converting news JSON to String');
        var localNewsData = JSON.stringify(blog);
        $('#logList').append('<li>Saving news string to storage.');
        // Saving string to local storage
        window.localStorage.setItem('blogData16', localNewsData);
        $('#logList').append('<li>News saved to storage.');
    });
}

function loadLocalNews() {
    var imagePath = "";
    // Retrieve string from storage and parse into JSON
    $('#logList').append('<li>Getting local news storage');
    var blog = JSON.parse(window.localStorage.getItem('blogData16'));
    $('#logList').append('<li>Displaying news feed');
    $('#newsList').empty();
    $.each(blog.feed.entry, function(index, news){
		if (news.media$thumbnail != null) {
		    imagePath = '<img id="newsPic" src="' + news.media$thumbnail.url + '"/>';
		} else {
		    imagePath = "";
		}
//    $('#logList').append('<li>image path=' + imagePath);
        $('#newsList').append('<li>' +
		    '<details><summary>' + imagePath +
            '<h4>' + news.title.$t + '</h4>' +
            '<p>' + news.updated.$t + '</p></summary>' +
            '<span>' + news.content.$t + '</span></details>');
//        $('#logList').append('<li>Listed news' + index);
    });
    $('#logList').append('<li>News loaded');
    $('#newsList').refresh;
}

function loadSermonAtStart() {
    $('#logList').append('<li>Checking storage for sermon');
    try {var localSermonData = window.localStorage.getItem('sermonData16');}
    catch(err) {$('#logList').append('<li>' + err.message);}
    if (localSermonData===null) {
        if (isOnline) {
        // Local storage does not exist, need to download
            $('#logList').append('<li>No sermon data but online. Downloading');
           downloadSermon();
           loadLocalSermon();
        } else {
            $('#sermonList').empty();
            $('#sermonList').append('<li>No sermon data and no internet connection');
            $('#sermonList').refresh;
        }
    } else {
        $('#logList').append('<li>Offline sermon data available.');
        loadLocalSermon();
    }
}

function refreshSermon() {
    // Make sure its online
    $('#sermonFooter').append('Refreshing sermon from web');
    if (isOnline) {
      // make a request
        $('#logList').append('<li>Download sermon. ' + isOnline);
        downloadSermon();
        loadLocalSermon();
    } else {
      // load from localStorage
        loadLocalSermon();
    }
}

function downloadSermon() {
    // Get JSON from website SermonSpeaker component
   	$.getJSON('http://www.cccmy.org/index.php?option=com_sermonspeaker&view=sermons&format=json', function(sermons) {
        // Convert JSON to string
        $('#logList').append('<li>Converting sermon JSON to String');
        var localSermonData = JSON.stringify(sermons);
        // Saving string to local storage
        $('#logList').append('<li>Saving sermon string to storage.');
        window.localStorage.setItem('sermonData16', localSermonData);
        $('#logList').append('<li>Sermon saved to storage.');
	});
}

function loadLocalSermon() {
    // Retrieve string from storage and parse into JSON
    $('#logList').append('<li>Getting local storage for sermons');
    var sermons = JSON.parse(window.localStorage.getItem('sermonData16'));
	var imagePath = "";

    $('#logList').append('<li>Displaying sermons.');
    $('#sermonList').empty();
    $.each(sermons.data, function(index, sermon){
		if (sermon.picture=="") {
		    imagePath = sermon.series.avatar;
		} else {
		    imagePath = sermon.picture;
		}
		$('#sermonList').append('<li>' +
			'<details><summary><img id="sermonPic" src="' + homeURL + '/' + imagePath + '"/>' +
			'<h4>' + sermon.title + '</h4>' +
			'<p>' + sermon.speaker.title + ' | ' +
			sermon.sermon_date + '|' +
			sermon.sermon_time + '</p></summary>' +
			'<video width="320" height="240" controls><source src="' + homeURL + sermon.videofile + '" type="video/mp4"></video>' +
			'<span><a href="' + homeURL + sermon.videofile + '">Download Video</a></span><br/>' +
			'<audio controls><source src="' + homeURL + sermon.audiofile + '" type="audio/mp4"></audio>' +
			'<span><a href="' + homeURL + sermon.audiofile + '">Download Audio</a></span><br/>' +
			'<p>' + sermon.notes + '</p></details>');
	});
    $('#logList').append('<li>Sermon loaded');
    
    $('#sermonList').refresh;
}


function ermonList() {

	
}
