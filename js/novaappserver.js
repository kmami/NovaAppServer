/* Voir :
 * http://www.howtocreate.co.uk/tutorials/javascript/objects pour l'implémentation OOP
 * http://www.3site.eu/doc/ pourles "finesses" OOP
 */


if (typeof novaApp == "undefined" ) {
	var novaApp = {};	// Déclaration du namespace global novaApp
} else {
	throw new Error('L\'application novaApp est déjà chargée');
}

(function () {
 
	var _version = 1;
	
	// Version min. de jQuery requise (privée)
	var VER_JQ_MIN =  '1.6';
	
	// Tableau des librairies complémentaires à charger
	// TODO: traiter des fichier compactés si noDEBUG à terme...
	var SCRIPTS_JS = new Array();
	SCRIPTS_JS['SHA256'] = Array('js/crypto/cryptosha256/cryptosha256.js','Support de hash SHA256','','Crypto.SHA256(\'test\')');
	SCRIPTS_JS['JSON'] = Array('js/json2.js','Support des fonctions JSON sur les navigateurs obsolètes','JSON','JSON.stringify(\'test\')');
	

	/* 
	 * Propriétées publiques
	 */
	// Log, etc.
	novaApp.DEBUG = true;

	// url serveur novaappserver :
	//const NAS_URL = 'http://dev.gedweb.fr:8080';
	novaApp.NAS_URL = 'http://dev.gedweb.fr:8080/test_json.php';
	
	// uri gestion domain (à concaténer avec NAS_URL)
	novaApp.NAS_DOMAIN = '/domain';
	
	// uri gestion owner (à concaténer avec NAS_URL)
	// const nas_owner = '/owner';
	
	// uri gestion user (à concaténer avec NAS_URL)
	novaApp.NAS_USER = '/user';
		
	// Type de session possible (connection à l'API serveur)
	novaApp.SESSION_TYPE = [ 'domain','user'];

	// timeout par défaut pour les requêtes http (ajax)
	novaApp.HTTP_REQ_TIMEOUT = 5000;
 
	/*
	 * Méthodes publiques
	 */
	
	novaApp.getVersion = function() {
		return (_version);
	};
	
	// A appeler au chargement, on vérifie que jQuery soit présent et dans une version supérieure à la version min paramétrée
	novaApp.envOk = function () {
		try {
			// jQuery présent ?
			if (typeof jQuery == "undefined") {
				throw {
					name: "JQuery absent",
					message: "Impossible de charger la bibliothèque jQuery nécessaire à cette librairie"
				};
			}
			
			// Version jQuery Ok ?
			var jq_ver = jQuery.fn.jquery;
			novaApp.LogDEBUG("Vérification de la version jQuery : " + jq_ver);
			
			if (jq_ver < novaApp.VER_JQ_MIN) {
				throw {
					name: 'Erreur de version jQuery',
					message: "La version de la librairie jQuery chargée (" + jq_ver + ") n'est pas compatible avec une version requise pour cette librairie (jQuery version >= " + novaApp.VER_JQ_MIN + ") !"
				}
			}
		}
		
		catch(err) {
			alert(err.name + " : " + err.message);
			novaApp.LogDEBUG(err.name + " : " + err.message);
			
		};
		
		// Chargement des librairies JS complémentaires à cette librairie
		for (var lib in SCRIPTS_JS) {
			// Si un test de chargemement est présent, on le lance avant d'essayer de charger (typiquement JSON par exemple, non supporté par IE <8...);
			if (SCRIPTS_JS[lib][2] !='') {
				try {
					eval(SCRIPTS_JS[lib][2]);
					continue; // Eval est Ok, on passe à la libraireis suivante...
				}
				catch (err) {}
			}
			// Tentative de chargement du script par jQuery.getScript()...
			jQuery.ajaxSetup({async: false});
			jQuery.getScript(SCRIPTS_JS[lib][0])
				.done(function() {
					novaApp.LogDEBUG('librairie ' + SCRIPTS_JS[lib][1] + ' chargée')
					// TODO: Test du chargement
					try {
						eval(SCRIPTS_JS[lib][3]);
						novaApp.LogDEBUG('test du chargement positif à l\'aide de l\'instruction : ' + SCRIPTS_JS[lib][3]);
					}
					catch(err) {
						novaApp.LogDEBUG(err.name + " : " + err.message + 'lors du test de chargement de la librairie : ' + lib + ' : ' + SCRIPTS_JS[lib][1] );
						throw new Error('La librairie "' + SCRIPTS_JS[lib][1] + '" - (' + SCRIPTS_JS[lib][0] + ') a bien été chargée, mais elle est inexploitable');
					}
						
				})
				.fail(function(jqxhr, settings, exception) {
					novaApp.LogDEBUG('librairie ' + SCRIPTS_JS[lib][1] + ' non chargée');
					// TODO: traitement erreur
					throw new Error('librairie ' + SCRIPTS_JS[lib][1] + ' non chargée');
				});
				
		};
			
		
	}; // Fin novaApp.envOk
	
	
	// LOG si DEBUG
	novaApp.LogDEBUG = function (msg) {
		if (novaApp.DEBUG) {novaApp.logCons(msg)}
	}; // Fin novaApp.LogDEBUG
	
	/*
	 * Log sur la console
	 */
	
	novaApp.logCons = function (obj) {
		if (typeof console!="undefined") {
			console.log(obj);
		}
	}; // Fin novaApp.logCons
	
	novaApp.jsonToString = function(objJson) {
/*		var tmp='';
		for (var key,var val in objJson) {
			tmp += key + ' : ' + val;
		}*/
		return JSON.stringify(objJson);
	}; // Fin novaApp.jsonToString
	
	
	
	/* 
	 * Renvoi un flux JSON 
	 * Paramètres :
	 * - target : url destination
	 * - param : array paramètres à passer au serveur
	 * - optajax : array key/value de surcharge des option de l'objet jQuery.jqXHR (cf. http://api.jquery.com/jQuery.ajax/#jqXHR)
	 * Rappel : les appels json sont asynchrone par défaut... La function de callback est appelée APRES la réception des données
	 * IMPORTANT : Le prototype d'appel de cette function DEVRA être le suivant (attention, énormément d'effet de bord si ces spécifications ne sont pas respectées) :
	 var XXX = novaApp.getDataNAS(URL, { param );
	// Function de chainage appelée APRES le traitement success traitée au sein de la function getDataNAS
	XXX.success(function (data) {
		// ...
	 });
	// Function de chainage appelée APRES le traitement success traitée au sein de la function getDataNAS
	XXX.error(function (jqXHR, textStatus) {
		// ...
		// déclenchement de l'erreur rapportée par la function getDataNAS par elle-même
		throw jqXHR.errJSON;
	 });
	 * 
	 * TODO : Traiter JSONP (problème de flux asynchrone non possible actuellement)
	 */
	novaApp.getDataNAS= function(target, param, optajax) {
		// Valeurs par défaut pouvant être écrasées par optajax
		var ajaxDefault = {
			dataType: 'json', // Si nous sommes sur le même domaine, jQuery bascule "automatiquement" en JSON
			type: 'POST',
			async: true, // Attention, si async: false le timeout n'est pas pris en compte...
			cache: false, //C'est le cas par défaut pour JSONP
			timeout: novaApp.HTTP_REQ_TIMEOUT, // 5 secondes par défaut
			//crossDomain: true, // TODO : Vérifier que ce ne soit pas redondant avec JSONP ??? ==> Attention, il semble que cela rende la requête JSON asynchrone...
			//jsonpCallback: xxx, // Normalement inutile...
			//scriptCharset: ..., // À voir éventuellement 
		
		
			// Traitement des erreurs réseaux uniquement (les erreurs applicatives osnt traitées par la function success et ces dépendantes)
			error: function(jqXHR, textStatus) {
				/*
				* L'objet Error généré aura 2 propriétés associées :
				* - message : un message "humain" (à afficher dans le navigateur par exemple
				* - novaErr : message technique (essentiellement à des fins de déboguages)
				*/
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
				
				// Ajout de l'objet errJSON à jqXHR et récupérable dans une fonction différée
				jqXHR.errJSON = errJSON;
				novaApp.LogDEBUG('Requête JSON sur "' + target + '" KO : ' + errJSON.novaErr);
			},
			
			success: function(data) {
				// Datas vide ==> anormal...
				
				// TODO : traiter les erreurs applicatives et filtrer les datas (injections) renvoyées par le serveur d'app...
				novaApp.LogDEBUG('Requête JSON sur "' + target + '" OK');
			}
			
		};
		
		if (typeof optajax != "undefined") {
			// merge des options passées
			jQuery.extend(ajaxDefault,optajax);
		}
		jQuery.ajaxSetup(ajaxDefault);
			
		var ret = jQuery.ajax({
			url: target,
			data: param
		});
		
		return ret; // Attention, retourne un objet jQuery jXHQR (pas le flux lui-même)
		//});
	};// Fin novaApp.getDataNAS

	/*
	 * Classe mère 
	 */

	novaApp.novaAppGen = novaApp.novaAppGen || {}; // Sous-namespace dédié aux fonctionnalités domain
	
	// Constructeur de cette classe
	novaApp.novaAppGen = function(login,password, typeSession) {
		// Si aucun argument n'est passé (compil), on ne fait rien
		if( arguments.length ) { this.getReady(login,password, typeSession); }
	};

	novaApp.novaAppGen.prototype.getReady = function (_self, login,password, typeSession) {
		if (
			typeof login == 'undefined' || 
			typeof password == 'undefined' 
			|| novaApp.SESSION_TYPE.indexOf(typeSession.trim()) == -1 
		) { // Paramètres incorrects
			throw new Error('Vous devez vous authentifier pour utiliser une instance de cet objet');
			//return(null);
		} else {
			// Demande d'authentification sur le serveur...
			login = jQuery.trim(login);
			password = jQuery.trim(password);
			typeSession = jQuery.trim(typeSession);
			
			// cryptage du mot de passe
			var password = Crypto.SHA256(password);

			novaApp.LogDEBUG('Demande authentification sur "' + novaApp.NAS_URL + '" pour l\'utilisateur "' + login + '" et le mot de passe "' + password + '"');
			novaApp.LogDEBUG('Cryptage direct de password : ' + Crypto.SHA256("ciel"));
				
			
			var newNovaUser= novaApp.getDataNAS(novaApp.NAS_URL, {login: login,password: password},{async: false});
			newNovaUser.success(function (data) {
				if (data.toString == "") { // Objet vide, erreur d'authentification
					throw new Error ("Authentification impossible");
				} else { // Session serveur Ok
					if (novaApp.DEBUG) {novaApp.logCons('Authentification OK pour "' + login + '" ; instanciation de l\'objet')};
					_self.login = login;
					//_self.password = password.trim();
					_self.typeSession=typeSession;
					// TODO : Voir comment récupérer un ID Session depuis le serveur et se le repasser...
					_self.session = jQuery.trim(data.id);
					novaApp.LogDEBUG("Session définie : " + _self.session);
				}
			});
			newNovaUser.error(function (jqXHR, textStatus) {
				novaApp.LogDEBUG('Authentification KO pour "' + 'admin' + '" ; déclenchement Erreur');
				throw jqXHR.errJSON;
			});

		}
	};

	novaApp.domain = novaApp.domain || {}; // Sous-namespace dédié aux fonctionnalités domain

	/*
	* Classe fille spécifique aux fonctionnalités "domaine"
	* Extension de la lasse mère "novaAppGlobal"
	*/
	novaApp.domain =  function(login, password) {
		if( arguments.length ) { this.getReady(login,password); }
	}

	novaApp.domain.prototype = new novaApp.novaAppGen();
	novaApp.domain.prototype.constructor = novaApp.domain;
	
 
	novaApp.domain.prototype.getReady =  function(login, password) {
		this.tempReady = novaApp.novaAppGen.prototype.getReady;
		this.tempReady(this,login, password,'domain');
	}
	
	novaApp.domain.prototype.SessionOk = function(callback) {
		if (typeof this.session === "undefined" || this.session.toString() == "" ) {
			callback(false, {message: "La session novaxel n'est pas initiée", novaErr: "Session Novaxel inexistante (authentification erronée ou non effectuée)"});
			return false;
		} else {
			return true;
		}
	}
 
	novaApp.domain.prototype.getDBDom_infos = function(callback) {
		if (! this.SessionOk(callback)) { return false} ;

		//url = novaApp.NAS_URL + novaApp.NAS_DOMAIN + '/dbinfos';
		novaApp.LogDEBUG('Appel de getDBDom_infos');
		var ret = novaApp.getDataNAS(novaApp.NAS_URL,{Sess_Id: this.session, type: "obj_assoc"});
		ret.success(function(data, status, jqXHR) {callback(true, data)});
		ret.error(function(jqXHR) {callback(false, jqXHR.errJSON)});
	}
	
	/*
	* Retourne un tableau des 100 dernières synchro (test JSON)
	*/
	novaApp.domain.prototype.getLogLast100 = function(callback) {	// Test JsonP
		if (! this.SessionOk(callback)) { return false} ;
 
		//url = NAS_URL + NAS_DOMAIN + '/logs_last_100';
		novaApp.LogDEBUG('Appel de getLogLast100');
		var url = novaApp.NAS_URL;
		
		var ret = novaApp.getDataNAS(url,{Sess_Id: this.session, type: 'arr'});
		ret.success(function(data, status, jqXHR) {callback(true,data)});
		ret.error(function(jqXHR) {callback(false, jqXHR.errJSON)});
	}
	
	novaApp.domain.prototype.testErr404 = function(callback) {
		if (! this.SessionOk(callback)) { return false} ;
 
	novaApp.LogDEBUG('Appel de testErr404');
		var ret = novaApp.getDataNAS('http://dev.gedweb.fr:8080/nopage/index.html',{Sess_Id: this.session, type: "obj_assoc"});
		ret.success(function(data, status, jqXHR) {callback(true, data)});
		ret.error(function(jqXHR) {callback(false, jqXHR.errJSON)});
	}
	
	novaApp.domain.prototype.testtimeout = function(callback) {
		if (! this.SessionOk(callback)) { return false} ;
		novaApp.LogDEBUG('Appel de testtimeout');
		var ret = novaApp.getDataNAS(novaApp.NAS_URL,{Sess_Id: this.session, timeout: "true"});
		ret.success(function(data, status, jqXHR) {callback(true, data)});
		ret.error(function(jqXHR) {callback(false, jqXHR.errJSON)});
	}
 
	
	novaApp.domain.prototype.testErr500 = function(callback) {
		if (! this.SessionOk(callback)) { return false} ;
		novaApp.LogDEBUG('Appel de testErr500');
		var ret = novaApp.getDataNAS('http://dev.gedweb.fr:8080/test_err500json.php',{Sess_Id: this.session});
		ret.success(function(data, status, jqXHR) {callback(true, data)});
		ret.error(function(jqXHR) {callback(false, jqXHR.errJSON)});
	}


// IE (no comment) < 9 ne supporte pas IndexOf...
// Donc encore un vilain hack ==> IE Hell
// voir : http://soledadpenades.com/2007/05/17/arrayindexof-in-internet-explorer/
if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
}
				
}()); // Fin de novaApp



