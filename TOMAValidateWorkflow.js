/*
TOMA Validate of the POI List Item
ID=1
List={83943c6d-0f91-4955-98f6-2f237f81b098}
Approved TemplateID={dadb3334-529f-4891-ad80-dfadac1ae93e}
Rejected TemplateID=
*/

var blnApprove = /1/;
var blnSuccess = /success/;

var getWF_ID = function(vStatus,vItemURL) {
	var workflowGUID = "";
	var wfName="";
	
	if(blnApprove.test(vStatus)){
		wfName="TOMA Validate";  //Approved Name
	}else{
		wfName="TOMA Rejected";  //Rejected Name
	}

	$().SPServices({
	  operation: "GetTemplatesForItem",
	  item: vItemURL,
	  async: false,
	  completefunc: function (xData, Status) {
		if(blnSuccess.test(Status)){
		    $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function(i,e) {
		      // hard coded workflow name
		      if ( $(this).attr("Name") == wfName ) {              
		        var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");        
		        if ( guid != null ) {
		          workflowGUID = "{" + guid + "}";
		          }
		        }
		      });
		}else{
			var out = $().SPServices.SPDebugXMLHttpResult({
				node: xData.responseXML
			});
			document.getElementById("WSOutput").style.visibility = 'visible';  			
			$("#WSOutput").append("<br/><b>FAILED</b><br/>wfName:"+wfName+"<br/>xData:&nbsp;" + out);
		}
	  }
	});
	
	return workflowGUID;
}

function StartWorkflow() {
	var thisSite = $().SPServices.SPGetCurrentSite();
	var queryStringVals = $().SPServices.SPGetQueryString();
	var ItemID = queryStringVals["ID"];
	var lclStatus = queryStringVals["Status"];

	var listURL = "/Lists/Proponent%20POI/";
    var ItemURL = thisSite + listURL + ItemID + "_.000"

	var workflowID = getWF_ID(lclStatus,ItemURL);
	
	$().SPServices({  
		operation: "StartWorkflow",
		async: false,		  
		item: ItemURL,  
		templateId: workflowID,  
		workflowParameters: "<root />",  
		completefunc: function() {
			window.location.replace(thisSite + "/Pages/ACE-TOMA.aspx");
		}  
	});  
}

$(document).ready(function(){
	function runWF() {     
		StartWorkflow();
	}

	document.getElementById("loaderImage").style.visibility = 'visible';  
	document.getElementById("loaderMsg").style.visibility = 'visible';
	setTimeout(runWF, 5000);
});



