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
 
	var novaApp_version = '1.1';
	
	// Type de session possible (connection à l'API serveur)
	SESSION_TYPE = [ 'domain','user'];
	
	// Version min. de jQuery requise (privée)
	var VER_JQ_MIN =  '1.6';
	
	// Tableau des librairies complémentaires à charger
	// TODO: traiter des fichier compactés si noDEBUG à terme...
	/* Chaque élément est composé de :
	 * Nom de librairie (information)
	 * path pour le chargement : relatif à la *page* HTML qui nous a chargé le present script
	 * Commentaire : informatin sur le rôle de cette librairie
	 * Expression de test évaluée avec "eval('expression') == true/false" pour déterminer si la librairie doit être effectivement chargée ou non
	 * 	- expression == true ==> on ne charge PAS (on considère que c'est déjà chargé ou non requis dans un contexte donnée, par exemple en mode DEBUG ou si la librairie a déjà été chargée en entête HTML, etc.)
	 * 	- expression == false ==> on charge... (on a besoin de la librairie)
	 * Voir le traitement de ce tableau dans la funciton envOk() plus bas...
	 */
	var SCRIPTS_JS = new Array(
		Array('SHA256','js/crypto/crypto-sha256/crypto-sha256.js','Support de hash SHA256','Crypto.SHA256(\'test\')')
		,Array('JSON','js/json2.js','Support des fonctions JSON sur les navigateurs obsolètes','JSON.stringify([\'test\'])')
		,Array('AES256','js/crypto/crypto-sha1-hmac-pbkdf2-blockmodes-aes/crypto-sha1-hmac-pbkdf2-blockmodes-aes.js','Support de AES 256','Crypto.AES.encrypt("Message", "Secret Passphrase");')
		
		// TODO : ,Array('mockjax','js/appendto-jquery-mockjax/jquery.mockjax.js','Librairie de test unitaires ajax mockjax (DEBUG seulement)',' !novaApp.DEBUG && jQuery.mockjax({log:\'test mock\'})')
	);

	// Tableau du format d'envoloppe JSON à tester en retour
	// Ajout d'une couche d'abstract pour le cas où les libellés de structure (enveloppe JSON) changeraient...
	var JSON_ENV = {
		token: 'token'
		,rc: 'rc'
		,error: 'error'
		,msg: 'messages'
		,results: 'results'
	};
	
	// Liste des optajax acceptables pour les functions de callback des méthodes des objets novaApp.domain" et (TODO) "novaApp.user"
	var OPT_JQXHR_OK = new Array(
		'beforeSend'
		,'complete'
	);
		

	/* 
	 * Propriétées publiques
	 */
	// Log, etc.
	novaApp.DEBUG = true;

	// url serveur novaappserver :
	//const NAS_URL = 'http://dev.gedweb.fr:8080';
	novaApp.NAS_URL = 'http://dev.gedweb.fr:8000';
	

	// Liste des URI (chemin SUR serveur)
	novaApp.NAS_URIS = {
		// uri gestion domain (à concaténer avec NAS_URL)
		DOMAIN: novaApp.NAS_URL + '/domain',
		// uri gestion user (à concaténer avec NAS_URL)
		USER: novaApp.NAS_URL + '/user',
		// uri service (à concaténer avec NAS_URL)
		SERVICE : novaApp.NAS_URL + '/service'
	};
	
	// timeout par défaut pour les requêtes http (ajax)
	novaApp.HTTP_REQ_TIMEOUT = 5000;
 
	
	/*
	 * Méthodes privées
	 */
	
	// Netoyage des options ajax passées aux différentes méthodes
	function cleanOptAjax (optajax) {
		if (typeof optajax != 'object') {
			return {};
		}
		var cur_opt = {};
		jQuery.each(optajax, function (key, value) {
			if (jQuery.inArray(key,OPT_JQXHR_OK) != -1 ) {
				cur_opt[key] = value; //, {key: optajax[i]}); //optajax[i]
			}
		});
		return cur_opt;
	};

	
	/*
	 * Méthodes publiques
	 */

	/*
	 * Version de l'application
	 */
	novaApp.getVersion = function () {
		return novaApp_version;
	}
	
	
	/*
	 * A appeler au chargement, on vérifie l'environnement d'exploitaiton...
	 * Attention, ici on lève des erreurs (try/catch chez l'appelant)
	 */
	novaApp.envOk = function () {
		try {
			// jQuery présent ?
			if (typeof jQuery == "undefined") {
				throw {
					name: "JQuery absent",
					message: "Impossible de charger la bibliothèque jQuery nécessaire à cette librairie"
				}
				return false;
			}
			
			// Version jQuery Ok ?
			var jq_ver = jQuery.fn.jquery;
			novaApp.LogDEBUG("Vérification de la version jQuery : " + jq_ver);
			
			if (jq_ver < novaApp.VER_JQ_MIN) {
				throw {
					name: 'Erreur de version jQuery',
					message: "La version de la librairie jQuery chargée (" + jq_ver + ") n'est pas compatible avec une version requise pour cette librairie (jQuery version >= " + novaApp.VER_JQ_MIN + ") !"
				}
				return false;
			}
		}
		
		catch(err) {
			novaApp.LogDEBUG('Erreur lors du chargement d ela librairie jQuery : "' + err.message + '"');
			throw {
				name: "JQuery absent",
				message: "Impossible de charger la bibliothèque jQuery nécessaire à cette librairie"
			}
			return false;
		};
		
		
		// Chargement des librairies JS complémentaires à cette librairie
		if (SCRIPTS_JS.length > 0) { 
			ajaxSettings = {
				accepts: 'text/javascript' // Voir si nécessaire (header)
				,async: false // Idéalement, devrait être toujous à false car sinon, je n'aurai pas le "temps" de tester avant de lancer les opérations suivantes...
				,cache: true // Idéalement ceci devrait toujours être True...
				,contentType: 'application/x-www-form-urlencoded' // Valeur par défaut pouvant éventuellement être modifiée si nécessaire (impact ???)
				// ,context: // permet d'attacher le résultat à un objet DOM : normalement inutile dans notre contexte
				//,crossDomain: true // permet de forcer une requête crossdomain même si domaine identique, inutile dans noter contexte
				//,data: {} // inutile dans notre contexte...
				,dataType: 'script' // On force en data script (jQuery.ajax utilisé plus loin)
				,global: true // par défaut
				//,headers: {} // header complémentaires, normallement inutile dans notre contexte
				//,ifModified: false // requête OK seulement si les datas ont changées depuis la dernière demande (attention déclenche jQuery.ajax.error même si la requête est Ok...)
				,isLocal: true // À faire varier en function des tests
				,scriptCharset: 'UTF-8' // Normallement ce doit être le cas...
				,timeout: 5000 // 5 secondes
				,type: 'GET' // par défaut pour les scripts....
			};
			for (var i=0;i<SCRIPTS_JS.length;i++) {
				// On effectue toujours un test de préchargement, de manière à détecter un chargement initialisé par ailleurs (entête HTML <script...>)
				if (SCRIPTS_JS[i][3] !='') {
					try {
						if (eval(SCRIPTS_JS[i][3])) {
							novaApp.LogDEBUG('la librairie "' + SCRIPTS_JS[i][0] + ' (' + SCRIPTS_JS[i][2] +') est déjà chargée ou elle est inutile (fonctionnalités directement prises en charge par le navigateur)');
							continue; // Eval est Ok, on passe à la libraires suivante...
						}
					}
					catch (err) {}
						// Prise en charge par la requête AJAX de chargement....
				}
				// Tentative de chargement du script par jQuery.getScript()...
				jQuery.ajax(jQuery.extend(
					ajaxSettings,
					{
						url: SCRIPTS_JS[i][1]
					}
				))
				.done(function() {
					novaApp.LogDEBUG('Librairie "' + SCRIPTS_JS[i][0] + ' (' + SCRIPTS_JS[i][2] +') correctement chargée');
					try {
						novaApp.LogDEBUG('Test d\'utilisation de la librairie "' + SCRIPTS_JS[i][0] + ' (' + SCRIPTS_JS[i][2] +')" avec l\'expression : "' + SCRIPTS_JS[i][3] + '"...');
						var result = eval(SCRIPTS_JS[i][3]);
						novaApp.LogDEBUG('Utilisation de la librairie "' + SCRIPTS_JS[i][0] + ' (' + SCRIPTS_JS[i][2] +')" OK (résulat de l\'expression : "' + result + '")');
					}
					catch(err) {
						novaApp.LogDEBUG('Utilisation de la librairie "' + SCRIPTS_JS[i][0] + ' (' + SCRIPTS_JS[i][2] +')" KO avec l\'erreur suivante : '  + err.message);
						throw new Error('La librairie "' + SCRIPTS_JS[i][0] + '" - (' + SCRIPTS_JS[i][1] + ') a bien été chargée, mais elle est inexploitable');
						return false;
					}
					return true;
				})
				.fail(function(jqxhr, settings, exception) {
					novaApp.LogDEBUG('Erreur lors du chargement de la librairie"' + SCRIPTS_JS[i][0] + ' (' + SCRIPTS_JS[i][2] +') - URI : "' + SCRIPTS_JS[i][1] + '" avec l\'erreur suivante : ' + 'status : ' + jqxhr.statusText + ' (' + jqxhr.status +  ') - readystate : ' + jqxhr.readyState + ' - erreur : ' + exception);
					throw new Error('librairie ' + SCRIPTS_JS[i][1] + ' non chargée');
					return false;
				});
			}
		}
		
		// TODO : Cookies actif (vérifier si applicable pour "httponly")
		if (! navigator.cookieEnabled) {
			throw new Error('Les cookies doivent être activés pour utiliser cette application');
			return false;
		}

		// ping server (le ping est anonyme sur le serveur)
		var ret = novaApp.getDataNAS(novaApp.NAS_URIS.SERVICE + '/ping', {},{async: false});
		ret.success(function(data, status, jqXHR) {
			if (jqXHR.hasOwnProperty('errJSON')) {
				novaApp.LogDEBUG('Erreur dans le Flux : ping KO : ' + jqXHR.errJSON.novaErr);
				throw new Error('Le serveur a renvoyé l\'erreur suivante lors de la connexion de test : "' + jqXHR.errJSON.message + '"');
			} else {
				novaApp.LogDEBUG('Ping du serveur OK');
			}
		});
		ret.error(function(jqXHR) {
			novaApp.LogDEBUG('Ping du serveur KO : ' + jqXHR.errJSON.novaErr);
			throw new Error('L\'erreur suivante s\'est produite lors de la connexion de test au serveur : "' + jqXHR.errJSON.message + '"');
			return false;
		});
		return true;
		
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
			return true;
		}
		return false;
	}; // Fin novaApp.logCons
	
	novaApp.jsonToString = function(objJson) {
/*		var tmp='';
		for (var key,var val in objJson) {
			tmp += key + ' : ' + val;
		}*/
		return JSON.stringify(objJson);
	}; // Fin novaApp.jsonToString
	

	/* 
	 * function de "simplification" (en mode asynchrone) de login sur le domain
	 */
	novaApp.domainLogin = function(login, password, callback, optajax) {
		var newDomainUser = new novaApp.domain(login, password, callback, optajax);
	} // fin novaApp.domainlogin
	

	
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
	 * TODO :	Traiter JSONP (problème de flux asynchrone non possible actuellement)
	 * TODO :	Traiter un encodage compatible JSON *en envoi* (voir http://stackoverflow.com/questions/1255948/post-data-in-json-format-with-javascript par exemple)
	 * 			Le serveur peut attendre une structure plus cmplexe qu'une association de premier niveau (ie. encapsulation de datas...)
	 */
	novaApp.getDataNAS= function(target, param, optajax) {
		// Valeurs par défaut pouvant être écrasées par optajax
		var ajaxDefault = {
			//dataType: 'json', // Si nous sommes sur le même domaine, jQuery bascule "automatiquement" en JSON
			type: 'POST',
			async: true, 
			cache: false, // En complément car le serveur envoi normalement des entêtes "no-store"
			timeout: novaApp.HTTP_REQ_TIMEOUT // 5 secondes par défaut
		};

		if (typeof optajax == "object") {
			// merge des options passées
			jQuery.extend(ajaxDefault,optajax);
		}
		
		jQuery.extend(ajaxDefault, {
			url: target,
			data: param,
			dataType: 'json'
		});
		
		var ret = jQuery.ajax(ajaxDefault)
		
		// Traitement des erreurs réseaux uniquement (les erreurs applicatives osnt traitées par la function success et ces dépendantes)
		.fail(function(jqXHR, textStatus) {
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
					errJSON.message = 'Le serveur répond mais les données ne peuvent pas être récupérées suite à une erreur de traitement de données sur ce service';
					errJSON.novaErr = jqXHR.statusText + ' lors de l\'appel de "' + this.url + '" (status jqXHR : ' + jqXHR.readyState + ' ; erreur HTTP : ' + jqXHR.status + ')';
					break;
			}
	
			// Ajout de l'objet errJSON à jqXHR et récupérable dans une fonction différée
			jqXHR.errJSON = errJSON;
			novaApp.LogDEBUG('Requête JSON sur "' + target + '" KO : ' + errJSON.novaErr);
		})
 
			/* Les datas sont bien renvoyées par le serveur...
			 * Ici, il peut y avoir plusieurs problèmes :
			 * - Enveloppe incorrecte (le serveur est censé nous renvoyer toujours le même format d'enveloppe, ie toujours les mêmes structures, dans le flux...)
			 * - rc != 0 ==> Erreur sur le serveur (de tout type)
			 * 	==> strcuture "error" doit ête remplie dans ce cas...
			 */
		.done(function(data, textStatus, jqXHR) {
			/* Ici on doit traiter toutes les erreurs communes aux différents appels
			* On doit aussi effectuer des actions sanitaires
			*/
			novaApp.LogDEBUG('Requête JSON sur "' + target + '" retour OK ; traitement des datas');
			novaApp.LogDEBUG('Flux JSON retourné : ' + novaApp.jsonToString(data));
			
			// Flux JSON vide ==> anormal...(le serveur doit renvoyer la même enveloppe)
			if (jQuery.isEmptyObject(data)) { // TODO : vérifier ça...
				var errFluxJSON = new Error();
				errFluxJSON.message = 'Le serveur a répondu mais le format de cette réponse est incorrect';
				errFluxJSON.novaErr = 'Enveloppe du flux JSON vide';
				jqXHR.errJSON=errFluxJSON;
				return false;
				
			}; 
				
			// Format Flux non respecté (toutes les structures doivent être présentes dans l'enveloppe)
			/* Nous devons toujours recevoir un flux du type suivant :
				* {
				* 	"token": "",
				* 	"rc": 0/1,
				* 	"error" : {},
				* 	"messages": [],
				* 	"results": {}
				* }
				*/
			for (var i in JSON_ENV) {
				// Correspondance => une clé (structure) doit exister dans le flux pour chaque élément dans le tableau de desctiption d'enveloppe
				try {
					// TODO : trouver autre chose pour désengorger la console...
					novaApp.LogDEBUG(JSON_ENV[i] + ' : ' + data[JSON_ENV[i]]);
				}
				catch (err) {
					//Le flux ne correspond pas à l'enveloppe attendu
					var errFluxJSON = new Error();
					errFluxJSON.message = 'Les données retournées par le serveur ne correpondent pas à celles attendues';
					errFluxJSON.novaErr = 'La structure "' + JSON_ENV[i] + '" n\'apparait pas dans le flux reçu (erreur d\'enveloppe)';
					jqXHR.errJSON=errFluxJSON;
					return false;
				}
			}
			
			// Retour de flux en erreur
			if (data[JSON_ENV['rc']] != 0 ) {
				novaApp.LogDEBUG('retour Flux JSON en erreur : ' + data[JSON_ENV['error']]);
				var errFluxJSON = new Error();
				errFluxJSON.message = 'Le serveur a retourné l\'erreur suivante lors de la requête : "' + data[JSON_ENV['error']].message + '"';
				errFluxJSON.novaErr = 'Retour en erreur ; code : ' + data[JSON_ENV['error']].code + ' ; message : "' + data[JSON_ENV['error']].message + '"';
				jqXHR.errJSON=errFluxJSON;
				return false;
			}
			
			// TODO : filtrer les datas (injections) renvoyées par le serveur d'app...
			// Faire confiance à jQuery.parseJSON  ? Celui-ci utilise les fonctionnalités du browser si présente ou l'implémentation de Crofford dans le cas contraire...
		});
			
		
		return ret; // Attention, retourne un objet jQuery jXHQR (pas le flux lui-même)
		//});
	};// Fin novaApp.getDataNAS


/*
 * Classe mère 
 */

	novaApp.novaAppGen = novaApp.novaAppGen || {};

	// Constructeur de cette classe
	novaApp.novaAppGen = function(login,password, typeSession) {
		// Si aucun argument n'est passé (compil), on ne fait rien
		if( arguments.length ) { this.getReady(login,password, typeSession); }
	};

	/* 
	 * Constructeur global (ie domain + GED)
	 */
	novaApp.novaAppGen.prototype.getReady = function (_self, login,password, typeSession, callback, optajax) {
		if (
			typeof login == 'undefined' || 
			typeof password == 'undefined' 
			|| SESSION_TYPE.indexOf(jQuery.trim(typeSession)) == -1 
		) { // Paramètres incorrects
			throw new Error('Vous devez vous authentifier pour utiliser une instance de cet objet');
			
		} else {
			// mode async ?
			async = typeof callback == 'function' ? true : false;
			// Demande d'authentification sur le serveur...
			login = jQuery.trim(login);
			password = jQuery.trim(password);
			typeSession = jQuery.trim(typeSession);
			
			// cryptage du mot de passe
			var password = Crypto.SHA256(password);
			
			novaApp.LogDEBUG('Demande authentification pour l\'utilisateur "' + login + '" et le mot de passe "' + password + '"');
			//novaApp.LogDEBUG('Cryptage direct de password : ' + Crypto.SHA256(password));
			
			
			var newNovaUser= novaApp.getDataNAS(novaApp.NAS_URIS.DOMAIN + "/login", {user: login,password: password},{async: async});
			
			newNovaUser.success(function (data, textStatus, jqXHR) {
				// Présence d'erreur dans les datas retournées ?
				if (jqXHR.hasOwnProperty('errJSON')) {
					novaApp.LogDEBUG('Erreur dans le Flux : Authentification KO pour "' + login + '" ; déclenchement/retour en erreur');
					if (typeof callback == 'function') { // Retour d'un objet error
						callback(jqXHR.errJSON);
					} else { // On lève une erreur car on ne doit pas pouvoir passer silencieusement une instanciation erronée (à traiter par l'appelant avec "try/catch")
						throw jqXHR.errJSON;
					}
				}
				
				// Si nous arrivons ici, c'est que le flux JSON est considéré correct et nettoyé
				// TODO Stockage des valeurs de session
				_self.login = login;
				_self.typeSession=typeSession;
				_self.session = jQuery.trim(data[JSON_ENV['token']]);
				// TODO : non implémenté par JMB...
				//_self.id=jQuery.trim(data[JSON_ENV['results']].id;
				novaApp.LogDEBUG("Session définie : " + _self.session);
				if (typeof callback == 'function') {callback(_self)};
			});
			
			newNovaUser.error(function (jqXHR, textStatus) {
				novaApp.LogDEBUG('Authentification KO pour "' + login + '" ; déclenchement Erreur');
				if (typeof callback == 'function') { // Retour d'un objet error
					callback(jqXHR.errJSON);
				} else { // On lève une erreur car on ne doit pas pouvoir passer silencieusement une instanciation erronée (à traiter par l'appelant avec "try/catch")
					throw jqXHR.errJSON;
				}
			});
				
		}
	};

	/* 
	 * Vérification d'une session en cours... Doit être appelée avant chaque requête sur le serveur (pas de session ==> pas de requêtes)
	 */
	novaApp.novaAppGen.prototype.SessionOk = function(callback) {
		if (typeof this.session === "undefined" || this.session.toString() == "" ) {
			callback(false, {message: "La session novaxel n'est pas correctement initialisée", novaErr: "Session Novaxel inexistante (authentification erronée ou non effectuée)"});
			return false;
		} else {
			return true;
		}
	}
	
	
	/*
	 * Envoi un message de log sur le serveur...
	 * TODO : Devrait n'être disponible que pour un utilisateur duement authentifié
	 */
	novaApp.novaAppGen.prototype.sendLog = function(message, callback, optajax) {
		if (! this.SessionOk(callback)) { return false} ;
 
		var url = novaApp.NAS_URIS.SERVICE + '/log';
		novaApp.LogDEBUG('Appel de sendLog');
		var ret = novaApp.getDataNAS(url,{token: this.session, message: message}, cleanOptAjax(optajax));

		// TODO : JMB ne renvoi pas de retour
		
		ret.done(function(data, status, jqXHR) {
			// Présence d'erreur dans les datas retournées ?
			if (jqXHR.hasOwnProperty('errJSON')) {
				novaApp.LogDEBUG('Erreur dans le Flux - sendLog KO : "' + jqXHR.errJSON.novaErr);
				// Callback à false et err jointe
				callback(false, jqXHR.errJSON)
				return false;
			}
			
			novaApp.LogDEBUG('retour sendLog OK');
			callback(true, data[JSON_ENV['results']])
			return true;
		});
	 
		ret.fail(function(jqXHR) {
			novaApp.LogDEBUG('retour getLibs KO');
			callback(false, jqXHR.errJSON);
			return false;
		});
	}
	
	
	
	/*
	* Classe fille spécifique aux fonctionnalités "domaine"
	* Extension de la classe mère "novaAppGlobal"
	novaApp.domain = novaApp.domain || {}; // Sous-namespace dédié aux fonctionnalités domain
	*/
	
	novaApp.domain = novaApp.domain || {}; // Sous-namespace dédié aux fonctionnalités domain

	// Constructeur
	novaApp.domain =  function(login, password, callback) {
		if( arguments.length ) { this.getReady(login, password, callback); }
	}

	novaApp.domain.prototype = new novaApp.novaAppGen();
	novaApp.domain.prototype.constructor = novaApp.domain;


	novaApp.domain.prototype.getReady =  function(login, password, callback) {
		// Appel du constructeur parent
		this.tempReady = novaApp.novaAppGen.prototype.getReady;
		this.tempReady(this,login, password,'domain', callback);
	}
	

	// TODO : Voir JMB pour savoir si encore fonctionnelle ???
	novaApp.domain.prototype.getDBDom_infos = function(callback) {
		if (! this.SessionOk(callback)) { return false} ;
				
		url = novaApp.NAS_URIS.SERVICE + '/dbinfos';
		novaApp.LogDEBUG('Appel de getDBDom_infos');
		var ret = novaApp.getDataNAS(url,{token: this.session});
		ret.success(function(data, status, jqXHR) {
			callback(true, data[JSON_ENV['results']])
		});
		ret.error(function(jqXHR) {
			callback(false, jqXHR.errJSON)
		});
	}
	
	/*
	* Retourne un tableau des 100 dernières synchro (test JSON)
	*/
	// TODO : Voir JMB pour savoir si encore fonctionnelle ???
	novaApp.domain.prototype.getLogLast100 = function(callback) {	// Test JsonP
		if (! this.SessionOk(callback)) { return false} ;
							
		novaApp.LogDEBUG('Appel de getLogLast100');
		var url = novaApp.NAS_URIS.SERVICE + '/logs_last_100';
		
		var ret = novaApp.getDataNAS(url,{token: this.session});
		ret.success(function(data, status, jqXHR) {callback(true,data[JSON_ENV['results']])});
		ret.error(function(jqXHR) {callback(false, jqXHR.errJSON)});
	}
	

	/*
	* Retourne la liste des bibliothèques d'un propriétaire
	*/
	novaApp.domain.prototype.getLibs = function(callback, optajax) {
		if (! this.SessionOk(callback)) { return false} ;
	
		var url = novaApp.NAS_URIS.DOMAIN + '/getlibs';
		novaApp.LogDEBUG('Appel de getLibs');
		var ret = novaApp.getDataNAS(url,{token: this.session},cleanOptAjax(optajax));
		ret.done(function(data, status, jqXHR) {
			// Présence d'erreur dans les datas retournées ?
			if (jqXHR.hasOwnProperty('errJSON')) {
				novaApp.LogDEBUG('Erreur dans le Flux - getLibs KO : "' + jqXHR.errJSON.novaErr);
				// Callback à false et err jointe
				callback(false, jqXHR.errJSON)
				return false;
			}

			// TODO : contrôle de cohérence sur "libscount" et "libs" (non implémentée sur NAS)

			novaApp.LogDEBUG('retour getLibs OK');
			callback(true, data[JSON_ENV['results']].libs)
			return true;
		});
		ret.fail(function(jqXHR) {
			novaApp.LogDEBUG('retour getLibs KO');
			callback(false, jqXHR.errJSON);
			return false;
		});
	}

	/*
	* Retourne la liste des propriétaires de bibliothèque
	* Réservé à l'administrateur
	* TODO : voir JMB pour l'implémentation de cette function et cette restriction...
	*/
	novaApp.domain.prototype.getOwners = function(callback, optajax) {
		if (! this.SessionOk(callback)) { return false} ;
	
		var url = novaApp.NAS_URIS.DOMAIN + '/getowners';
		novaApp.LogDEBUG('Appel de getOwners');
		var ret = novaApp.getDataNAS(url,{token: this.session}, cleanOptAjax(optajax));
		
		ret.done(function(data, status, jqXHR) {
			// Présence d'erreur dans les datas retournées ?
			if (jqXHR.hasOwnProperty('errJSON')) {
				novaApp.LogDEBUG('Erreur dans le Flux - getOwners KO : "' + jqXHR.errJSON.novaErr);
				// Callback à false et err jointe
				callback(false, jqXHR.errJSON)
				return false;
			}
			
			// TODO : contrôle de cohérence sur "ownerscount" et "owners" (non implémentée sur NAS)
			
			novaApp.LogDEBUG('retour getOwners OK');
			callback(true, data[JSON_ENV['results']].owners)
			return true;
		});
		
		ret.fail(function(jqXHR) {
			novaApp.LogDEBUG('retour getLibs KO');
			callback(false, jqXHR.errJSON);
			return false;
		});
	}

/*
	novaApp.domain.prototype.testErr404 = function(callback, optajax) {
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
	*/


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



