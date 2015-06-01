//--------------------------------------------------------------------------------------
//************************** Import Image*****************************
//--------------------------------------------------------------------------------------
/*-----------------select source---------------------*/

var _last_selected_index = -1;

function source_onchange() {
    if (document.getElementById("divTwainType"))
        document.getElementById("divTwainType").style.display = '';
		
    if (document.getElementById("btnScan"))
		document.getElementById("btnScan").value = 'Scan';
			
	if (document.getElementById(_divDWTSourceContainerID)){
		_last_selected_index = document.getElementById(_divDWTSourceContainerID).selectedIndex;
	}

}


/*-----------------Acquire Image---------------------*/
function acquireImage() {
    if (_last_selected_index === -1){
		_last_selected_index = document.getElementById(_divDWTSourceContainerID).selectedIndex;
	}
    DWObject.OpenSource();
	
	DWObject.SelectSourceByIndex = _last_selected_index;
    DWObject.IfShowUI = document.getElementById("ShowUI").checked;

    for (var i = 0; i < 3; i++) {
        if (document.getElementsByName("PixelType").item(i).checked === true){
            DWObject.PixelType = i;
			break;
		}
    }
    DWObject.Resolution = document.getElementById("Resolution").value;
    DWObject.IfFeederEnabled = document.getElementById("ADF").checked;
    DWObject.IfDuplexEnabled = document.getElementById("Duplex").checked;

    DWObject.IfDisableSourceAfterAcquire = true;
    DWObject.AcquireImage();
}
/*-----------------Load Image---------------------*/
function btnLoad_onclick() {
    // _iHowManyImages = DWObject.HowManyImagesInBuffer;
    DWObject.IfShowFileDialog = true;
    DWObject.LoadImageEx("", 5, function(){
		g_DWT_PrintMsg("Loaded an image successfully.");
	}, function(){
	});

	/*
	
        if (_iHowManyImages < DWObject.HowManyImagesInBuffer)
        else {
            _iErrorCode = 1;
            _strErrorString = "Error loading the image.";
        }
	*/
}
function loadSampleImage(nIndex) {
    var ImgArr;

    switch (nIndex) {
        case 1:
            ImgArr = '/images/twain_associate1.png';
            break;
        case 2:
            ImgArr = '/images/twain_associate2.png';
            break;
        case 3:
            ImgArr = '/images/twain_associate3.png';
            break;
    }

    if (location.hostname != '') {

        DWObject.IfSSL = Dynamsoft.Lib.detect.ssl;
        if (Dynamsoft.Lib.detect.ssl == true)
            _strPort = location.port == "" ? 443 : location.port;
        else
            _strPort = location.port == "" ? 80 : location.port;
        DWObject.HTTPPort = _strPort;
        
		DWObject.HTTPDownload(location.hostname, Dynamsoft.Lib.getRealPath(ImgArr), function(){
			g_DWT_PrintMsg('Loaded a demo image successfully. (Http Download)');
			updatePageInfo();

		}, function(){
			checkErrorString();
		});
    }
    else {
        DWObject.IfShowFileDialog = false;
        DWObject.LoadImage(Dynamsoft.Lib.getRealPath(ImgArr), function(){
			DWObject.IfShowFileDialog = true;

			g_DWT_PrintMsg('Loaded a demo image successfully.');
			updatePageInfo();

		}, function(){
			DWObject.IfShowFileDialog = true;
			checkErrorString();
		});
    }
    
}

//--------------------------------------------------------------------------------------
//************************** Edit Image ******************************

//--------------------------------------------------------------------------------------
function btnShowImageEditor_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.ShowImageEditor();
    
}

function btnRotateRight_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.RotateRight(DWObject.CurrentImageIndexInBuffer);

    g_DWT_PrintMsg('<b>Rotate right: </b>');
    if (checkErrorString()) {
        return;
    }
}
function btnRotateLeft_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.RotateLeft(DWObject.CurrentImageIndexInBuffer);

    g_DWT_PrintMsg('<b>Rotate left: </b>');
    if (checkErrorString()) {
        return;
    }
}

function btnRotate180_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.Rotate(DWObject.CurrentImageIndexInBuffer, 180, true);
    g_DWT_PrintMsg('<b>Rotate 180: </b>');
    if (checkErrorString()) {
        return;
    }
}

function btnMirror_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.Mirror(DWObject.CurrentImageIndexInBuffer);
    g_DWT_PrintMsg('<b>Mirror: </b>');
    if (checkErrorString()) {
        return;
    }
}
function btnFlip_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.Flip(DWObject.CurrentImageIndexInBuffer);
    g_DWT_PrintMsg('<b>Flip: </b>');
    if (checkErrorString()) {
        return;
    }
}

function btnCancelChange_onclick() {
    Dynamsoft.Lib.hide('D_ImgSizeEditor');
}

function btnChangeImageSizeOK_onclick() {
    document.getElementById("img_height").className = "";
    document.getElementById("img_width").className = "";
    if (!re.test(document.getElementById("img_height").value)) {
        document.getElementById("img_height").className += " invalid";
        document.getElementById("img_height").focus();
        g_DWT_PrintMsg("Please input a valid <b>height</b>.");
        return;
    }
    if (!re.test(document.getElementById("img_width").value)) {
        document.getElementById("img_width").className += " invalid";
        document.getElementById("img_width").focus();
        g_DWT_PrintMsg("Please input a valid <b>width</b>.");
        return;
    }
    DWObject.ChangeImageSize(
        DWObject.CurrentImageIndexInBuffer,
        document.getElementById("img_width").value,
        document.getElementById("img_height").value,
        document.getElementById("InterpolationMethod").selectedIndex + 1
    );
    g_DWT_PrintMsg('<b>Change Image Size: </b>');
    if (checkErrorString()) {
        Dynamsoft.Lib.hide('D_ImgSizeEditor');
        return;
    }
}

//--------------------------------------------------------------------------------------
//************************** Upload Image***********************************
//  Upload to Azure Cloud
//

var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	decode: function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));		 
	
		var bytes = (input.length/4) * 3;
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip
		
		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;
		
		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);
		
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));
	
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
	
			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}
	
		return uarray;	
	}
}


function uploadImageInner(blobSasUrl, fileDataAsArrayBuffer) {
    var ajaxRequest = new XMLHttpRequest();
    try {
        ajaxRequest.open('PUT', blobSasUrl, true);
		ajaxRequest.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        ajaxRequest.send(fileDataAsArrayBuffer);
		ajaxRequest.onreadystatechange = function() {
			if (ajaxRequest.readyState == 4) {
				g_DWT_PrintMsg('Upload image to azure server successfully.');
			}
		}
    }
    catch (e) {
        alert("can't upload the image to server.\n" + e.toString());
    }
}

function btnUploadAzure_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }

    _txtFileName.className = "";
    if (!strre.test(_txtFileName.value)) {
        _txtFileName.className += " invalid";
        _txtFileName.focus();
        appendMessage("Please input <b>file name</b>.<br />Currently only English names are allowed.<br />");
        return;
    }

    var uploadfilename = _txtFileName.value + '.pdf';

	// save as pdf
    DWObject.SelectedImagesCount = 1;
	DWObject.SetSelectedImageIndex(0, DWObject.CurrentImageIndexInBuffer);
	var size1 = DWObject.GetSelectedImagesSize(4);

	var strImg, aryImg, _uint8_STR, _bin_ARR, _blobImg;
	strImg = DWObject.SaveSelectedImagesToBase64Binary();

	// convert base64 to Uint8Array
	var bytes = (strImg.length/4) * 3;
	var ab = new ArrayBuffer(bytes);
	_uint8_STR = Base64Binary.decode(strImg, ab);

	// convert Uint8Array to blob
    _blobImg = new Blob([_uint8_STR]); 

	// upload to Azure server
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			uploadImageInner(xhr.responseText, _blobImg);
		}
	}
	var actionPageFullPath = 'SAS.aspx?imageName=' + uploadfilename;
	xhr.open('GET', actionPageFullPath, true);
	xhr.send();

}

//--------------------------------------------------------------------------------------
//************************** Navigator functions***********************************
//--------------------------------------------------------------------------------------

function btnPreImage_wheel() {
    if (DWObject.HowManyImagesInBuffer != 0)
        btnPreImage_onclick();
}

function btnNextImage_wheel() {
    if (DWObject.HowManyImagesInBuffer != 0)
        btnNextImage_onclick();
}

function btnFirstImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
	DWObject.first();
}

function btnPreImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    else if (DWObject.CurrentImageIndexInBuffer == 0) {
        return;
    }
	DWObject.previous();
}
function btnNextImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    else if (DWObject.CurrentImageIndexInBuffer == DWObject.HowManyImagesInBuffer - 1) {
        return;
    }
	DWObject.next();
}


function btnLastImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
	DWObject.last();
}

function btnRemoveCurrentImage_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    DWObject.RemoveAllSelectedImages();
    if (DWObject.HowManyImagesInBuffer == 0) {
        document.getElementById("DW_TotalImage").value = DWObject.HowManyImagesInBuffer;
        document.getElementById("DW_CurrentImage").value = "";
        return;
    }
    else {
        updatePageInfo();
    }
}


function btnRemoveAllImages_onclick() {
    if (!checkIfImagesInBuffer()) {
        return;
    }
    
	var varHowManyImagesInBuffer = DWObject.HowManyImagesInBuffer;
    DWObject.RemoveAllImages();
    document.getElementById("DW_TotalImage").value = '0';
    document.getElementById("DW_CurrentImage").value = '0';
}
function setlPreviewMode() {
    var varNum = parseInt(document.getElementById("DW_PreviewMode").selectedIndex + 1);
    var btnCrop = document.getElementById("btnCrop");
    if (btnCrop) {
        var tmpstr = btnCrop.src;
        if (varNum > 1) {
            tmpstr = tmpstr.replace('Crop.', 'Crop_grey.');
            btnCrop.src = tmpstr;
            btnCrop.onclick = function() { };
        }
        else {
            tmpstr = tmpstr.replace('Crop_grey.', 'Crop.');
            btnCrop.src = tmpstr;
            btnCrop.onclick = function() { btnCrop_onclick(); };
        }
    }
    DWObject.SetViewMode(varNum, varNum);
    if (Dynamsoft.Lib.env.bMac) {
        return;
    }
    else if (document.getElementById("DW_PreviewMode").selectedIndex != 0) {

		DWObject.MouseShape = true;
    }
    else {
		DWObject.MouseShape = false;
    }
}


