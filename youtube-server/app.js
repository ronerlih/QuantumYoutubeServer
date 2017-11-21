 var express = require('express'),
 		 request = require('request'),
     poster =  require("poster"),
		 googleapis = require('googleapis'),
		 googleAuth = require('google-auth-library');
		 
 var youtube = googleapis.youtube({
   version: 'v3',
   auth: "AIzaSyBztt9ilkqNPcf7RKqmgihAPrIHxkWfri8"
});
var cors = require('cors');


 var results = '';
 var data_q;
 var json2steps = {};
 var urlKey = "url";
 var idKey = "id";
 var statsKey = "stats";
 var responseCountr = 0;
 json2steps[idKey] = [];
	 var array2steps = [];
	var maxResultsRequest = 5;
	var kind,etag;
	var statsArray = [];
	var generalArray = [];
	var commentsArray = [];
	var dataArray = [];
 //init server
 var app = express();

app.use(cors({origin: '*'}));

 // Oauth2 api key
// var apiKey = 'AIzaSyBztt9ilkqNPcf7RKqmgihAPrIHxkWfri8';
// var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
// var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

 app.get('/search', function (req, res) {
	
	//resopond to no query
	if(req.query.id == null && req.query.q == null && req.query.qStats == null){
		 res.send("YO! search query is empty, please add ?q=quary at the end of the url");
     console.log("requested to: /search");
		 console.log("client request: " + JSON.stringify( req.originalUrl));
		 console.log("at: " + new Date().toISOString() + " \nfrom: " + req.ip + "\n - done - \n");

	}
	
	//return id search
	if (req.query.id != null && req.query.q == null && req.query.qStats == null){
		youtube.videos.list({
			part: 'statistics',
			id: req.query.id
			}, function (err, data) {
			if (err) {
				console.error('Error: ' + err);
			}
			if (data) {
				console.log(JSON.stringify( data,null,2));
				res.send(data);
        console.log("requested to: /search");
				console.log("client request: " + JSON.stringify( req.originalUrl));
				console.log("at: " + new Date().toISOString() + " \nfrom: " + req.ip + "\n - done - \n");
			}
		});
	}
	
	//return general search
	if (req.query.q != null && req.query.id == null && req.query.qStats == null){
		youtube.search.list({
			part: 'snippet',
			q: req.query.q,
			maxResults: '50',
			'type': 'video'
			}, function (err, data) {
			if (err) {
				console.error('Error: ' + err);
			}
			if (data) {
				console.log(JSON.stringify( data, null,2));
				res.send( data);
        console.log("requested to: /search");
				console.log("client request: " + JSON.stringify( req.originalUrl));
			  console.log("at: " + new Date().toISOString() + " \nfrom: " + req.ip + "\n - done - \n");
			}
		});
	}
	
	//both
	if (req.query.q != null && req.query.id != null && req.query.qStats == null){
		youtube.search.list({
			part: 'snippet',
			q: req.query.q,
			maxResults: '30',
			'type': 'video'
			}, function (err, data) {
			if (err) {
				console.error('Error: ' + err);
			}
			if (data) {
			data_q = data;
			
			// search id
			youtube.videos.list({
			part: 'statistics',
			id: req.query.id
			}, function (err, data_id) {
			if (err) {
				console.error('Error: ' + err);
			}
			if (data_id ) {
				console.log("data_q: " + JSON.stringify(data_q,null, 2));
				console.log("data_id: " + JSON.stringify(data_id,null, 2));
				var multiResponse = [data_id, data_q];
				
				res.send(multiResponse);
     		console.log("requested to: /search");
				console.log("client request: " + JSON.stringify( req.originalUrl));
				console.log("at: " + new Date().toISOString() + " \nfrom: " + req.ip + "\n - done - \n");
				
			}
		});
			}
			
		});
		
		
	}
	//comprehansive 2 step search
	 if( req.query.qStats != null){
	 //max results
		if(req.query.maxResults != null){
			maxResultsRequest = req.query.maxResults.toString();
		}else{maxResultsRequest ='5'} 
		
		youtube.search.list({
				part: 'snippet',
				q: req.query.qStats,
				maxResults: maxResultsRequest,
				'type': 'video'
				}, function (err, data) {
				if (err) {
					console.error('Error: ' + err);
				}
				if (data) {
					dataArray = data.items;
					var idArray = [];
					console.log("dataArray.length: " + dataArray.length);
//					//cycle through data and request stats
						responseCountr = 0;
						commentsResponseCountr = 0;
						
						data.items.forEach(function(video){
									youtube.videos.list({
									part: 'statistics,contentDetails,snippet',
									id: video.id.videoId
										}, function (err, data_id) {
										if (err) {
											console.error('Error: ' + err);
										responseCountr ++;
											
										}
										if (data_id ) {
										statsArray.push(data_id);
										generalArray.push(dataArray[responseCountr]);
										console.log("i: " + responseCountr);
//										console.log("\nstatistics attay: " + JSON.stringify(idArray[responseCountr]));
//										console.log("\nvideo data array: " + JSON.stringify(dataArray[responseCountr]));
										console.log("\nstatistics attay: " + JSON.stringify(statsArray[responseCountr]));
										console.log("\nvideo data array: " + JSON.stringify(generalArray[responseCountr]));
										}
										
								
										
										responseCountr ++;
										
									});
									
											//get comments
										youtube.commentThreads.list({
													part: 'snippet,replies',
													videoId:  video.id.videoId
													}, function (err, data_comments) {
													if (err) {
														console.error('Error: ' + err);
													commentsResponseCountr++;
													}
													if (data_comments) {
														commentsArray.push(data_comments);
//														console.log("responseCountr: " + commentsResponseCountr);
//														console.log("comments :" + JSON.stringify(data_comments));
													
													//send
													console.log("\ndata.items.length: " + data.items.length +
																			"\ncommentsResponseCountr: " + commentsResponseCountr +
																			"\nresponseCountr" + responseCountr);
													commentsResponseCountr++;

													if(commentsResponseCountr == data.items.length && responseCountr == data.items.length ){
															var responseArray = {};
															for(var i = 0; i < generalArray.length ; i++){
															responseArray[dataArray[i].id.videoId] = {};
															responseArray[dataArray[i].id.videoId]["info"] = generalArray[i];
															responseArray[dataArray[i].id.videoId]["stats"] = statsArray[i];
															responseArray[dataArray[i].id.videoId]["comments"] = commentsArray[i];
//															responseArray[dataArray[i].id.videoId] = [ generalArray, statsArray, commentsArray];
															}
															res.send(responseArray);
															
															//clear
															generalArray = [];
															statsArray = [];
															commentsArray = [];
															dataArray = [];
													}
													
													
													}
													
												
										});
						});
						
						
						 
						
						
						
//					
////					console.log("\n number of items: " + data.items.length);
//					
//					for( i = 0; i < data.items.length ; i++){
//							// search id
//							youtube.videos.list({
//							part: 'statistics',
//							id: data.items[i].id.videoId
//								}, function (err, data_id) {
//									if (err) {
//										console.error('Error: ' + err);
//									}
//									if (data_id ) {
//										array2steps.push( data_id);
//										array2steps.push(data);
//										console.log("data_id: " + JSON.stringify(data_id,null, 2));
//										
//										responseCountr ++;
//							
//										}
//										if (responseCountr ==  dataLength -1){
//											console.log("\n\n\narray: " +  array2steps.toString());
//											res.send(array2steps);
//											console.log("requested to: /search");
//											console.log("client request: " + JSON.stringify( req.originalUrl));
//											console.log("at: " + new Date().toISOString() + " \nfrom: " + req.ip + "\n - done - \n");
//										}
//								}
//							);
//					}


									array2steps = [];			
									maxResults = null;
									responseCountr = 0;
				}
	
			});
			
	 }
	
//	console.log("at: " + new Date().toISOString());

	});  
	
		//resopond to unrouted request
	app.get('/', function (req, res) {
  console.log("requested  to: /");
		 res.send("<div style='color:cornflowerblue;text-align:justify'> <h3>welcome to quantum-youtube-server</h3>" + 
		 					"<li><b>To search with query: </b>  append to URL -> /search?q=searchquery</li>"+
							"<li><b>For Video or Channel stats: </b>  append to URL -> /search?id=videoORchannelID</li>" +
							"<li><b>for both:</b> use '&' sign (the response will be a two element json array)</li>" + 
							"<li><b>for composite request, videos and stats:</b> use 'qStats=your_query'</li>" + 
							"<li><b>to limit number of request (5 is default, request only between 1-50):</b> use i.e. 'qStats=your_query&maxResults=19'</li>" + 
							"<br><em>please email for any issue<em><br>" + 
							"</div>");
  console.log("requested to: /empty");				
	console.log("client request: " + JSON.stringify( req.originalUrl));
	console.log("at: " + new Date().toISOString() + "\nfrom: " + req.ip + "\n - done - \n");
							
	});  
			//catch favicon request
	app.get('/favicon.ico', function (req, res) {
	}); 
		//resopond to weird routs
	app.get('/*', function (req, res) {
  console.log("requested /*undefined rout");
		 res.send("..this was a weird rout <br>" +
		 					"<div style='color:cornflowerblue;text-align:justify'> <h3>welcome to quantum-youtube-server</h3>" + 
		 					"<li><b>To search with query: </b>  append to URL -> /search?q=searchquery</li>"+
							"<li><b>For Video or Channel stats: </b>  append to URL -> /search?id=videoORchannelID</li>" +
							"<li><b>for both:</b> use '&' sign (the response will be a two element json array)</li>" + 
							"<li><b>for composite request, videos and stats:</b> use '/search?qStats=your_query'</li>" + 
							"<li><b>to limit number of request (5 is default, request only between 1-50):</b> use i.e. '/search?qStats=your_query&maxResults=19'</li>" + 
							"<br><em>please email for any issue<em><br>" + 
							"</div>");
	console.log("requested to: /unrouted");				
	console.log("client request: " + JSON.stringify( req.originalUrl));
	console.log("at: " + new Date().toISOString() + "\nfrom: " + req.ip + "\n - done - \n");
							
	});  
	
var ip = process.env.IP || '127.0.0.1';
var port = process.env.PORT || '3000';

app.listen(port, () => console.log('running on port 3000'));
console .log('\n## Welcome to youtube-api server ##');

