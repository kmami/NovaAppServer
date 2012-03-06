/*
 * Librairie novaappserver
 * Version 1 
 * 
 * Patrick DUBUIS 
 * 
 * 
 * 
 * Cette librairie permet d'accéder au serveur d'application novaappserver et d'interagir avec lui
 * Elle utilise massivement la librairie jQuery (qui doit être appelée préalablement à l'appel de la présente librairie)
 * 
 * NB : nas=novaappserver...
 * 
 * Un mot sur l'implémentation OOP choisie ici :
 *  - La notion de classe n'est pas (encore) nativement supportée en JS, il faut donc implémenter cela...
 *  - Il y a une multitude d'implémentation possible en JS (prototype, closure, etc.)
 *  - Le choix effectué ici tient compte des paramètres suivants :
 * 		- Facilité de maintenance (ajout d'attributs/méthodes le plus simple possible)
 * 		- Usabilité facilitée (création des objets et appel des attributs/méthodes les plus simples possibles)
 * 		- Performance les plus correctes possibles (namespace, prototypage, etc.)
 * 		- Compréhension du "pattern" maitrisée (au moins pour moi ;-) )
 */


/****************************************************************************************************************************************************************************
 * Objet ("class") NovaApp auquel se racroche les autres objets enfants
 ***************************************************************************************************************************************************************************/
var novaApp = {};	// Déclaration du namespace global novaApp

(function () {
	// Version min. de jQuery requise
	novaApp.VER_JQ_MIN = "1.6";

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
			if (novaApp.DEBUG) novaApp.logCons("Vérification de la version jQuery : " + jq_ver);

			if (jq_ver < novaApp.VER_JQ_MIN) {
				throw {
					name: 'Erreur de version jQuery',
					message: "La version de la librairie jQuery chargée (" + jq_ver + ") n'est pas compatible avec une version requise (jQuery version >= " + novaApp.VER_JQ_MIN + ") !"
				}
			}
		}

		catch(err) {
			alert(err.name + " : " + err.message);
			if (novaApp.DEBUG) novaApp.logCons(err.name + " : " + err.message);
			
		};
	} // Fin novaApp.envOk

	
	// LOG si DEBUG
	novaApp.LogDEBUG = function (obj) {
	} // Fin novaApp.LogDEBUG
	
	/*
	 * Log sur la console
	 */
	
	novaApp.logCons = function (obj) {
		if (typeof console!="undefined") {
			console.log(obj);
		}
		else {
			alert(obj);
		}
	} // Fin novaApp.logCons
	
	
	
	/* 
	 * Renvoi un flux JSON 
	 * Paramètres :
	 * - target : url destination
	 * - param : array paramètres à passer au serveur 
	 * - CallBackFn : Function de callback (reçoit data, texte status et objet jqXHR) ==> voir http://api.jquery.com/category/ajax/
	 * Rappel : les appels json PEUVENT être asynchrone... La function de callback est appelée APRES la réception des données
	 */
	novaApp.getFluxJSON= function(target, param, callBackFnOk, CallBackFnKo) { //, CallBackFnKo
		var req=jQuery.ajax({
			dataType: 'json', // Par défaut nous travaillons en JSONP (interdomain)
			url: target,
			data: param,
			//async: false, // Nous avons besoin des datas immédiatement - JSONP ne travaille pas en async...
			//cache: false, //C'est le cas par défaut pour JSONP
			timeout: 5000, // 5 secondes
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
				};
				
				// Appel la function de callback avec un ojet error en paramètre
				CallBackFnKo(errJSON);
			},

			success: function(data) {
				// TODO : traiter les erreurs renvoyées par le serveur d'app...
				callBackFnOk(data); // Chainage direct avec la function de Callback (les arguments sont passés par défaut)
			}
		});
	}// Fin novaApp.getFluxJSON
}());

/****************************************************************************************************************************************************************************
 * 
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.

// Inspired by base2 and Prototype

// Voir : http://ejohn.org/blog/simple-javascript-inheritance/ pour des explications sur cette implémentation
// Voir aussi : http://www.ruzee.com/blog/2008/12/javascript-inheritance-via-prototypes-and-closures
/* Attention, cette function anonyme doit être appelée AVANT son utilisation pour l'instanciation des classes
/****************************************************************************************************************************************************************************
 */ 
(function(){
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
	
	// The base Class implementation (does nothing)
	this.Class = function(){};
	
	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		
		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" &&
			typeof _super[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn){
				return function() {
					var tmp = this._super;
					
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];
					
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);       
					this._super = tmp;
					
					return ret;
				};
			})(name, prop[name]) :
			prop[name];
		}
		
		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply(this, arguments);
		}
		
		// Populate our constructed prototype object
		Class.prototype = prototype;
		
		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;
		
		// And make this class extendable
		Class.extend = arguments.callee;
		
		return Class;
	};
})();

// Classe mère (supporte les attibuts/méhodes communes aux classes enfants)
(function() { // Scope local
	novaApp.novaAppGlobal = novaApp.novaAppGlobal || {}; // Sous-namespace dédié aux fonctionnalités domain

	/*
	 * Classe mère 
	 */
	novaApp.novaAppGlobal = Class.extend ({
		
		/* 
		 * Version de la classe...
		 * À mettre à jour, le cas échant, si modifications (suivi)
		 */
		_version: 1,
		
		/*
		* Constructeur
		* Initialise une session sur le domaine ou en tant qu'utilisateur de bibliothèque
		* Paramètres : 
		* - login : login sur domain ou user bibilothèque
		* - password : mot de passe (en clair) domain ou user  bilbiothèque
		* - type : soit "domain", soit "user" (cf. constante SESSION_TYPE)
		*/
		init: function(login,password, typeSession) {
			if (
				typeof login == 'undefined' || 
				typeof password == 'undefined' 
				|| novaApp.SESSION_TYPE.indexOf(typeSession.trim()) == -1 
			) { // Paramètres incorrects
				throw new Error('Vous devez vous authentifier pour utiliser une instance de cet objet');
			}

			// Demande d'authentification sur le serveur...
			novaApp.getFluxJSON(novaApp.NAS_URL, {login: login.trim(),password: password.trim()},
				function (data) {
					if (data == {}) { // Objet vide, erreur d'authentification
					} else { // Session serveur Ok
						this.login = login.trim();
						this.password = password.trim();
						this.typeSession=typeSession.trim();
						// TODO : Voir comment récupérer un ID Session depuis le serveur et se le repasser...
						this.session = data.id;
						novaApp.logCons("Session définie : " + this.session);
					}
				},
				function (errJSON) {
					throw errJSON;
				}
			);
			
		},
		
		/*
		 * Renvoi la version de la classe (variable statique privée de la classe)
		 */
		getVersion: function() {
			return (novaApp.novaAppGlobal.prototype._version);
		}
			
//			req.success(callBackFnOk);
			//jqXHR, textStatus, errorThrown
//			req.error(console.dir(jqXHR));


	}); // Fin de novaApp.novaAppGlobal 
}());


(function() { // Scope local
	novaApp.domain = novaApp.domain || {}; // Sous-namespace dédié aux fonctionnalités domain

	/*
	 * Classe fille spécifique aux fonctionnalités "domaine"
	 * Extension de la lasse mère "novaAppGlobal"
	 */
	novaApp.domain = novaApp.novaAppGlobal.extend ({

		/*
		 * Constructeur : Ouvre une session sur le domaine
		 * Paramètre :
		 * - login domaine
		 * - password domaine (en clair et renvoyé en SHA256 au serveur d'application)
		 */
		init: function(login, password) {
			this._super(login, password,'domain');
			novaApp.logCons(this.session);
			/*,
			 * function(obj) {novaApp.logCons("Session : " + this.session)}
	)
			*/
		},

		/* Informations sur la BD domaine (renvoit un flux HTTP ; TODO renvoyer un flux JSON
		 */
		getDBDom_infos: function() {
			// Connection Ok ?
			if (this.session === null) return false;
												   
			url = novaApp.NAS_URL + novaApp.NAS_DOMAIN + '/dbinfos';
			
			return(url);
		},
		
		/*
		 * Retourne un tableau des 100 dernières synchro (test JSON)
		 */
		getLogLast100: function(callback) {	// Test JsonP
			if (this.session === null) {
				callback(false, new Error ({message: "La session novaxel n'est pas initiée", novaErr: "Session Novaxel inexistante (authentification erronée ou non effectuée)"}));
				return false;
			}
												   
			//url = NAS_URL + NAS_DOMAIN + '/logs_last_100';
			url = novaApp.NAS_URL;
			
			novaApp.getFluxJSON(url,{'type':'arr'},
				// Appelée si succès
				function(data, status, jqXHR) {
				//alert(data.loglines[50].OWNER); // Témoin data renvoyée...
					//console.dir(data);
					callback(true,data);
				},
				function(errJSON) {
//					novaApp.logCons("Erreur JSONP : " + textStatus);
//					console.dir(jqXHR);
					callback(false, errJSON);
				}
			);
		}
	});
	
}()); // Fin de novaApp.domain

// Vérification de l'environnement
novaApp.envOk();




// jQuery.each(result,function(key,value) {
// 	novaApp.logCons('Clé : ' + key + ' - Value : ' + value);
// });


/*
 * Fonctions outils
 * */

/* Ajout d'une méthode "trim" à l'objet String */
String.prototype.trim = function () {
	return this.replace(/^\s*/, "").replace(/\s*$/, "");
}
