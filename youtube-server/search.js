// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
}

// Search for a specified string.
function search() {
	
	//value from UI
  var q = $('#query').val();
//	var q = "search query";
  var request = gapi.client.youtube.search.list({
    q: q,
    part: 'snippet'
  });

getChannel();
  request.execute(function(response) {
    var str = JSON.stringify(response.result);
    $('#search-container').html('<pre>' + str + '</pre>');
		console.log("search data: \n"+   str);
		
  });
}
