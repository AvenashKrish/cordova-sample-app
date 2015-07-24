var db;
var shortName = 'carDb';
var version = '1.0';
var displayName = 'carDb';
var maxSize = 65535;

var user="";
var currentVehicle= null;
    
var dbCreated = false;

$(document).ready(function(){
    document.addEventListener("deviceready", onDeviceReady, false);    
    //onDeviceReady();    
});

$('#btnBid').click(function(event){
   var bidamt = $('#txtBidAmount').val();
    placeBid(bidamt);    
});

$('#btnFinishBid').click(function(event){
    if(user == 'admin'){
        getWinner(currentVehicle);
    }
    else{
        navigator.notification.alert("Not authorized to complete auction", null, "Operation Failed", 'OK');
    }
    
});

function onDeviceReady() {    
    
    if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
        return;
    }

    db = window.openDatabase(shortName, version, displayName, maxSize);
    
    if (dbCreated){
    	db.transaction(getVehicles, errorHandler);
    }
    
    else {
        db.transaction(populateDB, errorHandler, populateDB_success);
    }
    
}

$("#frmLogin").submit(function(){

    var username = $("#txtUsername").val();
    var password = $("#txtPassword").val();
    
    if (!username || !password){
        navigator.notification.alert("Invalid login details", null, "Error", "OK")            
    }
    
    else{
        $("#welcomeName").text("Logged in as: " + username);
        
        user = username;
        
        $("#txtUsername").val("");
        $("#txtPassword").val("");
        
        $.mobile.changePage("#home");        
    }
    
    return false;    
});

///////////////////////////////////////////////////////////////////////////////////////////
//
//Database methods
//
///////////////////////////////////////////////////////////////////////////////////////////

function errorHandler(tx, error) {
   alert('Error: ' + error.message + ' code: ' + error.code);
}

function successCallBack() {
   alert('Success');
}

function nullHandler(){};

function populateDB_success(){
    dbCreated = true;    
    db.transaction(getVehicles, errorHandler);    
}

function getWinner(id){
    var sql = "SELECT * from Bids where itemId= ?";
    db.transaction(function(tx){
        tx.executeSql(sql, [currentVehicle], getWinner_success);
    }, errorHandler);
}
                   
function getWinner_success(tx, results){
        var item = results.rows.item(0);
        navigator.notification.alert(item.user + " is the winner. Bid amount " + item.bidAmount + ".00", null, "Message", 'OK');        
}

function placeBid(amount){
    var sql = "INSERT INTO Bids (itemId, bidAmount, user) VALUES (?,?,?)";
    
    db.transaction(function(tx){
        tx.executeSql(sql, 
                      [currentVehicle, amount, user], 
                      function(){ 
                            navigator.notification.alert("Bid placed successfully", null, "Success", 'OK'); 
                            showBids(currentVehicle); 
                        });},errorHandler);
}

function getVehicles(tx) {
	var sql = "select * from Vehicles";
	tx.executeSql(sql, [], getVehicles_success);
}

function getVehicles_success(tx, results) {    
    var len = results.rows.length;
        
    $("#toyotaItems").empty();
    $("#nissanItems").empty();
    $("#hondaItems").empty();
    
    for (var i=0; i<len; i++) {
    	var vehicleItem = results.rows.item(i);
        
        if(vehicleItem.manu_code == 1){                    
            $("#toyotaItems").append(
            '<li onclick="showBids(' + vehicleItem.id + ')" >' +
                '<img src="img/'+ vehicleItem.picture +'" />' +
                '<h5>' + vehicleItem.model + " " + vehicleItem.manu_year + "(" + vehicleItem.type + ")" + "</h5>" + 
                '<p>' + vehicleItem.base_price + ' Rs.</p>' +
                '</li>'            
            );
        }
        
       else if(vehicleItem.manu_code == 2){
              $("#nissanItems").append(
            '<li onclick="showBids(' + vehicleItem.id + ')" >' +
                '<img src="img/'+ vehicleItem.picture +'" />' +
                '<h5>' + vehicleItem.model + " " + vehicleItem.manu_year + "(" + vehicleItem.type + ")" + "</h5>" + 
                '<p>' + vehicleItem.base_price + ' Rs.</p>' +
                '</li>'            
            );               
        
        }
        
        else if(vehicleItem.manu_code == 3){
        
            $("#hondaItems").append(
            '<li onclick="showBids(' + vehicleItem.id + ')" >' +
                '<img src="img/'+ vehicleItem.picture +'" />' +
                '<h5>' + vehicleItem.model + " " + vehicleItem.manu_year + "(" + vehicleItem.type + ")" + "</h5>" + 
                '<p>' + vehicleItem.base_price + ' Rs.</p>' +
                '</li>'            
            );        
            
        }      
        
    }
    
}

function showBids(id){
    currentVehicle = id;
    
    db.transaction(function(tx){
        var sql = "select * from Bids where itemId = ?";
        tx.executeSql(sql, [id], showBids_success);        
    }, errorHandler);
    
}

function showBids_success(tx, results){
    //alert('asd');   
    
    var len = results.rows.length;     

    $('#bidItems li').addClass('ui-screen-hidden'); 
    
    for (var i=0; i<len; i++) {
    	var bidItem = results.rows.item(i);
        
        $("#bidItems").append(
            '<li>' +            
            '<h5>' + bidItem.bidAmount + ".00 (" + bidItem.user + ")" + "</h5>" +
            '</li>'            
        );
        
        $('#bidItems').listview().listview('refresh'); 
    
    }
            
    $.mobile.changePage("#bid");        

}
    

function populateDB(tx){
    
	tx.executeSql('DROP TABLE IF EXISTS Vehicles');
    tx.executeSql('DROP TABLE IF EXISTS Bids');

	var sql = 
		"CREATE TABLE IF NOT EXISTS Vehicles ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"model VARCHAR(50), " +
        "manu_year int, " +
		"manu_code integer, " +
		"type VARCHAR(50), " +
		"base_price double, " +
		"picture VARCHAR(50) ) ";
    
    tx.executeSql(sql); 
    
    var sql2 = 
		"CREATE TABLE IF NOT EXISTS Bids ( "+
		"itemId INTEGER , " +
		"bidAmount double, " +
		"user varchar(50) ) ";
    
    tx.executeSql(sql2);    
    
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Hiace',2000, 1, 'van',2000,'car_home.jpg')");
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Tower', 2003, 1, 'van',5000,'car_home.jpg')");
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Allion', 2000, 1, 'car',4000,'car_home.jpg')");
    
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Sunny',2007, 2,'car',2000,'car_home.jpg')");
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Skyline',2002, 2,'car',6000,'car_home.jpg')");
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Alto',2004, 2,'car',500,'car_home.jpg')");
    
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Prius',2012,3,'car',8000,'car_home.jpg')");
    tx.executeSql("INSERT INTO Vehicles (model,manu_year,manu_code,type,base_price,picture) VALUES ('Nano',2000,3,'car',5000,'car_home.jpg')");
    
    tx.executeSql("INSERT INTO Bids (itemId, bidAmount, user) VALUES (1,2010,'user1')");
    tx.executeSql("INSERT INTO Bids (itemId, bidAmount, user) VALUES (1,3000,'user3')");
    tx.executeSql("INSERT INTO Bids (itemId, bidAmount, user) VALUES (1,5000,'user4')");
    
    tx.executeSql("INSERT INTO Bids (itemId, bidAmount, user) VALUES (2,2010,'user1')");
    tx.executeSql("INSERT INTO Bids (itemId, bidAmount, user) VALUES (2,3000,'user3')");
    tx.executeSql("INSERT INTO Bids (itemId, bidAmount, user) VALUES (2,5000,'user4')");
    
}

//////////////////////////////////////////////////////////////////////////////
//
//Map methods
//
//////////////////////////////////////////////////////////////////////////////

function max_height() {
    var h = $('div[data-role="header"]').outerHeight(true);
    var f = $('div[data-role="footer"]').outerHeight(true);
    var w = $(window).height();
    var c = $('div[class="ui-content"]');
    var c_h = c.height();
    var c_oh = c.outerHeight(true);
    var c_new = w - h - f - c_oh + c_h;
    var total = h + f + c_oh;
    if (c_h < c.get(0).scrollHeight) {
        c.height(c.get(0).scrollHeight);
    } else {
        c.height(c_new);
    }
}

function map() {
    var latlng = new google.maps.LatLng(6.91, 79.97);
    var myOptions = {
        zoom: 15,
        center: latlng,
        streetViewControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
        watchID = navigator.geolocation.watchPosition(gotPosition, null, {maximumAge: 5000, timeout: 60000, enableHighAccuracy: true});
    });
}

function gotPosition(position) {
    map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

    var point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if (!marker) {
        //create marker
        marker = new google.maps.Marker({
            position: point,
            map: map
        });
    } else {
        //move marker to new position
        marker.setPosition(point);
    }
}
