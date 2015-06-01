

//--------------------------------------------------------------------------------------
//--------------------------------------- Don't change these properties ---------------------------------------
//--------------------------------------------------------------------------------------

var _divMessageContainer;   // For message display

//--------------------------------------------------------------------------------------
//--------------------------- Default value provided. User can change it accordingly -----------------
//--------------------------------------------------------------------------------------
var _bDiscardBlankImage = false;  // User can change it.
var _divDWTSourceContainerID = 'source';     // The ID of the container (Usually <select>) which is used to show the available sources. User must specify it.
var _txtFileName;
//--------------------------------------------------------------------------------------
//--------------------------- User must specify it before using DWT --------------------
//--------------------------------------------------------------------------------------

var _strDefaultSaveImageName = 'WebTWAINImage';
var _strNoDrivers = 'No TWAIN compatible drivers detected:';

var _strMSIPath = Dynamsoft.Lib.product._strMSIPath;
var _strPKGPath = Dynamsoft.Lib.product._strPKGPath;
var _strProductName = Dynamsoft.Lib.product.name;
var _strChromeEditionPath = Dynamsoft.Lib.product._strChromeEditionPath;

var _iHowManyImages = 0;
var _iErrorCode = 0;
var _strErrorString = '';

var _strPort = location.port == '' ? 80 : location.port; //Demo: 80;

//------------------------------------------------------------------------------------------
//------------------------------ Dynamsoft DWT Events Start --------------------------------
//------------------------------------------------------------------------------------------
var DWObject;

function Dynamsoft_OnPostAllTransfers() {
	DWObject.CloseSource();
	
	if (_iErrorCode != DWObject.ErrorCode)
        _iErrorCode = DWObject.ErrorCode;

    if (_strErrorString != DWObject.ErrorString)
        _strErrorString = DWObject.ErrorString;
		
    if (DWObject.HowManyImagesInBuffer > _iHowManyImages) {
        _iErrorCode = 0;
        _strErrorString = 'Successful.';
    }
    else if (DWObject.HowManyImagesInBuffer == _iHowManyImages) {
        if (_iErrorCode != 0) {
        }
    }

    _iHowManyImages = DWObject.HowManyImagesInBuffer;
    if (_bDiscardBlankImage) {
        var NewlyScannedImage = DWObject.CurrentImageIndexInBuffer;
        if (DWObject.IsBlankImage(NewlyScannedImage)) {
            DWObject.RemoveImage(NewlyScannedImage);
        
        g_DWT_PrintMsg('<b>Blank Discard (On PostTransfer): </b>');
    }

        if (checkErrorString()) {
            updatePageInfo();
        }
    }	
	
    updatePageInfo();
    checkErrorString();
}

function Dynamsoft_OnMouseClick(index) {
    updatePageInfo();
}


function Dynamsoft_OnTopImageInTheViewChanged(index) {
    DWObject.CurrentImageIndexInBuffer = index;
    updatePageInfo();
}


// Dynamsoft_OnLoad event before using DWT 
function Dynamsoft_OnLoad() {
    getEnvironment();
	
    InitMessageBody();
    initMessageBox();  		//Messagebox
    initCustomScan();       //CustomScan

    initiateInputs();
	
}

// Dynamsoft_OnReady event
function Dynamsoft_OnReady() {
	if (_divDWTSourceContainerID == '')
	    return;
		
	// Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
    DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer'); 
	
	var i, iSourceCount = DWObject.SourceCount, 
		buttonScan = document.getElementById('btnScan'), 
		oSourceContainer = document.getElementById(_divDWTSourceContainerID);
	
	DWObject.Loglevel = 1;
	DWObject.BrokerProcessType = 1;
	DWObject.IfAllowLocalCache = true;

	if (!Dynamsoft.Lib.product.bChromeEdition) {
	    DWObject.AllowPluginAuthentication = true;

	    if (Dynamsoft.Lib.env.bWin)
	        DWObject.MouseShape = false;
	}


	oSourceContainer.options.length = 0;
	if (oSourceContainer && iSourceCount > 0) {
	    defaultSource = DWObject.DefaultSourceName;
	    for (i = 0; i < iSourceCount; i++) {
	        sn = DWObject.GetSourceNameItems(i);
	        oSourceContainer.options.add(new Option(sn, i));
	        if (sn == defaultSource) {
	            oSourceContainer.selectedIndex = i;
	        }
	    }
	}	
	
	if (iSourceCount == 0) {
		buttonScan.disabled = true;
		
		var liNoScanner = document.getElementById('pNoScanner');
		if (Dynamsoft.Lib.env.bWin) {
			Dynamsoft.Lib.show(liNoScanner);
			liNoScanner.style.textAlign = 'center';
		}
		else{
			Dynamsoft.Lib.hide(liNoScanner);
		}
	} else {
		buttonScan.disabled = false;
		buttonScan.style.color = '#FE8E14';
	
		source_onchange();
	}

	if (!Dynamsoft.Lib.env.bWin && DWObject.ImageCaptureDriverType != 0) {
		Dynamsoft.Lib.hide('lblShowUI');
		Dynamsoft.Lib.hide('ShowUI');
	}
	else {
		Dynamsoft.Lib.show('lblShowUI');
		Dynamsoft.Lib.show('ShowUI');
	}

	setDefaultValue();

	re = /^\d+$/;
	strre = /^[\s\w]+$/;
	refloat = /^\d+\.*\d*$/i;


	if (Dynamsoft.Lib.env.bWin) {
		for (var i = 0; i < document.links.length; i++) {
			if (document.links[i].className == "ShowtblLoadImage") {
				document.links[i].onclick = showtblLoadImage_onclick;
			}
			if (document.links[i].className == "ClosetblLoadImage") {
				document.links[i].onclick = closetblLoadImage_onclick;
			}
		}
		if (iSourceCount == 0) {
			showtblLoadImage_onclick();
		}
	}
	
	if (iSourceCount > 0) {
		Dynamsoft.Lib.hide('divBlank');
	}

	g_OnRefreshUI(-1, 0);
	ua = (navigator.userAgent.toLowerCase());
	if (!ua.indexOf('msie 6.0')) {
		ShowSiteTour();
	}	
}


//------------------------------------------------------------------------------------------
//--------------------------- Dynamsoft DWT Events End ------------------------------------
//------------------------------------------------------------------------------------------

function InitMessageBody() {

}

function g_OnRefreshUI(currentIndex, maxIndex){
	if(currentIndex !== undefined)
		document.getElementById('DW_CurrentImage').value = currentIndex + 1;
	
	if(maxIndex !== undefined)
		document.getElementById('DW_TotalImage').value = maxIndex;

}

function getEnvironment() {

}

function initCustomScan() {
    var ObjString = ['<ul id="divTwainType" style="height:70px; background:#f0f0f0;"> ',
    '<li style="padding-left:12px;">',
    '<label id="lblShowUI" for="ShowUI"><input type="checkbox" id="ShowUI" />Show UI&nbsp;</label>',
    '<label for="ADF"><input type="checkbox" id="ADF" />AutoFeeder&nbsp;</label>',
    '<label for="Duplex"><input type="checkbox" id="Duplex"/>Duplex</label></li>',
    '<li style="padding-left:15px;">Pixel Type:',
    '<label for="BW"><input type="radio" id="BW" name="PixelType"/>B&amp;W </label>',
    '<label for="Gray"><input type="radio" id="Gray" name="PixelType"/>Gray</label>',
    '<label for="RGB"><input type="radio" id="RGB" name="PixelType"/>Color</label></li>',
    '<li style="padding-left:15px;">',
    '<label for="Resolution">Resolution:<select size="1" id="Resolution"><option value=""></option></select></label></li>',
    '</ul>'];
	
    document.getElementById('divProductDetail').innerHTML = ObjString.join('');

    var vResolution = document.getElementById('Resolution');
    vResolution.options.length = 0;
    vResolution.options.add(new Option('100', 100));
    vResolution.options.add(new Option('150', 150));
    vResolution.options.add(new Option('200', 200));
    vResolution.options.add(new Option('300', 300));

	document.getElementById("btnScan").disabled = true;
}

function initiateInputs() {

    var allinputs = document.getElementsByTagName('input');
    for (var i = 0; i < allinputs.length; i++) {
        if (allinputs[i].type == 'checkbox') {
            allinputs[i].checked = false;
        }
        else if (allinputs[i].type == 'text') {
            allinputs[i].value = '';
        }
    }


	if (Dynamsoft.Lib.env.bWin64) {
		Dynamsoft.Lib.hide('samplesource32bit');
		Dynamsoft.Lib.show('samplesource64bit');
	} 

	if(!Dynamsoft.Lib.env.bWin){

		Dynamsoft.Lib.hide('samplesource32bit');
		
        //document.getElementById("btnEditor").style.display = "none";
        Dynamsoft.Lib.hide('notformac1');
	}
	

}

function initMessageBox() {
    var objString = [

    // The container for navigator, view mode and remove button
    '<div style="text-align:center; margin-top:5px; background-color:#FFFFFF;display:block">',
    '<div id="DW_divPreviewMode" style="background:white; width:150px; height:35px;z-index:2;float:right;text-align:right">Preview Mode: ',
    '<select size="1" id="DW_PreviewMode" onchange ="setlPreviewMode();">',
    '    <option value="0">1X1</option>',
    '</select></div>',	
    '<div style="background:white; height:35px; z-index:2;">',
    '<input id="DW_btnFirstImage" onclick="btnFirstImage_onclick()" type="button" value=" |&lt; "/>&nbsp;',
    '<input id="DW_btnPreImage" onclick="btnPreImage_onclick()" type="button" value=" &lt; "/>&nbsp;&nbsp;',
    '<input type="text" size="2" id="DW_CurrentImage" readonly="readonly"/>/',
    '<input type="text" size="2" id="DW_TotalImage" readonly="readonly"/>&nbsp;&nbsp;',
    '<input id="DW_btnNextImage" onclick="btnNextImage_onclick()" type="button" value=" &gt; "/>&nbsp;',
    '<input id="DW_btnLastImage" onclick="btnLastImage_onclick()" type="button" value=" &gt;| "/></div>',

    '<div><input id="DW_btnRemoveCurrentImage" onclick="btnRemoveCurrentImage_onclick()" type="button" value="Remove Selected Images"/>',
	'<input id="DW_btnRemoveAllImages" onclick="btnRemoveAllImages_onclick()" type="button" value="Remove All Images"/>',
	'</div>',
    '</div>',

    // The container for the error message
    '<div id="DWTdivMsg" style="width:570px;display:inline">',
    'Message:<br />',
    '<div id="DWTemessage" style="height:100px; overflow:scroll; background-color:#ffffff; border:1px #303030; border-style:solid; text-align:left; position:relative" >',
    '</div></div>'];

    var DWTemessageContainer = document.getElementById('DWTemessageContainer');
    DWTemessageContainer.innerHTML = objString.join('');

    // Fill the init data for preview mode selection
    var varPreviewMode = document.getElementById('DW_PreviewMode');
    varPreviewMode.options.length = 0;
	
	varPreviewMode.options.add(new Option('1X1', 0));
	varPreviewMode.options.add(new Option('2X2', 1));
	varPreviewMode.options.add(new Option('3X3', 2));
	varPreviewMode.options.add(new Option('4X4', 3));
	varPreviewMode.options.add(new Option('5X5', 4));
	varPreviewMode.selectedIndex = 0;


    _divMessageContainer = document.getElementById('DWTemessage');
    _divMessageContainer.ondblclick = function() {
        this.innerHTML = '';
        Dynamsoft.Lib.clearMessage();
    }

}

function setDefaultValue() {
    document.getElementById('Gray').checked = true;
 
    var varImgTypejpeg2 = document.getElementById('imgTypejpeg2');
    if (varImgTypejpeg2)
        varImgTypejpeg2.checked = true;
    var varImgTypejpeg = document.getElementById('imgTypejpeg');
    if (varImgTypejpeg)
        varImgTypejpeg.checked = true;

    _txtFileName = document.getElementById('txt_fileName');
    _txtFileName.value = _strDefaultSaveImageName;

}



// Check if the control is fully loaded.

function showtblLoadImage_onclick() {
	Dynamsoft.Lib.show('tblLoadImage');
	Dynamsoft.Lib.hide('Resolution');
	
    return false;
}
function closetblLoadImage_onclick() {
	Dynamsoft.Lib.hide('tblLoadImage');
	Dynamsoft.Lib.show('Resolution');
    return false;
}

//--------------------------------------------------------------------------------------
//--------------------------------------- Used a lot ---------------------------------------
//--------------------------------------------------------------------------------------
function updatePageInfo() {
	g_OnRefreshUI(DWObject.CurrentImageIndexInBuffer, DWObject.HowManyImagesInBuffer);

}

var global_msg = [];
function g_OnPrintMsg(){
    if (_divMessageContainer) {
		_divMessageContainer.innerHTML = global_msg.join('');
        _divMessageContainer.scrollTop = _divMessageContainer.scrollHeight;
    }
}

function g_DWT_PrintMsg(msg){

	var str = [msg, '<br />'].join('');
	global_msg.push(str);
	g_OnPrintMsg();
}

function printResult(){
	var ret = DWObject.checkErrorString();
	g_OnPrintMsg();	
	return ret;
}

function checkIfImagesInBuffer() {
    if (DWObject.HowManyImagesInBuffer == 0) {
        g_DWT_PrintMsg('There is no image in buffer.')
        return false;
    }
    else
        return true;
}

function checkErrorString() {
    if (DWObject.ErrorCode == 0) {
        g_DWT_PrintMsg("<span style='color:#cE5E04'><b>" + DWObject.ErrorString + "</b></span>");

        return true;
    }
    if (DWObject.ErrorCode == -2115) //Cancel file dialog
        return true;
    else {
        if (DWObject.ErrorCode == -2003) {
            var ErrorMessageWin = window.open("", "ErrorMessage", "height=500,width=750,top=0,left=0,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");
            ErrorMessageWin.document.writeln(DWObject.HTTPPostResponseString);
        }
        g_DWT_PrintMsg("<span style='color:#cE5E04'><b>" + DWObject.ErrorString + "</b></span>");
        return false;
    }
}

//--------------------------------------------------------------------------------------
//--------------------------------------- Used a lot -----------------------------------
//--------------------------------------------------------------------------------------
function ds_getleft(el) {
	if(!el){
		return 0;
	}

    var tmp = el.offsetLeft;
    el = el.offsetParent
    while (el) {
        tmp += el.offsetLeft;
        el = el.offsetParent;
    }
    return tmp;
}
function ds_gettop(el) {
	if(!el){
		return 0;
	}
	
    var tmp = el.offsetTop;
    el = el.offsetParent
    while (el) {
        tmp += el.offsetTop;
        el = el.offsetParent;
    }
    return tmp;
}

function Over_Out_DemoImage(obj, url) {
    obj.src = url;
}

function NavigateImages(e) {
	if(DWObject){
		var evt = window.event || e,
			delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
		if (delta < 0)
			btnNextImage_wheel();
		else if (delta > 0)
			btnPreImage_wheel();
	}
}

function Dynamsoft_OnAfterOperate()
{}

function Dynamsoft_OnBeforeOperate()
{}

function Dynamsoft_OnPreAllTransfers()
{}

function Dynamsoft_OnPreTransfer()
{}

function Dynamsoft_OnPostTransfer()
{}
   
function Dynamsoft_OnOperateStatus()
{}

function Dynamsoft_OnBitmapChanged()
{}
  
function Dynamsoft_OnMouseMove()
{}
  
function Dynamsoft_OnMouseDoubleClick()
{}
  
function Dynamsoft_OnMouseRightClick()
{}
  
function Dynamsoft_OnGetFilePath()
{}

function Dynamsoft_OnPrintMsg()
{}

function Dynamsoft_OnSourceUIClose()
{ }
