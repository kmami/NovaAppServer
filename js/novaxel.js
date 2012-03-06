//var serviceURL = "res/json.txt";

//var wHost = "http://192.168.253.47";
//var wHost = "http://94.23.6.97";  //dev.gedweb.fr
var wHost = "http://dev.gedweb.fr";
 xBib = "EXPERT"; 
 var  xIdiSession = '5000';

var serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery" +Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&N1=&N2=&N3=&N4=&POINTER=false");

var DataList;
var DataTemp;

var GDetail 	 = true;
var GColumnCount = 4;

var GDebug = false;

var GClass_ui_grid = $('#ui_gridDiv').attr("class");
var GClass_ui_gridHeader = $('#ui_gridDivHeader').attr("class");


function BuildDivBlock(Block,ColumnIndex,ColumnName)
{
	 $(Block).append(	'<div   class="ListNovaxel">'+
						'<ul   " id="List'+ColumnIndex+'"   data-role="listview"   data-filter="false" data-inset="true">'+ 
						'</ul>'+
						'</div>'
					).trigger( "create" );
					
					
		//	$('#List'+ColumnIndex).listview('refresh');
		//	$('#ListPage').html();
}
//background:#00A5DB;
function BuildDivBlockHeader(Block,ColumnIndex,ColumnName)
{
var imgColumn;

switch (ColumnIndex) {
  			
			case 0 : imgColumn = 'ressources/images/16x16/1_rose16x16.png';
			
			break;
  
  			case 1: imgColumn = 'ressources/images/16x16/2_violet16x16.png';
			break;
			
			case 2: imgColumn = 'ressources/images/16x16/3_vert_16x16.png';
			break;
			
			case 3: imgColumn = 'ressources/images/16x16/4_bleu_16x16.png';
			break;
			
			case 4: imgColumn = 'ressources/images/16x16/5_orange_16x16.png';
			break;
			
			default: 
			//...
			break;
			}

	 $(Block).append(
					'<div style="margin-left:3px;">'+
					'<ul data-role="listview" style="margin-left:-3px;"  >'+
					      '<li  data-role="list-divider" style="text-align:center; " ><img style="margin-left:-5px; margin-top:-5px; opacity:0.3; -moz-border-radius:.3em;-webkit-border-radius:.3em;border-radius:.3em;" src="'+imgColumn+'" class="ui-li-icon"></img>'+ColumnName+'</li>'+
            	     '</ul>'+
					
					'<div data-role="content" style="   border:1px black; opacity:0.9; height:45px; margin-top:17px; margin-bottom:-9px;"   >'+
						'<div class="ui-li-icon" adata-role="fieldcontain" style="height:23px;margin-top:-16px;  margin-left:-8px; margin-right:10px; "  >'+
						'<input     name="search" id="search'+ColumnIndex+'"  placeholder="Filtrer la liste..."  />'+
						'</div>'+
						'</div>'+	
						'</div>'						
			).trigger( "create" );		
}

$(function() 
   {
	 $("#search0").keyup( function(event)
     {
	   alert('test');
     });
   });

function BuildHeader()
{
	 $('#navbarDiv').after(
			'<div id="ui_gridDivHeader"  class="ui-grid-d" >'+
		    '<div class="ui-block-a"   id="contentDivBlock_aHeader" style="overflow:none;" >' +
            '</div>'+  
			'<div  class="ui-block-b"   id="contentDivBlock_bHeader" style="overflow:none;">'+  
	        '</div>'+  
			'<div  class="ui-block-c"  id="contentDivBlock_cHeader" style="overflow:none;">'+  
            '</div>'+  
			'<div  class="ui-block-d"  id="contentDivBlock_dHeader" style="overflow:none;">'+  
         	'</div>'+ 
			'<div class="ui-block-e"  id="contentDivBlock_eHeader" style="overflow:none;">'+   
			'</div>'+
			'</div>'
					 ).trigger( "create" );
		  //$('#ListPage').html();
			GClass_ui_gridHeader = $('#ui_gridDivHeader').attr('class')
}

$('#ListPage').bind('pageinit', function(event) {
	BuildDivBlockHeader('#contentDivBlock_aHeader',0,'Armoire');
	BuildDivBlock('#contentDivBlock_a',0,'Armoire');
//	$.mobile.pageLoading();	
    BuildList(GColumnCount);
});

function Loadlist()
{
   if (GDetail == true) {GDetail = false;} else {GDetail = true;}
   getList(GDetail,GColumnCount,0);
}

function BuildCol(NumCol)
{

if (GColumnCount == NumCol) return;  

$('#ui_gridDivHeader').remove();
BuildHeader();
BuildDivBlockHeader('#contentDivBlock_aHeader',0,'Armoire');
	
	if (NumCol == GColumnCount) {getList(GDetail,GColumnCount,0)}
	else
	{
	$('#contentDivBlock_b').empty();
	$('#contentDivBlock_c').empty();
    $('#contentDivBlock_d').empty(); 
    $('#contentDivBlock_e').empty();
	
    BuildList(NumCol);
	GColumnCount = NumCol;
	}
}

	
function BuildList(GColumnCount)
{

	switch (GColumnCount) {
  			
			case 2 : //Connexion base deux colonnes
					 xBib = "2COLONNES"; 
					 serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&N1=&N2=&N3=&N4=&POINTER=false");
					 $('#ui_gridDivHeader').addClass('ui-grid-a').removeClass(GClass_ui_gridHeader);
					 $('#ui_gridDiv').addClass('ui-grid-a').removeClass(GClass_ui_grid);

					 GClass_ui_grid = GClass_ui_gridHeader = 'ui-grid-a';
					 BuildDivBlockHeader('#contentDivBlock_bHeader',1,'Dossier');
					 BuildDivBlock('#contentDivBlock_b',1,'Dossier');
			break;
  
  			case 3: //Connexion base trois colonnes
			xBib = "3COLONNES"; 
					
					serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&N1=&N2=&N3=&N4=&POINTER=false");
					$('#ui_gridDivHeader').addClass('ui-grid-b').removeClass(GClass_ui_gridHeader);
					$('#ui_gridDiv').addClass('ui-grid-b').removeClass(GClass_ui_grid);
									
					GClass_ui_grid = GClass_ui_gridHeader = 'ui-grid-b';
					BuildDivBlockHeader('#contentDivBlock_bHeader',1,'Rayon');
					BuildDivBlock('#contentDivBlock_b',1,'Rayon');
					BuildDivBlockHeader('#contentDivBlock_cHeader',2,'Dossier');
					BuildDivBlock('#contentDivBlock_c',2,'Dossier');
			break;
			
  			case 4: //Connexion base quatrre colonnes
					 xBib = "EXPERT"; 
					serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&N1=&N2=&N3=&N4=&POINTER=false");	
					$('#ui_gridDivHeader').addClass('ui-grid-c').removeClass(GClass_ui_gridHeader);
					$('#ui_gridDiv').addClass('ui-grid-c').removeClass(GClass_ui_grid);
					
					GClass_ui_grid = GClass_ui_gridHeader  ='ui-grid-c';
					
					BuildDivBlockHeader('#contentDivBlock_bHeader',1,'Rayon');
					BuildDivBlock('#contentDivBlock_b',1,'Rayon');
					BuildDivBlockHeader('#contentDivBlock_cHeader',2,'Classeur');
					BuildDivBlock('#contentDivBlock_c',2,'Classeur');
					BuildDivBlockHeader('#contentDivBlock_dHeader',3,'Dossier');
					BuildDivBlock('#contentDivBlock_d',3,'Dossier');
			break;
		
			case 5: //Connexion base cinq colonnes
			xBib = "5COLONNES"; 
					serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&N1=&N2=&N3=&N4=&POINTER=false");
					//$('#ui_gridDivHeader').addClass('ui-grid-d').removeClass(GClass_ui_gridHeader);
					$('#ui_gridDiv').addClass('ui-grid-d').removeClass(GClass_ui_grid);
				    				   
					GClass_ui_grid = GClass_ui_gridHeader = 'ui-grid-d';
					BuildDivBlockHeader('#contentDivBlock_bHeader',1,'Rayon');
					BuildDivBlock('#contentDivBlock_b',1,'Rayon');
					
					BuildDivBlockHeader('#contentDivBlock_cHeader',2,'Classeur');
					BuildDivBlock('#contentDivBlock_c',2,'Classeur');
										
					BuildDivBlockHeader('#contentDivBlock_dHeader',3,'Intercalaire');
					BuildDivBlock('#contentDivBlock_d',3,'Intercalaire');
					
					BuildDivBlockHeader('#contentDivBlock_eHeader',4,'Dossier');
					BuildDivBlock('#contentDivBlock_e',4,'Dossier');
			break;
		
			default: 
			//...
			break;
			}
			getList(GDetail,GColumnCount,0);
}

function FormatTaille(xTaille)
{
	var chaine;
	if (xTaille >= 1048576) 
		chaine=Math.round(xTaille/(1024*1024)) +' Mo'
	else
		chaine=Math.round(xTaille/1024) +' Ko';
	return chaine;
}

function FctDoc(Str)
{
  if (Str == undefined) return '0' 
 else return Str;
}

function getFile(ItemIdi) {
	//var Wapercu = '&APERCU=FALSE';
			
			var Wapercu = '&APERCU=TRUE';
	//if ((IsApercuPDF == true) || (wNovatype == 14)) 
	Wapercu = '&APERCU=TRUE';
					
//	if ((ItemNovaTypeTiff == 1) && (Is_iPhone_Or_IsiPadDetect == false)) 
//	var myFile = Host +	'TIFF2PDF?mobile' +Base64.encode('BIB='+xbib+'&IDISESSION='+xIdiSession+'&IDI='+ItemIdi+'&SENDREDIRECT=1'+Wapercu)
//	else
	var myFile = wHost + "/novaxel/"+ 'chargedocument?mobile' +Base64.encode('BIB='+xBib+'&IDISESSION='+xIdiSession+'&IDI='+ItemIdi+'&SENDREDIRECT=1'+Wapercu);
	
	 window.open(myFile);//,ItemIdi, '');
}

function Get_Dossier(IdiDossier)
{
var xGet_Dossier       = "GET_DOSSIER?mobilejquery";
var xbib = "EXPERT";
var xIdiUser = "5000";

var xParamsGet_Dossier = "BIB="+xbib+"&IDIUSER="+ xIdiUser;
			
$('#ListFolder').empty();			

var Url = wHost + "/novaxel/"+ xGet_Dossier +  Base64.encode(xParamsGet_Dossier + "&IDI=" + IdiDossier);

	  jQuery.ajax({
      		//  dataType      : wJsonp,
 	   		  jsonpCallback : "jsonp_callback",
      		  url: Url,
		      success:function(data) 
			  {
				data = Base64.decode(data);
   				json = eval('(' + data + ')');
				
					
				for (var i=0; i< json.DOCUMENTS.length;i++) 
				{
					DataList = json.DOCUMENTS[i];
			   	  //$.each(DataList, function(index, DataList) {
									
					$('#ListFolder').append(
					'<li data-icon="false" data-role="list-divider" onClick="getFile('+DataList.IDI+')" >'+
				
					
					'<a>'+
						'<h4 style="font-weight:baold">'+ DataList.LIB + '</h4>'+
						'<p>' + FormatTaille(DataList.TAILLE) + '</p>'+
					'</a>'+
					'</li>'
					).trigger( "create" );
					
					$("#ListFolder").listview("refresh");
					
				//	$('#contentDivBlock_aFolder').refresh();
					
					
					//});	
			  }
			  
			  }
			});	
			
}

function alertdemo(idi,idc,numcolumn)
{
 //var leafId = $(this).parent().attr('id');
 //alert(leafId);
 //var serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB=EXPERT&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&N1=&N2=&N3=&N4=&POINTER=false");
 // $(this).attr("style" , "font-color:yellow");

 // alert('test');
 //alert( ' idi = '+idi + ' idc= '+ idc + 'Num colonne= '+  numcolumn  );	
  
  //alert($('#List0 li').val());
  
 //alert( $(this).data('IDI'));
  
if (idc == 600)
{
//$('#List0').prop("href", "#mainFolder");
//document.location.data-transition = "flip";

Get_Dossier(idi);
document.location.href = "#mainFolder";

//ColumnMode();
}
 
 
//alert(this.value);	
  
     
 //  alert(numcolumn);
   	switch (numcolumn) 
   					{
   						case 0:
						serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&NUMCOL="+   2 +"&POINTER=false"+"&IDI="+idi+"&IDC="+idc);  
								getList(GDetail,GColumnCount,1);
   								break;
								
						case 1:
					serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&NUMCOL="+   3 +"&POINTER=false"+"&IDI="+idi+"&IDC="+idc);  
								getList(GDetail,GColumnCount,2);
   								break;
						case 2:
				serviceURL = wHost + "/novaxel/GET_ITEMS?mobilejquery"+Base64.encode("BIB="+xBib+"&FILTRESAISIE=false&FILTREINDEXER=,,,,,,&IDIUSER=5000&NUMCOL="+   4 +"&POINTER=false"+"&IDI="+idi+"&IDC="+idc);  
   								getList(GDetail,GColumnCount,3);
   								break;
						case 3:
   								//getList(GDetail,GColumnCount,4);
   								break;
				
   						default:
   								break;
					}
    
  
}
//	
function getList(Detail,ColumnCount,BeginColumn) {

//alert(serviceURL );

/*
jQuery.ajax({
      	      	
         	  type: 		  "GET",
 	   	
      		  url: serviceURL ,
			  {
	  			
 					 json = eval('(' + data + ')'); 
 					
//alert(json[0][0].LIB);
 					
				   
			  },
			  error:function()
			  { 
				  alert('Erreur !')
  	  		  }				  
			  
			});
  
*/


//alert(serviceURL );	
 //$.ajaxSetup({ 
    //        scriptCharset: "utf-8" , 
      //      contentType: "application/json; charset=utf-8",
        //    cache: false
       // })
	  /*
	    jQuery.ajax({	  url:serviceURL, success:function(data) {
			
			//  var StrJson = eval('(' + data + ')'); 
			  
			   StrJson = Base64.decode(data); 
			   alert(StrJson); 
			  
		  	  strReturn = StrJson }, async:false
	 		 });
	   */
	   
//alert(serviceURL);

  jQuery.ajax({	  url:serviceURL, success:function(data) { 
//	$.getJSON(serviceURL , function(data) {
	
//	StrJson = Base64.decode(data); 
	//		   alert(StrJson); 

var j = 0;
	   for(var i=BeginColumn; i< ColumnCount; i++)
	   {
	   
	   var BdataIcon;
	   var StrMarginLeft;
	   
if (i == ColumnCount -1) 
{
BdataIcon = "arrow-r";
StrMarginLeft = "";
}
else
{
BdataIcon = false;
StrMarginLeft = 'margin-right:-30px;';
}

			
			if (BeginColumn != 0)
			{
			//alert(BeginColumn);
			
			//alert(BeginColumn);
			$('#List'+BeginColumn+' li').remove();
			BeginColumn++;
		
			}
		
			
			else
			$('#List'+i+' li').remove();
			
			var StrJson = Base64.decode(data); 
		  //data = Base64.decode(data)
			StrJson = eval('(' + StrJson + ')'); 
			
		//	DataList = null;
			
			if (BeginColumn != 0)
			{
		 	
			  DataList = StrJson[j];
			  
			}
			else
			DataList = StrJson[i];
	//	alert(DataList.LIB);	
						
		$.each(DataList, function(index, DataList) {
			/*	
				<h3><a>${title}</a></h3>
        <p class="subItem"><strong>${postedAgo} by ${postedBy} </strong></p>
        <div class="ui-li-aside">
            <p><strong>${points} points</strong></p>
            <p>${commentCount} comments</p>
        </div>*/


if (DataList.NOTE != undefined )
{
wNote = '<img src="ressources/images/note.gif" alt="icon1" >  </img>';
}
else
wNote = '';

var StrStyle

if (DataList.TAILLE == 0) 
{
StrStyle = 'font-style:italic; font-weight:normal;';
}
else

StrStyle = 'font-weight:bold;';
var StrCountVisible = 'visible;';



					if (Detail == true)
					{
					if (DataList.ISDEL == true)
					{
					//$('#List'+i).append('<li><a href="test.html?id=' +DataList.IDI + '">' +	
					$('#List'+i).append(
			//		'<div data-role="content" style="padding-top:13px;">'+
					
					
					'<li data-icon="'+BdataIcon+'" data-role="list-divider" data-icon="" onClick="alertdemo('+DataList.IDI+','+ DataList.IDC+','+i+');"><a>' +	
					'<h4 style="text-decoration:line-through;'+StrStyle+'">'+ wNote + DataList.LIB + '</h4>' +
					
					'<p>' + FormatTaille(DataList.TAILLE) + ' '  + '</p>'+
		
					'<span  style="'+StrMarginLeft+'visibility:'+StrCountVisible+'" data-icon="'+BdataIcon+'" class="ui-li-count">' + FctDoc(DataList.XNBDOC)+' Doc' + '</span></a> </li>'
				//	+'</div>'
					);
					}
					else
					{
					
				
			
					
					//$('#List'+i).append('<li><a href="test.html?id=' +DataList.IDI + '">' +
					
					$('#List'+i).append(
				//	'<div data-role="content" style="padding-top:13px;">'+
					'<li data-icon="'+BdataIcon+'" data-role="list-divider"  onClick="alertdemo('+DataList.IDI+','+ DataList.IDC+','+i+');"><a>' +		
					'<h4 >' + 
					'<font  STYLE="'+StrStyle+'">'+wNote + DataList.LIB +'</font>'+

					'</h4>' +	
					'<p>' + FormatTaille(DataList.TAILLE) + ' '  + '</p>' +
					'<span  style="'+StrMarginLeft+'visibility:'+StrCountVisible+'" class="ui-li-count">' + FctDoc(DataList.XNBDOC) + ' Doc' + '</span></a></li>'
				//	+'</div>'
					);
					}
					}
					else
					{
						if (DataList.ISDEL == true)
					{
					//$('#List'+i).append('<li id="toto"><a href="test.html?id=' +DataList.IDI + '">' +	
					$('#List'+i).append(
				//	'<div data-role="content" style="padding-top:13px;">'+
					'<li data-icon="'+BdataIcon+'" data-role="list-divider"  onClick="alertdemo('+DataList.IDI+','+ DataList.IDC+','+i+');"><a>' +	
					'<h4 style="text-decoration:line-through;'+StrStyle+'">' + wNote + DataList.LIB + '</h4></a></li>'
				//	+'</div>'
					);
					}
					else
					{
					//$('#List'+i).append('<li><a href="test.html?id=' +DataList.IDI + '">' +
					$('#List'+i).append(
				//	'<div data-role="content" style="padding-top:13px;">'+
					'<li  data-icon="'+BdataIcon+'" data-role="list-divider"  onClick="alertdemo('+DataList.IDI+','+ DataList.IDC+','+i+');"><a>' +	
					//'<h4 >'+ wNote + DataList.LIB + '</h4>'+'
					'<h4 style="'+StrStyle+'">'+ wNote + DataList.LIB + '</h4>' +
					'</a></li>'
				//	+'</div>'
					);
					}
						
					}
				
		});  
		
		
		$('#List'+i).listview('refresh');
	//	$.mobile.pageLoading(true);	
	j++;
	   }
		
	}, async:false
	 		 });
	
	
	//);
}

function fctNavbarDiv()
{   
	
	if (GDebug)
        {		
			GDebug = false;	
	     	$('#navbarDiv').css({'height':'0px'});
        }
	 else
        {	
			GDebug = true;	
			$('#navbarDiv').css({'height':'auto'});
        }
		
}


function ColumnMode()
{
//alert($(this).value);



}
BuildHeader();

