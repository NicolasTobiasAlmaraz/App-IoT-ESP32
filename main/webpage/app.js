/**
 * Add gobals here
 */
var seconds 	= null;
var otaTimerVar =  null;
var wifiConnectInterval =  null;

/**
 * Initialize functions here.
 */
$(document).ready(function(){
	getUpdateStatus();
    startSensorInterval();
	$("#connect_wifi").on("click", function(){
        checkCredentials();
    })
});   

/**
 * Gets file name and size for display on the web page.
 */        
function getFileInfo() 
{
    var x = document.getElementById("selected_file");
    var file = x.files[0];

    document.getElementById("file_info").innerHTML = "<h4>File: " + file.name + "<br>" + "Size: " + file.size + " bytes</h4>";
}

/**
 * Handles the firmware update.
 */
function updateFirmware() 
{
    // Form Data
    var formData = new FormData();
    var fileSelect = document.getElementById("selected_file");
    
    if (fileSelect.files && fileSelect.files.length == 1) 
	{
        var file = fileSelect.files[0];
        formData.set("file", file, file.name);
        document.getElementById("ota_update_status").innerHTML = "Uploading " + file.name + ", Firmware Update in Progress...";

        // Http Request
        var request = new XMLHttpRequest();

        request.upload.addEventListener("progress", updateProgress);
        request.open('POST', "/OTAupdate");
        request.responseType = "blob";
        request.send(formData);
    } 
	else 
	{
        window.alert('Select A File First')
    }
}

/**
 * Progress on transfers from the server to the client (downloads).
 */
function updateProgress(oEvent) 
{
    if (oEvent.lengthComputable) 
	{
        getUpdateStatus();
    } 
	else 
	{
        window.alert('total size is unknown')
    }
}

/**
 * Posts the firmware udpate status.
 */
function getUpdateStatus() 
{
    var xhr = new XMLHttpRequest();
    var requestURL = "/OTAstatus";
    xhr.open('POST', requestURL, false);
    xhr.send('ota_update_status');

    if (xhr.readyState == 4 && xhr.status == 200) 
	{		
        var response = JSON.parse(xhr.responseText);
						
	 	document.getElementById("latest_firmware").innerHTML = response.compile_date + " - " + response.compile_time

		// If flashing was complete it will return a 1, else -1
		// A return of 0 is just for information on the Latest Firmware request
        if (response.ota_update_status == 1) 
		{
    		// Set the countdown timer time
            seconds = 10;
            // Start the countdown timer
            otaRebootTimer();
        } 
        else if (response.ota_update_status == -1)
		{
            document.getElementById("ota_update_status").innerHTML = "!!! Upload Error !!!";
        }
    }
}

/**
 * Displays the reboot countdown.
 */
function otaRebootTimer() 
{	
    document.getElementById("ota_update_status").innerHTML = "OTA Firmware Update Complete. This page will close shortly, Rebooting in: " + seconds;

    if (--seconds == 0) 
	{
        clearTimeout(otaTimerVar);
        window.location.reload();
    } 
	else 
	{
        otaTimerVar = setTimeout(otaRebootTimer, 1000);
    }
}

/**
 * Tomar la temperatura del sensor DS18B20 para luego mostrar en la web page
 */
function getSensorValue() {
    $.getJSON('/sensor.json', function(data) {
        $("#temperature_reading").text(data["temp"]);
    });
}

/**
 * Timer para pedir data cada 5 seg
 */
function startSensorInterval() {
    setInterval(getSensorValue, 5000);
}

/**
 * Clears the connection status interval
 */
function stopWifiConnectStatusInterval() {
    if(wifiConnectInterval != null) {
        clearInterval(wifiConnectInterval);
        wifiConnectInterval = null;
    }
}

/**
 * Gets te wifi connection status (callback)
 */
function getWifiConnectStatus() {
    //Le pide al mcu que reporte el estado
    var xhr = new XMLHttpRequest();
    var requestURL = "/wifiConnectStatus";

    xhr.open('POST', requestURL, false);
    xhr.send('wifi_connect_status');
    
    /**
     * Status
     * Informational responses (100 – 199)
     * Successful responses (200 – 299) -> 200: SUCCESS
     * Redirection messages (300 – 399)
     * Client error responses (400 – 499)
     * Server error responses (500 – 599)
     */

    /**
     * readyState
     * 0 UNSENT
     * 1 OPENED
     * 2 HEADERS_RECEIVED
     * 3 LOADING
     * 4 DONE
     */

    if(xhr.readyState == 4 && xhr.status == 200) {
		var response = JSON.parse(xhr.responseText);
		
		document.getElementById("wifi_connect_status").innerHTML = "Connecting...";
		
		if (response.wifi_connect_status == 3)
		{
			document.getElementById("wifi_connect_status").innerHTML = "<h4 class='rd'>Failed to Connect. Please check your AP credentials and compatibility</h4>";
			stopWifiConnectStatusInterval();
		}
		else if (response.wifi_connect_status == 2)
		{
			document.getElementById("wifi_connect_status").innerHTML = "<h4 class='gr'>Connection Success!</h4>";
			stopWifiConnectStatusInterval();
		}
	}

}

/**
 * Starts the interval for checking the connection status (timer init)
 */
function startWifiConnectStatusInterval() {
    wifiConnectInterval = setInterval(getWifiConnectStatus,2800);
}

/**
 * Connect WiFi function called using the SSID and psw entered into the text fields
 */
function connectWifi() {
    //Get data
    ssid = $("#connect_ssid").val();
    pass = $("#connect_pass").val();
    
    //Send data to the uC
    $.ajax({
		url: '/wifiConnect.json',
		dataType: 'json',
		method: 'POST',
		cache: false,
		headers: {'my-connect-ssid': ssid, 'my-connect-pwd': pass},
		data: {'timestamp': Date.now()}
	});

    //Init timer to check the connection proc 
    startWifiConnectStatusInterval();
}

/**
 * Checks credentials on connect wifi button click:
 * Check ssid and psw are not empty
 */

function checkCredentials() {
    errorList = "";
    creedsOk = true;
    
    //Get data
    ssid = $("#connect_ssid").val();
    pass = $("#connect_pass").val();
    
    //Check data
    if(ssid == "") {
        errorList += "<h4 class='rd'>SSID cannot be empty!</h4>"
        creedsOk = false;
    }

    if(pass == "") {
        errorList += "<h4 class='rd'>Password cannot be empty!</h4>"
        creedsOk = false;
    }

    //Tomo accion
    if(creedsOk == false) {
        $("#wifi_connect_credentials_errors").html(errorList);
    }
    else {
        $("#wifi_connect_credentials_errors").html("");
        connectWifi();
    }
}

/**
 * Shows the WiFi password if the box is checked
 */
function showPassword() {
    var x = document.getElementById("connect_pass");
    if(x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}