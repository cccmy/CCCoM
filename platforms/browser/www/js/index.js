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
	    document.addEventListener("offline", app.toggleOnline, false);
	    document.addEventListener("online", app.toggleOnline, false);
    	
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('App Started');
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        app.loadNews();
        console.log('Download News complete');
        app.loadSermons();
        console.log('Download Sermons complete');
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
	        app.openNews();
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
	openNews: function() {
	    // Retrieve string from storage and parse into JSON
	    console.log('Getting local news storage');
	    var blog = JSON.parse(window.localStorage.getItem('blogData16'));
	    console.log('Displaying news feed');
//        console.log(blog);
        app.displayNews(blog); 
	
	},
	
	
	// Update News List from JSON data
	displayNews: function(blog) {
	    var imagePath = "";
	    console.log('Displaying news');
	    $('#newsList').empty();
	    $.each(blog.feed.entry, function(index, news){
			if (news.media$thumbnail != null) {
			    imagePath = '<img id="newsPic" src="' + news.media$thumbnail.url + '"/>';
			} else {
			    imagePath = "";
			}
	        $('#newsList').append('<li>' +
			    '<details><summary>' + imagePath +
	            '<h4>' + news.title.$t + '</h4>' +
	            '<p>' + news.updated.$t + '</p></summary>' +
	            '<span>' + news.content.$t + '</span></details>');
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
	        app.openSermons();
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
	openSermons: function() {
	    // Retrieve string from storage and parse into JSON
	    console.log('Getting sermons from local storage');
	    var sermons = JSON.parse(window.localStorage.getItem('sermonData16'));
	    console.log('Displaying sermons lists');
//        console.log(sermons);
        app.displaySermons(sermons);
	},

	
	//Update Sermon list from JSON data
	displaySermons: function(sermon) {
		// Retrieve string from storage and parse into JSON
	    console.log('Getting local storage for sermons');
		var imagePath = "";
	
	    console.log('Displaying sermons.');
	    $('#sermonList').empty();
	    $.each(sermon.data, function(index, sermon){
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

		
	}

};
