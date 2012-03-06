novaApp = {};

novaApp.DEBUG = true;

// url serveur novaappserver :
//const NAS_URL = 'http://dev.gedweb.fr:8080'; http://dev.gedweb.fr:8080/test_json.php?login=admin&password=password
novaApp.NAS_URL = 'http://dev.gedweb.fr:8080/test_json.php';

novaApp.logCons = function (obj) {
	if (typeof console!="undefined") {
		console.log(obj);
	}
	else {
		alert(obj);
	}
} // Fin novaApp.logCons


	novaApp.getFluxJSON = function(target, param) { //, CallBackFnKo
	var ret = jQuery.ajax({
		dataType: 'json', // Par défaut nous travaillons en JSONP (interdomain)
	//type: 'GET',
	url: target,
	data: param,
	//async: false, // Attention, si async: false le timeout n'est pas pris en compte...
	cache: false, //C'est le cas par défaut pour JSONP
	timeout: 3000, // 5 secondes (non pris en compte si async: false...)
	//crossDomain: true, // TODO : Vérifier que ce ne soit pas redondant avec JSONP ??? ==> Attention, il semble que cela rende la requête JSON asynchrone...
	//jsonpCallback: xxx, // Normalement inutile...
	//scriptCharset: ..., // À voir éventuellement 
	error: function(jqXHR, textStatus) {
		var errJSON = new Error();
		errJSON.novaErr = jqXHR.statusText + ' lors de l\'appel de "' + this.url + '" (status jqXHR : ' + jqXHR.readyState + ')';
		switch (jqXHR.readyState) {
			case 0:	// The request is not initialized - Typiquement timeout
								errJSON.message = 'Le service ne répond pas (machine inaccessible, ou serveur WEB ne répond pas, etc.)';
								break;
			case 1:	// The request has been set up - NA dans ce contexte ???
								errJSON.message = 'Une erreur inconnue (et non traitée) a eu lieu';
								break;
			case 2:	// The request has been sent - NA dans ce contexte ???
								errJSON.message = 'Une erreur inconnue (et non traitée) a eu lieu';
								break;
			case 3: // The request is in process - NA dans ce contexte ???
								errJSON.message = 'Une erreur inconnue (et non traitée) a eu lieu';
								break;
			case 4:	 // The request is complete - Typiquement un erreur HTTP (serveur accessible mais erreur de traitement 40X/50X, etc...)
								errJSON.message = 'Le service répond mais les données ne peuvent pas être récupérées suite à une erreur de traitement de données sur ce service';
								errJSON.novaErr = jqXHR.statusText + ' lors de l\'appel de "' + this.url + '" (status jqXHR : ' + jqXHR.readyState + ' ; erreur HTTP : ' + jqXHR.status + ')';
								break;
		}
		jqXHR.errJSON = errJSON;
		if (novaApp.DEBUG) {novaApp.logCons('Requête JSON sur "' + target + '" KO : '/* + errJSON.novaErr */)};
	},
	success: function(data) {
		// TODO : traiter les erreurs renvoyées par le serveur d'app...
		if (novaApp.DEBUG) {novaApp.logCons('Requête JSON sur "' + target + '" OK')};
	}
	});
	
		return ret;
	}


	novaApp.getFluxJSONP = function(target, param) { //, CallBackFnKo
		var ret = jQuery.jsonp({
			//cache: false,
			callbackParameter: "callback",
			data: param,
			timeout: 3000, // 5 secondes (non pris en compte si async: false...)
			url: target,
			error: function (xOptions, textStatus) {
				if (novaApp.DEBUG) {novaApp.logCons('Requête JSONP sur "' + target + '" KO : ' /* + errJSON.novaErr */)};
			},
			success: function(data) {
				// TODO : traiter les erreurs renvoyées par le serveur d'app...
				if (novaApp.DEBUG) {novaApp.logCons('Requête JSONP sur "' + target + '" OK')};
			}
		});
		return ret;
	}


var _self=new Object;
var login='admin';
var password='password';
var typeSession='domain';

	if (novaApp.DEBUG) {novaApp.logCons('Demande authentification sur "' + novaApp.NAS_URL + '" pour l\'utilisateur "' + login + '"')};

	// Demande d'authentification sur le serveur...
	jQuery.ajaxSetup({async: false});
	
	var newNovaUser= novaApp.getFluxJSON(novaApp.NAS_URL, {login: login,password: password});
	newNovaUser.success(function (data) {
		if (data === {}) { // Objet vide, erreur d'authentification
						throw new Error ("Authentification impossible");
		} else { // Session serveur Ok
						if (novaApp.DEBUG) {novaApp.logCons('Authentification OK pour "' + login + '" ; instanciation de l\'objet')};
					 _self.login = login.trim();
					 _self.password = password.trim();
					 _self.typeSession=typeSession.trim();
					 // TODO : Voir comment récupérer un ID Session depuis le serveur et se le repasser...
					 _self.session = data.id;
					 novaApp.logCons("Session définie : " + _self.session);
		}
	});
	newNovaUser.error(function (jqXHR, textStatus) {
		if (novaApp.DEBUG) {novaApp.logCons('Authentification KO pour "' + 'admin' + '" ; déclenchement Erreur')};
											//novaApp.logCons(jqXHR.errJSON.novaErr);
											novaApp.logCons('Erreur JSONP');
											//throw jqXHR.errJSON;
		});
	jQuery.ajaxSetup({async: false});
	novaApp.logCons('Fin de test');