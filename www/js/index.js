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
var online = navigator.onLine || false;
var admobid = {};
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log('setup device ready');
        document.addEventListener('deviceready', this.onDeviceReady, false);
        console.log('setup back button');
	    document.addEventListener("backbutton", function (e) {
    	    e.preventDefault(); 
        	navigator.notification.confirm("Are you sure want to exit?", app.onConfirmExit, "Confirmation", ['Yes','No']);
    	}, false );
    	console.log('setup online/offline detection');
	    document.addEventListener("offline", app.toggleOnline, false);
	    document.addEventListener("online", app.toggleOnline, false);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
//        $.mobile.loading("show", { text: "Loading", textVisible: true, theme: "a", textonly: "", html: "" });
        console.log('Device Ready');
        app.receivedEvent('appStatus');
//        $.mobile.loading("hide");

    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.loading');
        var receivedElement = parentElement.querySelector('.completed');

        console.log('Received Event: ' + id);
//        app.loadNews();
		$('#refreshNewsButton').on("click", app.loadNews());
        console.log('Download News complete');
//        app.loadSermons();
    	$('#refreshSermonButton').on("click", app.loadSermons());
        console.log('Download Sermons complete');
        app.getPlaylist();
    	$('#refreshYouTubeButton').on("click", app.loadYouTube());
//        app.loadYouTube();
		console.log('Setup AdMob');
		app.defineAdMobId();
		console.log('Start AdMob banner');
//		app.initAdMob();
		console.log('AdMob started');
//		window.plugin.toast.showShortBottom('loading complete');
        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');
		console.log('Deviceready completed');
    },
    
    // Exit app on confirmation
    onConfirmExit: function(button) {
   		console.log('button pressed=' +  button);
        if(button==2){ //If User select a No, then return back;
    		console.log('exit canceled');
	        return;
    	}else{
    		console.log('exit confirmed');
        	navigator.app.exitApp(); // If user select a Yes, quit from the app.
    	}
      
    },
    
    // Toggle online & offline
    toggleOnline: function(e) {
	    // Handle the online event
	
		if ((e.type == "offline") && (online)) {
		    online = false;
			window.plugin.toast.showShortBottom('offline');
	        $('#refreshNewsButton').hide;
	        $('#refreshSermonButton').hide;
	        $('#refreshYouTubeButton').hide;
		} else {
			if (!online) {
	        	online = true;
				window.plugin.toast.showShortBottom('online');
		        $('#refreshNewsButton').show;
		        $('#refreshSermonButton').show;
		        $('#refreshYouTubeButton').show;
			}
		}
	},
	
	loadNews: function() {
		console.log('Loading news');
	    try {var localNewsData = window.localStorage.getItem('blogData16');}
	    catch(err) {console.log(err.message);}
//		var localNewsData = window.localStorage.getItem('blogData16');
//	    console.log(localNewsData);
	    if (localNewsData===null) {
    	    if (online) {
        		// Local storage does not exist, need to download
	    		console.log('No news data but online. Downloading');
	        	app.downloadNews();
	        } else {
	    		console.log('No news data and not online. Display message');
	            $('#newsList').empty();
	            $('#newsList').append('No news data and no internet connection');
	            $('#newsList').refresh;
	        }
    	} else {
	        console.log('Offline news data available.');
	        app.openNews(localNewsData);
	    }
		
	},
	
	// Download news from blog
	downloadNews: function() {
		// Get JSON from blog rss
		console.log('Starting download news');
	    $.getJSON('http://blog.cccmy.org/feeds/posts/default?alt=json', function(blog){
	        // Convert JSON to string
	        console.log('Saving JSON to local storage');
	        var localNewsData = JSON.stringify(blog);
	        console.log('Saving news string to storage.');
	        // Saving string to local storage
	        window.localStorage.setItem('blogData16', localNewsData);
	        console.log('News saved to storage.');
	        app.displayNews(blog);
	    });

	},
	
	// Open news from local storage
	openNews: function(newsData) {
	    // Retrieve string from storage and parse into JSON
	    console.log('Getting local news storage');
	    var news = JSON.parse(newsData);
	    console.log('Displaying news feed');
//        console.log(news);
        app.displayNews(news); 
	
	},
	
	
	// Update News List from JSON data
	displayNews: function(news) {
	    var imagePath = "";
	    console.log('Displaying news');
	    $('#newsList').empty();
	    $.each(news.feed.entry, function(index, newsitem){
			if (newsitem.media$thumbnail != null) {
			    imagePath = '<img id="newsPic" src="' + newsitem.media$thumbnail.url + '"/>';
			} else {
			    imagePath = "";
			}
	        $('#newsList').append('<li>' +
			    '<details><summary>' + imagePath +
	            '<h4>' + newsitem.title.$t + '</h4>' +
	            '<p>' + newsitem.updated.$t + '</p></summary>' +
	            '<span>' + newsitem.content.$t + '</span></details>');
	    });
	    console.log('News loaded');
	    $('#newsList').refresh;
		
		
	},

	loadSermons: function() {
		console.log('Loading sermons');
	    try {var localSermonsData = window.localStorage.getItem('sermonData16');}
	    catch(err) {console.log(err.message);}
//		var localSermonsData = window.localStorage.getItem('sermonData16');
//	    console.log(localSermonsData);
	    if (localSermonsData===null) {
    	    if (online) {
        		// Local storage does not exist, need to download
	    		console.log('No sermon data but online. Downloading');
	        	app.downloadSermons();
	        } else {
	    		console.log('No sermon data and not online. Display message');
	            $('#sermonList').empty();
	            $('#sermonList').append('No sermon data and no internet connection');
	            $('#sermonList').refresh;
	        }
    	} else {
	        console.log('Offline sermon data available.');
	        app.openSermons(localSermonsData);
	    }
		
	},
	
	//Download Sermon from website
	downloadSermons: function() {
	    // Get JSON from website SermonSpeaker component
	   	$.getJSON('http://www.cccmy.org/index.php?option=com_sermonspeaker&view=sermons&format=json', function(sermons) {
	        // Convert JSON to string
	        console.log('Converting sermon JSON to String');
	        var localSermonData = JSON.stringify(sermons);
	        // Saving string to local storage
	        console.log('Saving sermon string to storage.');
	        window.localStorage.setItem('sermonData16', localSermonData);
	        console.log('Sermon saved to storage.');
	        app.displaySermons(sermons);
		});

	},
	
	// Open Sermons from local storage
	openSermons: function(sermonData) {
	    // Retrieve string from storage and parse into JSON
	    console.log('Getting sermons from local storage');
	    var sermons = JSON.parse(sermonData);
	    console.log('Displaying sermons lists');
//        console.log(sermons);
        app.displaySermons(sermons);
	},

	
	//Update Sermon list from JSON data
	displaySermons: function(sermons) {
		// Retrieve string from storage and parse into JSON
	    console.log('Getting local storage for sermons');
		var imagePath = "";
	
	    console.log('Displaying sermons.');
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
	    console.log('Sermon loaded');
	    
	    $('#sermonList').refresh;

		
	},
	
	// Get YouTube playlist list
	getPlaylist: function() {
		console.log('Loading Playlist');
	    try {var localPlaylistData = window.localStorage.getItem('PlaylistData16');}
	    catch(err) {console.log(err.message);}
//		var localPlaylistData = window.localStorage.getItem('PlaylistData16');
//	    console.log(localPlaylistData);
	    if (localPlaylistData===null) {
    	    if (online) {
        		// Local storage does not exist, need to download
	    		console.log('No YouTube Playlist data but online. Downloading');
	        	app.downloadPlaylist();
	        } else {
	    		console.log('No YouTube data and not online. Display message');
	            $('#YouTubePlaylist').empty();
	            $('#YouTubePlaylist').append('No YouTube Playlist data and no internet connection');
	            $('#YouTubePlaylist').refresh;
	        }
    	} else {
	        console.log('Offline YouTube Playlist data available.');
	        app.openPlaylist(localPlaylistData);
	    }				
	},
	
	// Download latest playlist from internet
	downloadPlaylist: function() {
		
		// Get JSON from youtube api
		console.log('Starting download YouTube playist');
	    $.getJSON('https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=UC6pTxCgenv9woH0GWCigdrw&fields=items(id%2Csnippet%2Ftitle)&key=AIzaSyBmWnBwOAZCYN-2Kny8Z1-DKFjxFrbALMc', function(Playlists){
	        // Convert JSON to string
	        console.log('Saving YouTube Playlist JSON to local storage');
	        var localPlaylistData = JSON.stringify(Playlists);
	        console.log('Saving YouTube playlist string to storage.');
	        // Saving string to local storage
	        window.localStorage.setItem('PlaylistData16', localPlaylistData);
	        console.log('YouTube playlist saved to storage.');
	        app.displayPlaylistSelector(playlists);
	    });

	},
	
	// Get playlist from local storage
	openPlaylist: function(playlistData) {
	    // Retrieve string from storage and parse into JSON
	    console.log('Getting playlist from local storage');
	    var playlists = JSON.parse(playlistData);
	    console.log('Displaying playlist selector');
//        console.log(sermons);
        app.displayPlaylistSelector(playlists);
		
		
	},
	
	//Display YouTube playlist in a selector
	displayPlaylistSelector: function(playlists) {
		// Create playlist selections
		$('#YouTubePlaylist').empty();
	    $.each(playlists.items, function(index, playlist){
	        $('#YouTubePlaylist').append('<option value="' +
	        	playlist.id + '">' + 
	        	playlist.snippet.title + '</option>');

	    });		
        $('#YouTubePlaylist').refresh;
	},
	
	// Check online status and either download or load from local storage
	loadYouTube: function() {
		console.log('Loading YouTube');
	    try {var localYouTubeData = window.localStorage.getItem('YouTubeData16');}
	    catch(err) {console.log(err.message);}
//		var localYouTubeData = window.localStorage.getItem('YouTubeData16');
//	    console.log(localYouTubeData);
	    if (localYouTubeData===null) {
    	    if (online) {
        		// Local storage does not exist, need to download
	    		console.log('No YouTube data but online. Downloading');
	        	app.downloadYouTube();
	        } else {
	    		console.log('No YouTube data and not online. Display message');
	            $('#YouTubeList').empty();
	            $('#YouTubeList').append('No YouTube data and no internet connection');
	            $('#YouTubeList').refresh;
	        }
    	} else {
	        console.log('Offline YouTube data available.');
	        app.openYouTube();
	    }		
		
	},
	
	// Download YouTube json from internet
	downloadYouTube: function() {
		// Get JSON from youtube api
		console.log('Starting download YouTube channels');
		console.log($('#YouTubePlaylist').val());
	    $.getJSON('https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails%2Csnippet&playlistId=PLtyDA40P3PB0mzn4XffUMdryzYwDtK5dd&key=AIzaSyBmWnBwOAZCYN-2Kny8Z1-DKFjxFrbALMc', function(YouTube){
	        // Convert JSON to string
	        console.log('Saving YouTube JSON to local storage');
	        var localYouTubeData = JSON.stringify(YouTube);
	        console.log('Saving YouTube string to storage.');
	        // Saving string to local storage
	        window.localStorage.setItem('YouTubeData16', localYouTubeData);
	        console.log('YouTube data saved to storage.');
	        app.displayYouTube(YouTube);
	    });
		
		
	},
	
	// Open YouTube list from local storage
	openYouTube: function() {
	    // Retrieve string from storage and parse into JSON
	    console.log('Getting YouTube from local storage');
		console.log($('#YouTubePlaylist').val());
	    var YouTube = JSON.parse(window.localStorage.getItem('YouTubeData16'));
	    console.log('Displaying YouTube list');
        //console.log(YouTube);
        app.displayYouTube(YouTube);
				
	},
	
	// Display YouTube listing in DOM
	displayYouTube: function(YouTube) {
	    var imagePath = "";
	    console.log('Displaying YouTube in listview');
	    $('#YouTubeList').empty();
	    $.each(YouTube.items, function(index, video){
			if (video.snippet.thumbnails.default != null) {
			    imagePath = '<img id="YouTubePic" src="' + video.snippet.thumbnails.default.url + '"/>';
			} else {
			    imagePath = "";
			}
	        $('#YouTubeList').append('<li>' +
			    '<details><summary>' + imagePath +
	            '<h4>' + video.snippet.title + '</h4>' +
	            '<p>' + video.snippet.publishedAt + '</p></summary>' +
	            '<span>' + video.snippet.description + '</span></details>');
	    });
	    console.log('YouTube loaded');
	    $('#YouTubeList').refresh;
		
		
	},
	
	
	// Assign AdMob ID base on device
	defineAdMobId: function() {
		if( /(android)/i.test(navigator.userAgent) ) { 
			admobid = { // for Android
			    banner: 'ca-app-pub-2323590839035723/2127336337',
			    interstitial: 'ca-app-pub-2323590839035723/7416990337'
			};
		} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
		  	admobid = { // for iOS
		    	banner: 'ca-app-pub-2323590839035723/1510057530',
		    	interstitial: 'ca-app-pub-2323590839035723/8893723534'
			};
		} else {
			admobid = { // for Windows Phone
		    	banner: 'ca-app-pub-2323590839035723/7277389537',
		    	interstitial: 'ca-app-pub-2323590839035723/8754122734'
		  	};
		}
	},
	
	initAdMob: function() {
		console.log(AdMob);
		if (! AdMob ) { console.log( 'admob plugin not ready' ); return; }
			
		// this will create a banner on startup
		console.log("Running Ad");
		AdMob.createBanner( {
			adId: admobid.banner,
		    position: AdMob.AD_POSITION.BOTTOM_CENTER,
		    isTesting: true, // TODO: remove this line when release
			overlap: false,
			offsetTopBar: false,
			bgColor: 'black'
		});
		
	}


};
