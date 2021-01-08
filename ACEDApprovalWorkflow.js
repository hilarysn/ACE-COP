/*
ACED Approval of the POI List Item
List={83943c6d-0f91-4955-98f6-2f237f81b098}
Approved TemplateID={3f45fec4-cdf8-4c50-bdd3-1a2e373b9077}
Rejected TemplateID={e931a62d-1221-4614-9ed2-3737cc5ff1eb}
*/

var blnApprove = /1/;
var blnSuccess = /success/;

var getWF_ID = function(vStatus,vItemURL) {
	var workflowGUID = "";
	var wfName="";
	
	if(blnApprove.test(vStatus)){
		wfName="ACED Approval";  //Approved Name
	}else{
		wfName="ACED Rejected";  //Rejected Name
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
			window.location.replace(thisSite + "/Pages/ACE-ACED.aspx");
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



