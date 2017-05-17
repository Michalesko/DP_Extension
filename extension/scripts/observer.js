(function(){

	this.Observer = (function(){

		var connection = null;
		var uid;
		var goals = [];
		var myHash = {};
		var restrictedURLs;
		var interval = null;
		var updateTime;
		var currentTabInfo = {};
		var userActive = true;
		var settings;
		var listen;
		var blank;
		var tab_replaced, tab_updated, tab_activated, tab_deleted;
		var isTesting;
		var recomRating;

		function Observer(userID, userGoals){
			uid = userID;
			goals = userGoals;
			restrictedURLs = Config.getRestrictedURLs();
			updateTime = Config.getUpdateTime();
			blank = Config.getBlank();
			settings = Config.getTimeTrackSettings();
			isTesting = Config.getTestingMode();
			connection = new Connection();
			sendUserTime();
			resetTimer();
		};

		Observer.prototype.start = function(){
			chrome.webNavigation.onTabReplaced.addListener(tab_replaced);
			chrome.tabs.onUpdated.addListener(tab_updated);
			chrome.tabs.onActivated.addListener(tab_activated);
			chrome.runtime.onMessage.addListener(listen);
			return chrome.tabs.onRemoved.addListener(tab_deleted);
		};

		function getTime(){
	      	return new Date().getTime();
	    };

	    // handle cached tabs in browser
	    tab_replaced = function(details){
	    	chrome.tabs.get(details.tabId, function(tab){
	    		if(isTesting){
	    			console.log("TAB CACHED... URL tabu: " + tab.url + " ID tabu: " + tab.id + " ...id usera: " + uid + 
	    	 		"\n ...FAVIKONA tabu: " + tab.favIconUrl + " TITLE tabu: " + tab.title);
	    		}
		        handleTab(uid, tab);
	    	 	getCurrent(tab);
		    });
	    };

	    // handle all non-cached tabs
		tab_updated = function(tabId, changeInfo, tab){
			if((changeInfo.status === 'complete') && (restrictedURLs.indexOf(tab.url) == -1) && (tab.title != "EffectiveBrowsing")){
				if(isTesting){
					console.log("TAB UPDATED... URL tabu: " + tab.url + " ID tabu: " + tab.id + " ...id usera: " + uid + 
	    	 		"\n ...FAVIKONA tabu: " + tab.favIconUrl + " TITLE tabu: " + tab.title);
	    	 		console.log("tab URL: " + tab.favIconUrl);
				}
				handleTab(uid, tab);
				getCurrent(tab);
			}
		};

		tab_activated = function(activeInfo){
			chrome.tabs.get(activeInfo.tabId, function(tab){
		    	if(chrome.runtime.lastError){
		    		if(isTesting){
			        	console.log("***ERROR***: " + chrome.runtime.lastError.message);
		    		}
			        return;
			    }else{
			     	getCurrent(tab);
			    }
		    });
		};

		// remove tab from storage
		tab_deleted = function(tabId){
			chrome.storage.sync.get(['userTabs'], function(data){
				if(data.userTabs != undefined){
					if(Object.keys(data.userTabs).indexOf(tabId.toString()) != -1){
						delete data.userTabs[tabId];
						chrome.storage.sync.set(data);
						if(isTesting){
							console.log("TAB DELETED..." + " ID tabu: " + tabId + " ...id usera: " + uid);
						}
					}
				}
			});
		};

		// tab showing notification handling
		function handleTab(uid, tab){
			var url = new URL(tab.url).hostname;

	    	return connection.getUserRating(uid, url, tab.id, function(data){
	    		if(isTesting){
	    			console.log("userov rating na stranku: " + url + " je: " + data['rate_id']);
	    		}
				if((data['rate_id'] == 0 || data['rate_id'] == 6) && data['rate_type'] == 'recom'){
					chrome.tabs.executeScript(tab.id, {
						file: 'inject.js'
					}, function(){
						if(chrome.runtime.lastError){
							if(isTesting){
								console.log(chrome.runtime.lastError.message);
							}
					       	return;
					    }
					});

				}else{
					// user's own rating
					if(data['rate_type'] == 'own'){
						if(isTesting){
							console.log("mame VLASTNE hodnotenie...." + data['rate_id']);
						}
	                    var favicon;

                    	if(tab.favIconUrl == undefined){
							favicon = blank + '?query=' + Date.now();
						}else{
							favicon = tab.favIconUrl;
						}

						updateTimeRating(tab.id, data['rate_id']);
						updateBrowserTabsStorage(tab.id, data['rate_id'], favicon, tab.title);


	                    if(goals.indexOf(data['rate_id']) == -1){
	                    	if(isTesting){
	                    		console.log("......posielam spravu na zmenu textu a favikony");
	                    	}
	                    	return chrome.tabs.sendMessage(tab.id, {message: "changeTab", title: tab.title, titleChange: 1});
	                    }
	                    // return;
					// recommendation beside rating category no. 6 - (Don't know)
					}else{

						recomRating = data['rate_id'];
						if(isTesting){
							console.log("mame ODPORUCANIE! " + recomRating);
						}
						chrome.tabs.executeScript(tab.id, {file: "inject2.js"}, function(){
							if(chrome.runtime.lastError){
								if(isTesting){
						       		console.log(chrome.runtime.lastError.message);
						       	}
						       	return;
						    }
						    return chrome.tabs.sendMessage(tab.id, {param: data['category_rate'], param2: recomRating});
						});

					}
				}
			});
	    };

	    // main listener for all communication wih background script
		listen = function(request){
		    var userRating;
		    var actualTab;
		    if(request.userActive || request.userActive == false){
		        	userActive = request.userActive;
		    }
		    else if(request.extMessage == "nonRating"){
		    	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
					chrome.tabs.sendMessage(tabs[0].id, {message: "extClosing"});
					var url = new URL(tabs[0].url).hostname;
					sendNewOne(url, 6, tabs[0].id, 0, 0, 3, 1, function(response){
	    				if(isTesting){
	    					console.log("rating response AJAX: " + response);
	    				}
		    		});
				});
			}
			else{
		        userRating = request.data;
		  		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		  			actualTab = tabs[0];
		  			if(isTesting){
			        	console.log("User odoslal hodnotenie stranky... " + request.extMessage);
			        	console.log("User odoslal hodnotenie stranky2... " + userRating);
			        }
					updateTimeRating(actualTab.id, userRating);

					var favicon;
					if(isTesting){
						console.log("actualTab URL: " + actualTab.favIconUrl);
					}
					if(actualTab.favIconUrl == undefined){
						favicon = blank + '?query=' + Date.now();
					}else{
						favicon = actualTab.favIconUrl;
					}
					updateBrowserTabsStorage(actualTab.id, userRating, favicon, actualTab.title);
					chrome.tabs.sendMessage(actualTab.id, {message: "extClosing"});

	                if(goals.indexOf(parseInt(userRating)) == -1){
	                	if(isTesting){
	                		console.log("......posielam spravu na zmenu textu a favikony");
	                	}
	                	chrome.tabs.sendMessage(actualTab.id, {message: "changeTab", title: actualTab.title, titleChange: 1});
	                }
	             
					var url = new URL(actualTab.url).hostname;
					if(request.extMessage == "rating"){
		    			sendNewOne(url, userRating, actualTab.id, request.changed, 0, 2, 1, function(response){
		    				if(isTesting){
		    					console.log("rating response AJAX: " + response);
		    				}
		    			});
		    		}
		    		else if(request.extMessage == "nonRatingRecom"){
		    			sendNewOne(url, userRating, actualTab.id, request.changed, 0, 2, 2, function(response){
		    				if(isTesting){
		    					console.log("rating response AJAX: " + response);
		    				}
		    			});
		    		}
		    		else if(request.extMessage == "updateRating"){
		    			sendNewOne(url, userRating, actualTab.id, request.changed, recomRating, 2, 2, function(response){
		    				if(isTesting){
		    					console.log("rating response AJAX: " + response);
		    				}
		    			});
		    		}
		    	});
		    }
		};

		// sending rating to DB
		function sendNewOne(url, rating, tab_id, changed, rateFrom, flag, type, handleData){
	        return connection.rateWebsite(uid, {
	            rating: rating,
	            url: url,
	            rating_type: type,
	            rating_flag: flag,
	            tab: tab_id,
	            created: getTime(),
	            updated: getTime(),
	            changed: parseInt(changed),
	            rateFrom: rateFrom
	            }, function(output){
	                var url = output['url'];
	                handleData(url);
	        });
	    };

	    // store users tabs in storage
	    function updateBrowserTabsStorage(tabId, rating, favicon, title){
	    	return chrome.storage.sync.get(['userTabs'], function(data){

	    		if(data.userTabs){
	    			if(isTesting){
	    				for(key in data.userTabs){
		    				console.log("pred pridanim: "+data.userTabs[key] + "...kluc: " + key);
		    			}
	    			}

	    			data.userTabs[tabId] = [rating, favicon, title];

	    			if(isTesting){
	    				for(key in data.userTabs){
			    			console.log(data.userTabs[key] + " key: " + key);
			    		}
	    			}
			    	
		    		return chrome.storage.sync.set(data);
	    		}else{
	    			var brwsrTabs = {};
	    			brwsrTabs[tabId] = [rating, favicon, title];

	    			if(isTesting){
	    				for(key in brwsrTabs){
				    		console.log(brwsrTabs[key] + " key: " + key);
				    	}
	    			}
			    	
			    	return chrome.storage.sync.set({
			    		'userTabs': brwsrTabs
			    	});
	    		}
		    });
	    };

		// reset timer for tracking user time
		function resetTimer(){
			chrome.storage.local.get('trackTime', function(data){
				if(!$.isEmptyObject(data)){
					chrome.storage.local.remove('trackTime');
				}
			});
		};

		// get actual website and check if is not on blacklist
		function getCurrent(tab){
	        var found = false;
	        var hostname = new URL(tab.url).hostname;
	        for(var i=0; i<settings.blacklist.length; i++){
	            if(settings.blacklist[i] === hostname){
	                found = true;
	            }
	        }
	        if(!found){
	            getURL(tab.url, tab.id);
	            clearInterval(interval);
	            interval = null;
	            interval = setInterval(function(){
	                updateURL();
	            }, updateTime);
	        }else{
	            clearInterval(interval);
	            interval = null;
	            return;
	        }
		};

		// storing data about actual tracking website
		function getURL(url, tabId){
		    chrome.storage.local.get(['trackTime', 'trackTimeRatings'], function(data){
		        var index, found;
		        var hostname = new URL(url).hostname;
		        var flag = 0;

		        if(!$.isEmptyObject(data.trackTimeRatings)){
		        	if(goals.indexOf(parseInt(data.trackTimeRatings[tabId])) != -1){
		        		flag = 1;
		        	}
	        	}

		        if($.isEmptyObject(data.trackTime)){
		            currentTabInfo.id = '_' + Math.random().toString(36).substr(2, 9);
		            currentTabInfo.title = hostname;
		            currentTabInfo.time = 0;
		            var obj = {
		                'trackTime': [{
		                    'id': currentTabInfo.id,
		                    'title': currentTabInfo.title,
		                    'time': currentTabInfo.time,
		                    'flag': flag
		                }]
		            };
		            chrome.storage.local.set(obj);
		            return;
		        }

		        $.each(data.trackTime, function(idx, val){
		            if(val.title === hostname){
		                index = idx;
		                found = true;
		                return false;
		            }
		        });

		        if(found){
		            var retrieved = data.trackTime[index];
		            currentTabInfo.id = retrieved.id;
		            currentTabInfo.title = retrieved.title;
		            currentTabInfo.time = retrieved.time;
		            currentTabInfo.flag = flag;
		            if(isTesting){
		            	console.log("UZ SOM RAZ NAVSTIVIL PAGE: " + currentTabInfo.flag);
		            }
		            
		        }else{
		            currentTabInfo.id = '_' + Math.random().toString(36).substr(2, 9);
		            currentTabInfo.title = hostname;
		            currentTabInfo.time = 0;
		            currentTabInfo.flag = flag;
		            if(isTesting){
		            	console.log("PRVY KRAT SOM NAVSTIVIL PAGE: " + currentTabInfo.flag);
		            }

		            data.trackTime.push({
		                'id': currentTabInfo.id,
		                'title': currentTabInfo.title,
		                'time': currentTabInfo.time,
		                'flag': currentTabInfo.flag
		            });	
		        }	        
		        return chrome.storage.local.set(data);
		    });
		};

		// updating time for website
		function updateURL(){
		    if(userActive){
		    	if(isTesting){
		    		console.log('User is active on ' + currentTabInfo.title);
		    	}
		        
		        return chrome.storage.local.get('trackTime', function(data){
		            var index;
		            if(!$.isEmptyObject(data.trackTime)){
			            $.each(data.trackTime, function(idx, val){
			                if(val.title === currentTabInfo.title){
			                    index = idx;
			                    return false;
			                }
			            });
		            data.trackTime[index].time = data.trackTime[index].time + 1;
		            data.trackTime[index].flag = currentTabInfo.flag;
		            return chrome.storage.local.set(data);
			        }
			        return;
		        });
		    }else{
		    	if(isTesting){
		    		console.log('User is not active on ' + currentTabInfo.title);
		    	}
		        
		    }
		};

		// helper function for storing user's rating on each website to recognize time spent on browsing category (goal vs nonGoal)
		function updateTimeRating(tabId, userRating){
			return chrome.storage.local.get('trackTimeRatings', function(data){
		        if($.isEmptyObject(data.trackTimeRatings)){
		            var obj = {};
		            obj[tabId] = userRating;
		            return chrome.storage.local.set({'trackTimeRatings': obj});
		        }else{
		        	data.trackTimeRatings[tabId] = userRating;
		            return chrome.storage.local.set(data);
		        }
		    });
		};

		// function for updating user's time spent in 2 categories goal vs nonGoal
		function sendUserTime(){
			return chrome.storage.local.get('trackTime', function(data){
				var goal = 0;
				var nonGoal = 0;

				if($.isEmptyObject(data)){
					connection.updateTime(uid, goal, nonGoal);
		            return;
		        }else{
		        	$.each(data.trackTime, function(idx, val){
			            if(val.time !== 0){
			                var value = (val.time * 2) / 60;
			                if (value === 0) return;

			                if(isTesting){
			                    console.log(val.flag + typeof val.flag);
			                }
			                
			                if(parseInt(val.flag) == 1){
			                    goal = goal + value;
			                }else{
			                    nonGoal = nonGoal + value;
			                }
			            }
			        });
			        goal = parseFloat(parseFloat(Math.round(goal * 100) / 100).toFixed(2));
			        nonGoal = parseFloat(parseFloat(Math.round(nonGoal * 100) / 100).toFixed(2));

					connection.updateTime(uid, goal, nonGoal);
		        }
			});
		};

		return Observer;
	})();

}).call(this)




