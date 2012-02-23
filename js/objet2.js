var jsonLoader = function(url, data){
	this.url = url;
	this.data = data;
	this.rawData = {};
//	this.getRawData();
	var json = jQuery.ajax({
		url: this.url,
		data: this.data,
		dataType: 'jsonp',
		success: this.getRawData(this),
		timeout: 5000,
		async: false,
		error: function() {alert('error json')},
		//async: false
	});
};

jsonLoader.prototype.getRawData = function(self){
	return function(json){self.rawData = json;};
};



var loadMe = new jsonLoader('http://dv.gedweb.fr:8080/test_json.php',{type: 'arr'});
//console.dir(loadMe.rawData); //has the parsed json object
if (loadMe.rawData == {} ) {
	console.log('erreur JSON');
} else {
	console.dir(loadMe.rawData);
}




var request = $.ajax( url, { dataType: "json" } ),
	chained = request.pipe(function( data ) {
		return $.ajax( url2, { data: { user: data.userId } } );
	});

chained.done(function( data ) {
	// data retrieved from url2 as provided by the first request
});


// 	jQuery(document).ready(function() {
	// 		// json...
// 		jQuery("#message-json").text('Flux JSON sur http://dev.gedweb.fr:8000/domain/logs_last_100 à partir de : ' + document.location.host)
// 
// 		jQuery.ajax({
	// 			url: 'http://dev.gedweb.fr:8000/domain/logs_last_100',
// 			dataType: 'jsonp',
// 			//data: {key1: 'value1', key2: 'value2'},
// 			error: function(jqXHR, textStatus, errorThrown) {
	// 				jQuery("#message-json").html(jQuery("#message-json").text() + '<br />' + textStatus + '<br />' + errorThrown);
// 				//alert('statut : ' + jqXHR.status + ' readyState : ' + jqXHR.readyState + ' statusText : ' + jqXHR.statusText + ' response : ' + exception) 
// 			},
// 			success: function (data, textStatus, jqXHR) {
	// 				jQuery("#message-json").html(jQuery("#message-json").text() + '<br />' + textStatus + '<br />');
// 			}
// 
// 			
// 		});
// 
// 		jQuery("#message-jsonp").text('Flux JSONP sur http://dev.gedweb.fr:8000/domain/logs_last_100 à partir de : ' + document.location.host)
// 
// 		jQuery.ajax({
	// 			dataType: 'jsonp',
// 			url: 'http://dev.gedweb.fr:8000/domain/logs_last_100',
// 			//dataType: 'json',
// 			//data: {key1: 'value1', key2: 'value2'},
// 			error: function(jqXHR, textStatus, errorThrown) {
	// 				jQuery("#message-jsonp").html(jQuery("#message-jsonp").text() + '<br />' + textStatus + '<br />' + errorThrown);
// 				//alert('statut : ' + jqXHR.status + ' readyState : ' + jqXHR.readyState + ' statusText : ' + jqXHR.statusText + ' response : ' + exception) 
// 			},
// 			success: function (data, textStatus, jqXHR) {
	// 				jQuery("#message-jsonp").html(jQuery("#message-jsonp").text() + '<br />' + textStatus + '<br />');
// 				//console.log(data);
// 				jQuery.each(data,function(key,value) {
	// 					//console.log('Clé : ' + key + ' - Value : ' + value);
// 					jQuery("#message-jsonp").html(jQuery("#message-jsonp").html() + '<br /> Nom de bibliothèque synchronisée : ' + value) ;
// 				});
// 			}
// 
// 			
// 		});
// 	});
// 
// 
// 
// 
// 
// 
// 	function UserValid()
// {
	// 	document.getElementById("message").innerHTML  = '';
// 	
//     var wBib = 'PUBTECH';
// 	
// 	/*
// 	Url =  'http://dev.gedweb.fr/novaxel/GET_BIB?mobile'+Base64.encode('BIB='+wBib+'&LOGIN='+document.getElementById("Login").value+'&PASSWORD='+document.getElementById("password").value+'&JSONP='+true);
// 	*/
// 	Url =  'http://dev.gedweb.fr:8000/domain/logs_last_100';
// 
// 	jQuery.ajax({
	// 		dataType      : 'jsonp',
// 		jsonpCallback : 'jsonp_callback',
// 		url: Url,
// 		success:function(data) {
	// 					
// 			document.getElementById("message").innerHTML  =  "Retour : " . data.json; 
// 			return;
// 		}	
// 				
// 	   });
// };
