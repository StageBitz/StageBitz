	var Type;
	var url;
	var Data;
	var ContentType;
	var DataType;
	var ProcessData;

	Type = "POST";
	// Data = '{"value": "' + content + '"}';
	ContentType = "application/json; charset=utf-8";
	DataType = "json";
	ProcessData=true;

function CallService(Type, Url, Data, ContentType, DataType, ProcessData, onSuccess, onFailed) {
		console.log("sending...")
		$.ajax({
			type : Type,
			url : Url,
			data : Data,
			contentType : ContentType,
			dataType : DataType,
			processData : ProcessData, 
			success : onSuccess,
			error : onFailed
		});
	}

function quickCallService(Type, Url, Data, ContentType, DataType, ProcessData, onSuccess, onFailed) {
    console.log("sending quick...")
    $.ajax({
           type : Type,
           url : Url,
           data : Data,
           contentType : ContentType,
           dataType : DataType,
           processData : ProcessData,
           success : onSuccess,
           timeout: 3000 ,
           error : onFailed
           });
}

function requestDataAtLogin(usermail, password, version){
	
	//alert(serviceUrl);
	var surl=serviceUrl+"Security/AuthenticateUser";
	
	if(checkConnection()){
		var dataO='{"email": "' + usermail + '", "pwd":"'+password+ '","version":"'+version+'" }';
		CallService(Type, surl, dataO, ContentType, DataType, ProcessData, loginSuccess, loginFailed);
		
	}
	else{
		navigator.notification.alert("You are not currently connected to a network.", routeToLoginPage, "Internet Connection Lost.", "OK");
        $("#loginbutton").removeClass("disabled");
        $("#username").removeClass("disabled");
        $("#password").removeClass("disabled");
        $("#loginbutton").text("Sign in");
	}

}

function loginSuccess(data) {
   
// $('#output').text(data.d);
// console.log("Success...")
	// data.UserToken
	if(data.Status=="OK"){
       
		window.localStorage["usertoken"] = data.UserToken;
	$.each(data.ItemTypeList,function(i,itemtype){
    
        db.transaction(function(tx) {

			tx.executeSql('INSERT INTO itemtype(typeid,typename) VALUES(?, ?)',
					[ itemtype.Id, itemtype.Name ], function(tx, results) {
						// alert("success");
                           console.log("it: " + itemtype.Name );
					}, function(tx, error) {
						console.log("error" );
                         // alert("error");
					});
		});
    });
	
	$.each(data.CompanyList,function(i,companylist){
       
           db.transaction(function(tx) {

			tx.executeSql('INSERT INTO companylist(companyid,companyname,cancreate) VALUES(?, ?, ?)',
					[ companylist.Id, companylist.Name, companylist.IsCompanyUser ], function(tx, results) {
						// alert("success");
                           console.log("cl: " + companylist.Name);
					}, function(tx, error) {
						console.log("error" );
					});
		});
    });
	window.localStorage["dataLoaded"]= true;
	window.localStorage["itemPostfixNumber"]=0;
        var cDate=new Date();
        var formatedDate=cDate.toLocaleDateString();
    window.localStorage["itemAutoGenerateDate"]=formatedDate;
    window.localStorage["itemAutoGenerateID"]="1";
    window.localStorage["SyncWifyOnly"]="true";
    window.localStorage["SearchWifiOnly"]="true";
    window.localStorage["savetoGallery"]="false";
    window.localStorage["cameraPhotoHeight"]="1024";
    window.localStorage["cameraPhotoWidth"]="1024";
	$.mobile.changePage("home.html");
	}else{
		navigator.notification.alert(data.Message, function () { },"Login Failed", "OK");
	}
	$("#loginbutton").removeClass("disabled");
    $("#username").removeClass("disabled");
    $("#password").removeClass("disabled");
    $("#loginbutton").text("Sign in");
	
}
function loginFailed(msg) {   
	
	// alert("loginFailed in request");
	if(!checkConnection()){
		navigator.notification.alert("Connection lost while connecting to StageBitz. Please try login again once your device connects to internet.", routeToLoginPage, "Internet Connection Lost", "OK");
	}
    else{
        navigator.notification.alert("Couldn't connect to StageBitz. Please try again.", routeToLoginPage, "Server Error", "OK");
    }
    
    $("#loginbutton").removeClass("disabled");
    $("#username").removeClass("disabled");
    $("#password").removeClass("disabled");
    $("#loginbutton").text("Sign in");
	
}

function routeToLoginPage(){
	
	$.mobile.changePage("login.html"); 
}

function requestDataAtInitialization(usertoken, version){
	var surl=serviceUrl+"Inventory/GetInitializeData";
    
	if(checkConnection()){
	 var dataO='{"token": "' + usertoken + '","version":"'+version+'" }';
	CallService(Type, surl, dataO, ContentType, DataType, ProcessData, initialiazesuccess, initiliazeFailed);
	}
	else{
		
		window.localStorage["dataLoaded"]= false;
        $.mobile.changePage("home.html");
        //alert();
	}

}

function initialiazesuccess(data){
	
	if(data.Status=="OK"){
        if(dropAndCreateTables()){
			$.each(data.ItemTypeList,function(i,itemtype){
                   
                   db.transaction(function(tx) {
                                  
                                  tx.executeSql('INSERT INTO itemtype(typeid,typename) VALUES(?, ?)',
                                                [ itemtype.Id, itemtype.Name ], function(tx, results) {
                                                //alert("success");
                                                }, function(tx, error) {
                                                //alert("error");
                                                });
                                  });
                   });
            
			$.each(data.CompanyList,function(i,companylist){
			       
                   db.transaction(function(tx) {
                                  
                                  tx.executeSql('INSERT INTO companylist(companyid,companyname,cancreate) VALUES(?, ?, ?)',
                                                [ companylist.Id, companylist.Name, companylist.IsCompanyUser ], function(tx, results) {
                                                console.log(companylist.Name);
                                                console.log(companylist.Id);
                                                // alert("success");
                                                }, function(tx, error) {
                                                //alert("error");
                                                });
                                  });
                   });
		}
		else
        {
			//navigator.notification.alert("something wrong with db tables dropping.", function () {});
             console.log("something wrong with db tables dropping" );
        }
    }else{
		//navigator.notification.alert("Your login failed. Please try login again.", function () {});
        console.log("login failed at intilization" );
	}
	$.mobile.changePage("home.html");
    
}

function initiliazeFailed(msg) {
	window.localStorage["dataLoaded"]= false;
	//alert(msg.status + ':' + msg.statusText);
    $.mobile.changePage("home.html");
}





function requestDataAtHome(usertoken, version){
	var surl=serviceUrl+"Inventory/GetInitializeData";
    
	if(checkConnection()){
        var dataO='{"token": "' + usertoken + '","version":"'+version+'" }';
        quickCallService(Type, surl, dataO, ContentType, DataType, ProcessData, requestHomesuccess, requestHomeFailed);
	}
	else{
		
		window.localStorage["dataLoaded"]= false;
        $.mobile.changePage("home.html");
        //alert();
	}
    
}

function requestHomesuccess(data){
	
	if(data.Status=="OK"){
        if(dropAndCreateTables()){
			$.each(data.ItemTypeList,function(i,itemtype){
                   
                   db.transaction(function(tx) {
                                  
                                  tx.executeSql('INSERT INTO itemtype(typeid,typename) VALUES(?, ?)',
                                                [ itemtype.Id, itemtype.Name ], function(tx, results) {
                                                //alert("success");
                                                }, function(tx, error) {
                                                //alert("error");
                                                });
                                  });
                   });
            
			$.each(data.CompanyList,function(i,companylist){
			       
                   db.transaction(function(tx) {
                                  
                                  tx.executeSql('INSERT INTO companylist(companyid,companyname,cancreate) VALUES(?, ?, ?)',
                                                [ companylist.Id, companylist.Name, companylist.IsCompanyUser ], function(tx, results) {
                                                console.log(companylist.Name);
                                                console.log(companylist.Id);
                                                // alert("success");
                                                }, function(tx, error) {
                                                //alert("error");
                                                });
                                  });
                   });
		}
		else
        {
			 console.log("something wrong with db tables dropping" );
        }
    }else{
		//navigator.notification.alert("Your login failed. Please try login again.", function () {});
        console.log("login failed at intilization" );
	}
	
}

function requestHomeFailed(msg) {
	window.localStorage["dataLoaded"]= false;
	//alert(msg.status + ':' + msg.statusText);
    
}



 function checkConnection(){
	 
    var networkState = navigator.connection.type;
     return !(networkState == Connection.NONE || networkState == Connection.CELL);
	
 }

function isWifiAvailable(){
    var networkState = navigator.connection.type;
    return (networkState==Connection.WIFI );
}

function uploadItemDetails(sbItemId, mobileItemId, itemName, typeId, companyId, description, quantity, createdDate, success,error,noConnection) {
    var surl = serviceUrl + "Inventory/SyncItem";
    
    if(checkConnection()){
		console.log(navigator.connection.type);
        if(window.localStorage["SyncWifyOnly"]=="true" && !isWifiAvailable()) {
            navigator.notification.confirm(
                                           'No Wi-Fi connection. Please Try again later.', // message
                                           function(){
                                           noConnection();
                                           },
                                           'No Wi-Fi Connection',
                                           'OK'
                                           );
        }else{

        var dataO={
            'ItemId':sbItemId,
            'DeviceItemId':mobileItemId,
            'CompanyId':companyId,
            'Token':window.localStorage["usertoken"],
            'Name':itemName,
            'ItemTypeId':typeId,
            'Quantity':quantity,
            'Description':description,
            'Version':appAPIVersion,
            'LastUpdateDate':createdDate
        };
        
        CallService(Type, surl, JSON.stringify(dataO), ContentType, DataType, ProcessData,success, error);
        }
    }else{
        navigator.notification.alert(
                                     'Internet connection lost while uploading items to the server. Please try again once your device connects to the Internet.',
                                     function(){
                                     noConnection();
                                     
                                     },
                                     'Internet Connection Lost',
                                     'OK'
                                     );
    }
}

function uploadImageData(sbImageId, sbItemId, mobileImageId, fileName, extension, companyId, relatedTable, sortOrder, image, createdDate, success,error,noConnection) {
	var surl = serviceUrl + "Inventory/SyncImage";
    if(checkConnection()){
		console.log(navigator.connection.type);
        if(window.localStorage["SyncWifyOnly"]=="true" && !isWifiAvailable()) {
            navigator.notification.confirm(
                                           'No Wi-Fi connection. Please Try again later.', // message
                                           function(){
                                           noConnection();
                                           },
                                           'No Wi-Fi Connection',
                                           'OK'
                                           );
        }else{
            var dataO = {'DocumentMediaId':sbImageId,
            'MobileImageId': mobileImageId,
                'CompanyId': companyId,
            'SortOrder': sortOrder,
            'RelatedId': sbItemId,
            'RelatedTable': relatedTable,
            'Token': window.localStorage["usertoken"],
            'Name': fileName,
            'FileExtension': extension,
            'Image': image,
            'Version': appAPIVersion};
            //console.log(dataO);
            CallService(Type, surl, JSON.stringify(dataO), ContentType, DataType, ProcessData,success, error);
        }
    }else{
        navigator.notification.alert(
                                     'Internet connection lost while uploading Items to the server. Please try again once your device connects to the Internet.',
                                     function(){
                                     noConnection();
                                     
                                     },
                                     'Internet Connection Lost',
                                     'OK'
                                     );
    }
    
}

function loadExistingItemDetails(ItemId, CompanyId, success, error){
   
var surl = serviceUrl + "Inventory/GetItemDetails";
    
    
    if(checkConnection()){
		console.log(navigator.connection.type);
        if(window.localStorage["SearchWifiOnly"]=="true" && !isWifiAvailable()) {
            navigator.notification.confirm(
                                           'No Wi-Fi connection. Please Try again later.', // message
                                           function(){
                                           $.mobile.loading('hide');
                                           $.mobile.changePage("search.html");
                                           return false;
                                           },
                                           'No Wifi Connection',
                                           'OK'
                                           );
        }else{
       
        var dataO={'ItemId':ItemId,'CompanyId':CompanyId,'Token':window.localStorage["usertoken"],'Version':appAPIVersion};
        var data=JSON.stringify(dataO);
		//var dataO='{"email": "' + usermail + '", "pwd":"'+password+ '","version":"'+version+'" }';
		CallService(Type, surl, data, ContentType, DataType, ProcessData, success, error);
        
    }
    }else {
		navigator.notification.alert(
                                     'Connection lost while connecting to StageBitz. Please check your connecton.',
                                     function(){
                                     $.mobile.loading('hide');
                                     $.mobile.changePage("search.html");
                                     return false;
                                     },
                                     'Internet Connection Lost',
                                     'OK'
                                     );
	}
    
    
}

function loadNextImage(ItemId, CompanyId, DocumentMediaId, success, error){
    
    var surl = serviceUrl + "Inventory/GetImageDetailsForItem";
    
    
    
	if(checkConnection()){
		console.log(navigator.connection.type);
        if(window.localStorage["SearchWifiOnly"]=="true" && !isWifiAvailable()) {
            navigator.notification.confirm(
                                           'No Wi-Fi connection. Please Try again later.', // message
                                           function(){
                                           $.mobile.loading('hide');
                                           },
                                           'No Wifi Connection',
                                           'OK'
                                           );
        }else{
        
        var dataO={'ItemId':ItemId,'CompanyId':CompanyId,'Token':window.localStorage["usertoken"],'Version':appAPIVersion,'DocumentMediaId':DocumentMediaId};
        var data=JSON.stringify(dataO);
		//var dataO='{"email": "' + usermail + '", "pwd":"'+password+ '","version":"'+version+'" }';
		CallService(Type, surl, data, ContentType, DataType, ProcessData, success, error);
        
    }
    }else {
		navigator.notification.alert(
                                     'Connection lost while connecting to StageBitz. Please check your connecton.',
                                     function(){
                                     $.mobile.loading('hide');
                                    
                                     },
                                     'No Internet Connection',
                                     'OK'
                                     );
	}
    
    
}

function loadSearchResults(itemName, itemTypeId, companyId, viewedResultCount, success, error, noConnection){
    var surl = serviceUrl + "Inventory/GetItemSearchResults";
    
	if(checkConnection()){
		console.log(navigator.connection.type);
        if(window.localStorage["SearchWifiOnly"]=="true" && !isWifiAvailable()) {
            navigator.notification.confirm(
                                           'No Wi-Fi connection. Please Try again later.', // message
                                           function(){
                                           noConnection();
                                           },
                                           'No Wifi Connection',
                                           'OK'
                                           );
        }else{
            var dataO = {'ItemName':itemName,
                'ItemTypeId':itemTypeId,
                'CompanyId':companyId,
                'Token':window.localStorage["usertoken"],
                'Version':appAPIVersion,
                'ViewedResultCount':viewedResultCount};
            //console.log(dataO);
            CallService(Type, surl, JSON.stringify(dataO), ContentType, DataType, ProcessData,success, error);
        }
        
	} else{
        navigator.notification.alert(
                                     'Internet connection lost while searching. Please try again once your device connects to the Internet.',
                                     function(){
                                     
                                     noConnection();},
                                     'No Internet Connection',
                                     'OK'
                                     );
    }
}
