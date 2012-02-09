/* 
	This is a machine generated file, do not edit directly.  -jm
*/



﻿/*
 * Cordova is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 * Copyright (c) 2011, Microsoft Corporation
 */





/**
 * The order of events during page load and Cordova startup is as follows:
 *
 * onDOMContentLoaded         Internal event that is received when the web page is loaded and parsed.
 * window.onload              Body onload event.
 * onNativeReady              Internal event that indicates the Cordova native side is ready.
 * onCordovaInit             Internal event that kicks off creation of all Cordova JavaScript objects (runs constructors).
 * onCordovaReady            Internal event fired when all Cordova JavaScript objects have been created
 * onCordovaInfoReady        Internal event fired when device properties are available
 * onDeviceReady              User event fired to indicate that Cordova is ready
 * onResume                   User event fired to indicate a start/resume lifecycle event
 * onPause                    User event fired to indicate a pause lifecycle event
 * onDestroy                  Internal event fired when app is being destroyed (User should use window.onunload event, not this one).
 *
 * The only Cordova events that user code should register for are:
 *      onDeviceReady
 *      onResume
 *
 * Listeners can be registered as:
 *      document.addEventListener("deviceready", myDeviceReadyListener, false);
 *      document.addEventListener("resume", myResumeListener, false);
 *      document.addEventListener("pause", myPauseListener, false);
 */
 
 if (typeof(DeviceInfo) !== 'object') {
    var DeviceInfo = {};
}

var Cordova = {
	    queue: {
        ready: true,
        commands: [],
        timer: null
    },
	available:false,
	callbackId:0,
	callbacks:{},
	resources:{}
};

Cordova.callbackStatus = {
    NO_RESULT: 0,
    OK: 1,
    CLASS_NOT_FOUND_EXCEPTION: 2,
    ILLEGAL_ACCESS_EXCEPTION: 3,
    INSTANTIATION_EXCEPTION: 4,
    MALFORMED_URL_EXCEPTION: 5,
    IO_EXCEPTION: 6,
    INVALID_ACTION: 7,
    JSON_EXCEPTION: 8,
    ERROR: 9
};

/**
 * Determine if resource has been loaded by Cordova
 *
 * @param name
 * @return
 */
Cordova.hasResource = function(name) {
    return Cordova.resources[name];
};

/**
 * Add a resource to list of loaded resources by Cordova
 *
 * @param name
 */
Cordova.addResource = function(name) {
    Cordova.resources[name] = true;
};

Cordova.exec = function(success, fail, service, action, args)
{
	
	var callbackId = service + Cordova.callbackId++;
    if (typeof success == "function" || typeof fail == "function") 
	{
        Cordova.callbacks[callbackId] = {success:success, fail:fail};
    }

	 // generate a new command string, ex. DebugConsole/log/DebugConsole23/{"message":"wtf dude?"}
     var command = service + "/" + action + "/" + callbackId + "/" + JSON.stringify(args);
        // pass it on to Notify
     window.external.Notify(command);
};

CordovaCommandResult = function(status,callbackId,args,cast)
{
	if(status === "backbutton") {

		Cordova.fireEvent(document,"backbutton");
		return "true";

	} else if(status === "resume") {

		Cordova.onResume.fire();
		return "true";

	} else if(status === "pause") {

		Cordova.onPause.fire();
		return "true";	
	}
	
	var safeStatus = parseInt(status);
	if(safeStatus === Cordova.callbackStatus.NO_RESULT ||
	   safeStatus === Cordova.callbackStatus.OK) {
		Cordova.CallbackSuccess(callbackId,args,cast);
	}
	else
	{
		Cordova.CallbackError(callbackId,args,cast);
	}
};

/**
 * Called by native code when returning successful result from an action.
 *
 * @param callbackId
 * @param args
 * @param cast
 */
Cordova.CallbackSuccess = function(callbackId, args, cast) 
{

	var commandResult;
	try
	{
	    commandResult = JSON.parse(args);

	    if (typeof cast !== 'undefined') 
        {
	        eval('commandResult = ' + cast + '(commandResult);');
        }

	}
	catch(exception)
	{
		return exception.message;
    }
	
    if (Cordova.callbacks[callbackId] ) {

        // If result is to be sent to callback
        if (commandResult.status === Cordova.callbackStatus.OK) {
            try {
                if (Cordova.callbacks[callbackId].success) {
                    result = Cordova.callbacks[callbackId].success(commandResult.message);
                }
            }
            catch (e) {
                console.log("Error in success callback: "+callbackId+" = " + e.message);
            }
        }

        // Clear callback if not expecting any more results
        if (!commandResult.keepCallback) {
            delete Cordova.callbacks[callbackId];
        }
    }
	// Note that in WP7, this method can return a value to the native calling code
	return "";
};

/**
 * Called by native code when returning error result from an action.
 *
 * @param callbackId
 * @param args
 * @param cast - not supported
 */
Cordova.CallbackError = function (callbackId, args, cast) {
	
	var commandResult;
	try
	{
		commandResult  = JSON.parse(args);
	}
	catch(exception)
	{
		return exception.message;
	}
	
    if (Cordova.callbacks[callbackId]) {
        try {
            if (Cordova.callbacks[callbackId].fail) {
                Cordova.callbacks[callbackId].fail(commandResult.message);
            }
        }
        catch (e) {
            console.log("Error in error callback: "+callbackId+" = "+e);
        }

        // Clear callback if not expecting any more results
        if (!args.keepCallback) {
            delete Cordova.callbacks[callbackId];
        }
    }
};

/**
 * Create a UUID
 *
 * @return {String}
 */
Cordova.createUUID = function() {
    return Cordova.UUIDcreatePart(4) + '-' +
        Cordova.UUIDcreatePart(2) + '-' +
        Cordova.UUIDcreatePart(2) + '-' +
        Cordova.UUIDcreatePart(2) + '-' +
        Cordova.UUIDcreatePart(6);
};

Cordova.UUIDcreatePart = function(length) {
    var uuidpart = "";
    var i, uuidchar;
    for (i=0; i<length; i++) {
        uuidchar = parseInt((Math.random() * 256),0).toString(16);
        if (uuidchar.length === 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
};

/**
 * Does a deep clone of the object.
 *
 * @param obj
 * @return {Object}
 */
Cordova.clone = function(obj) {
    var i, retVal;
    if(!obj) { 
        return obj;
    }
    
    if(obj instanceof Array){
        retVal = [];
        for(i = 0; i < obj.length; ++i){
            retVal.push(Cordova.clone(obj[i]));
        }
        return retVal;
    }
    
    if (typeof obj === "function") {
        return obj;
    }
    
    if(!(obj instanceof Object)){
        return obj;
    }
    
    if (obj instanceof Date) {
        return obj;
    }
    
    retVal = {};
    for(i in obj){
        if(!(i in retVal) || retVal[i] !== obj[i]) {
            retVal[i] = Cordova.clone(obj[i]);
        }
    }
    return retVal;
};

/*Clones object, but catches exception*/
Cordova.safeClone = function(obj)
{
	try
	{
		return Cordova.clone(obj);
	}
	catch(e)
	{
		console.log("CloneError::" + e.message);
	}
	return null;
};


/**
 * Custom pub-sub channel that can have functions subscribed to it
 * @constructor
 */	
Cordova.Channel = function(type)
{
    this.type = type;
    this.handlers = {};
    this.guid = 0;
    this.fired = false;
    this.enabled = true;	
};

/**
 * Subscribes the given function to the channel. Any time that
 * Channel.fire is called so too will the function.
 * Optionally specify an execution context for the function
 * and a guid that can be used to stop subscribing to the channel.
 * Returns the guid.
 */
Cordova.Channel.prototype.subscribe = function(f, c, g) {
    // need a function to call
    if (f === null) { return; }

    var func = f;
    if (typeof c === "object" && typeof f === "function") { func = Cordova.close(c, f); }

    g = g || func.observer_guid || f.observer_guid || this.guid++;
    func.observer_guid = g;
    f.observer_guid = g;
    this.handlers[g] = func;
    return g;
};

/**
 * Like subscribe but the function is only called once and then it
 * auto-unsubscribes itself.
 */
Cordova.Channel.prototype.subscribeOnce = function(f, c) {
    var g = null;
    var _this = this;
    var m = function() {
        f.apply(c || null, arguments);
        _this.unsubscribe(g);
    };
    if (this.fired) {
        if (typeof c === "object" && typeof f === "function") { f = Cordova.close(c, f); }
        f.apply(this, this.fireArgs);
    } else {
        g = this.subscribe(m);
    }
    return g;
};

/**
 * Unsubscribes the function with the given guid from the channel.
 */
Cordova.Channel.prototype.unsubscribe = function(g) {
    if (typeof g === "function") { g = g.observer_guid; }
    this.handlers[g] = null;
    delete this.handlers[g];
};

/**
 * Calls all functions subscribed to this channel.
 */
Cordova.Channel.prototype.fire = function(e) {
    if (this.enabled) {
        var fail = false;
        var item, handler, rv;
        for (item in this.handlers) {
            if (this.handlers.hasOwnProperty(item)) {
                handler = this.handlers[item];
                if (typeof handler === "function") {
                    rv = (handler.apply(this, arguments) === false);
                    fail = fail || rv;
                }
            }
        }
        this.fired = true;
        this.fireArgs = arguments;
        return !fail;
    }
    return true;
};

/**
 * Calls the provided function only after all of the channels specified
 * have been fired.
 */
Cordova.Channel.join = function(h, c) {
    var i = c.length;
    var f = function() {
        if (!(--i)) {
            h();
        }
    };
    var len = i;
    var j;
    for (j=0; j<len; j++) {
        if (!c[j].fired) {
            c[j].subscribeOnce(f);
        }
        else {
            i--;
        }
    }
    if (!i) {
        h();
    }
};

/**
 * Boolean flag indicating if the Cordova API is available and initialized.
 */ // TODO: Remove this, it is unused here ... -jm
Cordova.available = DeviceInfo.uuid !== undefined;

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once Cordova has been initialized.
 * @param {Function} func The function callback you want run once Cordova is initialized
 */
Cordova.addConstructor = function(func) 
{
    Cordova.onCordovaInit.subscribeOnce(function() {
        try {
            func();
        } catch(e) {
            console.log("Failed to run constructor: " + e);
        }
    });
};

/**
 * Plugins object
 */
if (!window.plugins) {
    window.plugins = {};
};

/**
 * Adds a plugin object to window.plugins.
 * The plugin is accessed using window.plugins.<name>
 *
 * @param name          The plugin name
 * @param obj           The plugin object
 */
Cordova.addPlugin = function(name, obj) {
    if (!window.plugins[name]) {
        window.plugins[name] = obj;
    }
    else {
        console.log("Error: Plugin "+name+" already exists.");
    }
};

/**
 * onDOMContentLoaded channel is fired when the DOM content
 * of the page has been parsed.
 */
Cordova.onDOMContentLoaded = new Cordova.Channel('onDOMContentLoaded');

/**
 * onNativeReady channel is fired when the Cordova native code
 * has been initialized.
 */
Cordova.onNativeReady = new Cordova.Channel('onNativeReady');

/**
 * onCordovaInit channel is fired when the web page is fully loaded and
 * Cordova native code has been initialized.
 */
Cordova.onCordovaInit = new Cordova.Channel('onCordovaInit');

/**
 * onCordovaReady channel is fired when the JS Cordova objects have been created.
 */
Cordova.onCordovaReady = new Cordova.Channel('onCordovaReady');

/**
 * onCordovaInfoReady channel is fired when the Cordova device properties
 * has been set.
 */
Cordova.onCordovaInfoReady = new Cordova.Channel('onCordovaInfoReady');

/**
 * onCordovaConnectionReady channel is fired when the Cordova connection properties
 * has been set.
 */
Cordova.onCordovaConnectionReady = new Cordova.Channel('onCordovaConnectionReady');

/**
 * onResume channel is fired when the Cordova native code
 * resumes.
 */
Cordova.onResume = new Cordova.Channel('onResume');

/**
 * onPause channel is fired when the Cordova native code
 * pauses.
 */
Cordova.onPause = new Cordova.Channel('onPause');

/**
 * onDestroy channel is fired when the Cordova native code
 * is destroyed.  It is used internally.
 * Window.onunload should be used by the user.
 */
Cordova.onDestroy = new Cordova.Channel('onDestroy');
Cordova.onDestroy.subscribeOnce(function() {
    Cordova.shuttingDown = true;
});
Cordova.shuttingDown = false;

// _nativeReady is global variable that the native side can set
// to signify that the native code is ready. It is a global since
// it may be called before any Cordova JS is ready.
if (typeof _nativeReady !== 'undefined') { Cordova.onNativeReady.fire(); }

/**
 * onDeviceReady is fired only after all Cordova objects are created and
 * the device properties are set.
 */
Cordova.onDeviceReady = new Cordova.Channel('onDeviceReady');


// Array of channels that must fire before "deviceready" is fired
Cordova.deviceReadyChannelsArray = [ Cordova.onCordovaReady, Cordova.onCordovaInfoReady, Cordova.onCordovaConnectionReady];

// Hashtable of user defined channels that must also fire before "deviceready" is fired
Cordova.deviceReadyChannelsMap = {};

/**
 * Indicate that a feature needs to be initialized before it is ready to be used.
 * This holds up Cordova's "deviceready" event until the feature has been initialized
 * and Cordova.initComplete(feature) is called.
 *
 * @param feature {String}     The unique feature name
 */
Cordova.waitForInitialization = function(feature) {
    if (feature) {
        var channel = new Cordova.Channel(feature);
        Cordova.deviceReadyChannelsMap[feature] = channel;
        Cordova.deviceReadyChannelsArray.push(channel);
    }
};

/**
 * Indicate that initialization code has completed and the feature is ready to be used.
 *
 * @param feature {String}     The unique feature name
 */
Cordova.initializationComplete = function(feature) {
    var channel = Cordova.deviceReadyChannelsMap[feature];
    if (channel) {
        channel.fire();
    }
};

/**
 * Create all Cordova objects once page has fully loaded and native side is ready.
 */
Cordova.Channel.join(
	function() 
	{
		
		setTimeout(function() 
		{
			
		    Cordova.UsePolling = false;
		    //Cordova.JSCallback();
		},1);
		
	    // Run Cordova constructors
	    Cordova.onCordovaInit.fire();
	
	    // Fire event to notify that all objects are created
	    Cordova.onCordovaReady.fire();
	
	    // Fire onDeviceReady event once all constructors have run and Cordova info has been
	    // received from native side, and any user defined initialization channels.
	    Cordova.Channel.join(function() {
	        Cordova.onDeviceReady.fire();
	
	        // Fire the onresume event, since first one happens before JavaScript is loaded
	        Cordova.onResume.fire();
	    }, Cordova.deviceReadyChannelsArray);
	
	}, 
	[ Cordova.onDOMContentLoaded ]);



// Listen for DOMContentLoaded and notify our channel subscribers
document.addEventListener('DOMContentLoaded', function() {
    Cordova.onDOMContentLoaded.fire();
}, false);

Cordova.m_document_addEventListener = document.addEventListener;
document.addEventListener = function(evt, handler, capture) 
{
	console.log("document.addEventListener event named " + evt);
	
    var e = evt.toLowerCase();
    if (e === 'deviceready') 
	{
		Cordova.onDeviceReady.subscribeOnce(handler);
	}
    else if (e === 'resume') 
	{
        Cordova.onResume.subscribe(handler);
        if (Cordova.onDeviceReady.fired) 
		{
			Cordova.onResume.fire();
		}
    } 
	else if (e === 'pause') 
	{
		Cordova.onPause.subscribe(handler);
	}
    else 
	{
		
        if (e === 'backbutton') 
		{
			Cordova.exec(null, null, "CoreEvents", "overrideBackbutton", [true]);
		}
        Cordova.m_document_addEventListener.call(document, evt, handler, capture);
    }
};

Cordova.m_document_removeEventListener = document.removeEventListener;
document.removeEventListener = function(evt, handler, capture) 
{
	console.log("document.removeEventListener event named " + evt);
	
    var e = evt.toLowerCase();
	
	if (e === 'backbutton') 
	{
		Cordova.exec(null, null, "CoreEvents", "overrideBackbutton", [false]);
	}
	Cordova.m_document_removeEventListener.call(document, evt, handler, capture);
	
}


Cordova.fireEvent = function(_targ,evtName)
{
    var target = _targ || window;
    var eventObj = document.createEvent('MouseEvents');
      	eventObj.initEvent( evtName, true, false );
	target.dispatchEvent( eventObj );
}
	

/*
 * Cordova is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 * Copyright (c) 2011, Microsoft Corporation
 */

if (!Cordova.hasResource("debugConsole")) {
Cordova.addResource("debugConsole");

var debugConsole = 
{
	log:function(msg){
		Cordova.exec(null,null,"DebugConsole","log",msg);
	},
	warn:function(msg){
		Cordova.exec(null,null,"DebugConsole","warn",msg);
	},
	error:function(msg){
		Cordova.exec(null,null,"DebugConsole","error",msg);
	}	
};


if(typeof window.console == "undefined")
{
	window.console = {
		log:function(str){
			if(navigator.debugConsole){
				navigator.debugConsole.log(str);
			}
			else
			{// In case log messages are received before device ready
				window.external.Notify("Info:" + str);
			}
		}
	};
}

// output any errors to console log, created above.
window.onerror=function(e)
{
	if(navigator.debugConsole)
	{
		navigator.debugConsole.error(JSON.stringify(e));
	}
	else
	{// In case errors occur before device ready
		window.external.Notify("Error:" + JSON.stringify(e));	
	}
};



Cordova.onCordovaInit.subscribeOnce(function() {
	navigator.debugConsole = debugConsole;
});

}

/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!Cordova.hasResource("device")) {
Cordova.addResource("device");

/**
 * This represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
var Device = function() {
    this.available = Cordova.available;
    this.platform = null;
    this.version = null;
    this.name = null;
    this.uuid = null;
    this.phonegap = null;

    var me = this;
    this.getInfo(
        function (res) {
            var info = JSON.parse(res);
            console.log("GotDeviceInfo :: " + info.version);
            me.available = true;
            me.platform = info.platform;
            me.version = info.version;
            me.name = info.name;
            me.uuid = info.uuid;
            me.phonegap = info.phonegap;

            Cordova.onCordovaInfoReady.fire();
        },
        function(e) {
            me.available = false;
            console.log("Error initializing Cordova: " + e);
        });
};

/**
 * Get device info
 *
 * @param {Function} successCallback The function to call when the heading data is available
 * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
 */
Device.prototype.getInfo = function(successCallback, errorCallback) {

    // successCallback required
    if (typeof successCallback !== "function") {
        console.log("Device Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback !== "function")) {
        console.log("Device Error: errorCallback is not a function");
        return;
    }

    // Get info
    Cordova.exec(successCallback, errorCallback, "Device", "Get");
};

Cordova.onCordovaInit.subscribeOnce(function() {
    if (typeof navigator.device === "undefined") {
        navigator.device = window.device = new Device();
    }
    });
}

﻿/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

// this is a WP7 Only implementation of the Storage API for use in webpages loaded from the local file system
// inside phonegap application.
// there is a native implementation which is backing this and providing the persistance of values.
// webpages loaded from a domain will not need to use this as IE9 has support for WebStorage
// Javascript Interface is as defined here : http://dev.w3.org/html5/webstorage/#storage-0
// 

if(!window.localStorage)
{(function()
{
    "use strict";

    var DOMStorage = function(type)
    {
        // default type is local
        if(type == "sessionStorage")
        {
            this._type = type;
        }
        Object.defineProperty( this, "length", 
        {
            configurable: true,
            get: function(){ return this.getLength() }
        });

    };

    DOMStorage.prototype = 
    {
        _type:"localStorage",
        _result:null,
        keys:null,
    
        onResult:function(key,valueStr)
        {
            if(!this.keys)
            {
                this.keys = [];
            }
            this._result = valueStr;
        },

        onKeysChanged:function(jsonKeys)
        {
            this.keys = JSON.parse(jsonKeys);

            var key;
            for(var n = 0,len =this.keys.length; n < len; n++)
            {
                key = this.keys[n];
                if(!this.hasOwnProperty(key))
                {
                    Object.defineProperty( this, key, 
                    {

                        configurable: true,
                        get: function(){ return this.getItem(key); },
                        set: function(val){ return this.setItem(key,val); }
                    });
                }
            }

        },

        initialize:function()
        {
            window.external.Notify("DOMStorage/" + this._type + "/load/keys");
        },

    /*
        The length attribute must return the number of key/value pairs currently present in the list associated with the object.
    */
        getLength:function()
        {
            if(!this.keys)
            {
                this.initialize();
            }
            return this.keys.length;
        },

    /*
        The key(n) method must return the name of the nth key in the list. 
        The order of keys is user-agent defined, but must be consistent within an object so long as the number of keys doesn't change. 
        (Thus, adding or removing a key may change the order of the keys, but merely changing the value of an existing key must not.) 
        If n is greater than or equal to the number of key/value pairs in the object, then this method must return null. 
    */
        key:function(n)
        {
            if(!this.keys)
            {
                this.initialize();
            }

            if(n >= this.keys.length)
            {
                return null;
            }
            else
            {
                return this.keys[n];
            }
        },

    /*
        The getItem(key) method must return the current value associated with the given key. 
        If the given key does not exist in the list associated with the object then this method must return null.
    */
        getItem:function(key)
        {
            if(!this.keys)
            {
                this.initialize();
            }

            var retVal = null;
            if(this.keys.indexOf(key) > -1)
            {
                window.external.Notify("DOMStorage/" + this._type + "/get/" + key);
                retVal = this._result;
                this._result = null;
            }
            return retVal;
        },
    /*
        The setItem(key, value) method must first check if a key/value pair with the given key already exists 
        in the list associated with the object.
        If it does not, then a new key/value pair must be added to the list, with the given key and with its value set to value.
        If the given key does exist in the list, then it must have its value updated to value.
        If it couldn't set the new value, the method must raise an QUOTA_EXCEEDED_ERR exception. 
        (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
    */
        setItem:function(key,value)
        {
            if(!this.keys)
            {
                this.initialize();
            }
            window.external.Notify("DOMStorage/" + this._type + "/set/" + key + "/" + value);
        },

    /*
        The removeItem(key) method must cause the key/value pair with the given key to be removed from the list 
        associated with the object, if it exists. 
        If no item with that key exists, the method must do nothing.
    */
        removeItem:function(key)
        {
            if(!this.keys)
            {
                this.initialize();
            }
            var index = this.keys.indexOf(key);
            if(index > -1)
            {
                this.keys.splice(index,1);
                // TODO: need sanity check for keys ? like 'clear','setItem', ...
                window.external.Notify("DOMStorage/" + this._type + "/remove/" + key);
                delete this[key];
            }
            
        },

    /*
        The clear() method must atomically cause the list associated with the object to be emptied of all 
        key/value pairs, if there are any. 
        If there are none, then the method must do nothing.
    */
        clear:function()
        {
            if(!this.keys)
            {
                this.initialize();
            }

            for(var n=0,len=this.keys.length; n < len;n++)
            {
                // TODO: do we need a sanity check for keys ? like 'clear','setItem', ...
                delete this[this.keys[n]];
            }
            this.keys = [];
            window.external.Notify("DOMStorage/" + this._type + "/clear/");
        }
    };

    // initialize DOMStorage
    
    Object.defineProperty( window, "localStorage", 
    {
        writable: false,
        configurable: false,
        value:new DOMStorage("localStorage")
    });
    window.localStorage.initialize();

    Object.defineProperty( window, "sessionStorage", 
    {
        writable: false,
        configurable: false,
        value:new DOMStorage("sessionStorage")
    });
    window.sessionStorage.initialize();


})();};


/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!Cordova.hasResource("file")) {
Cordova.addResource("file");

/**
 * Represents a single file.
 *
 * @constructor
 * @param name {DOMString} name of the file, without path information
 * @param fullPath {DOMString} the full path of the file, including the name
 * @param type {DOMString} mime type
 * @param lastModifiedDate {Date} last modified date
 * @param size {Number} size of the file in bytes
 */
var File = function(name, fullPath, type, lastModifiedDate, size) {
	this.name = name || null;
    this.fullPath = fullPath || null;
	this.type = type || null;
    this.lastModifiedDate = lastModifiedDate || null;
    this.size = size || 0;
};

/** @constructor */
var FileError = function() {
   this.code = null;
};

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by this specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

//-----------------------------------------------------------------------------
// File manager
//-----------------------------------------------------------------------------

/** @constructor */
var FileMgr = function() {
};

FileMgr.prototype.getFileBasePaths = function() {
};

FileMgr.prototype.testFileExists = function(fileName, successCallback, errorCallback) {
    return Cordova.exec(successCallback, errorCallback, "File", "testFileExists", {fileName: fileName});
};

FileMgr.prototype.testDirectoryExists = function(dirName, successCallback, errorCallback) {
    return Cordova.exec(successCallback, errorCallback, "File", "testDirectoryExists", {dirName: dirName});
};

FileMgr.prototype.getFreeDiskSpace = function(successCallback, errorCallback) {
    return Cordova.exec(successCallback, errorCallback, "File", "getFreeDiskSpace");
};

FileMgr.prototype.write = function(fileName, data, position, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "write", {fileName: fileName, data: data, position: position});
};

FileMgr.prototype.truncate = function(fileName, size, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "truncate", {fileName: fileName, size: size});
};

FileMgr.prototype.readAsText = function(fileName, encoding, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "readAsText", {fileName: fileName, encoding: encoding});
};

FileMgr.prototype.readAsDataURL = function(fileName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "readAsDataURL", {fileName: fileName});
};

Cordova.addConstructor(function() {
    if (typeof navigator.fileMgr === "undefined") {
        navigator.fileMgr = new FileMgr();
    }
});

//-----------------------------------------------------------------------------
// File Reader
//-----------------------------------------------------------------------------
// TODO: All other FileMgr function operate on the SD card as root.  However,
//       for FileReader & FileWriter the root is not SD card.  Should this be changed?

/**
 * This class reads the mobile device file system.
 *
 * For Android:
 *      The root directory is the root of the file system.
 *      To read from the SD card, the file name is "sdcard/my_file.txt"
 * @constructor
 */
var FileReader = function() {
    this.fileName = "";

    this.readyState = 0;

    // File data
    this.result = null;

    // Error
    this.error = null;

    // Event handlers
    this.onloadstart = null;    // When the read starts.
    this.onprogress = null;     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progess.loaded/progress.total)
    this.onload = null;         // When the read has successfully completed.
    this.onerror = null;        // When the read has failed (see errors).
    this.onloadend = null;      // When the request has completed (either in success or failure).
    this.onabort = null;        // When the read has been aborted. For instance, by invoking the abort() method.
};

// States
FileReader.EMPTY = 0;
FileReader.LOADING = 1;
FileReader.DONE = 2;

/**
 * Abort reading file.
 */
FileReader.prototype.abort = function() {
    var evt;
    this.readyState = FileReader.DONE;
    this.result = null;

    // set error
    var error = new FileError();
    error.code = error.ABORT_ERR;
    this.error = error;

    // If error callback
    if (typeof this.onerror === "function") {
        this.onerror({"type":"error", "target":this});
    }
    // If abort callback
    if (typeof this.onabort === "function") {
        this.onabort({"type":"abort", "target":this});
    }
    // If load end callback
    if (typeof this.onloadend === "function") {
        this.onloadend({"type":"loadend", "target":this});
    }
};

/**
 * Read text file.
 *
 * @param file          {File} File object containing file properties
 * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
 */
FileReader.prototype.readAsText = function(file, encoding) {
    this.fileName = "";
	if (typeof file.fullPath === "undefined") {
		this.fileName = file;
	} else {
		this.fileName = file.fullPath;
	}

    // LOADING state
    this.readyState = FileReader.LOADING;

    // If loadstart callback
    if (typeof this.onloadstart === "function") {
        this.onloadstart({"type":"loadstart", "target":this});
    }

    // Default encoding is UTF-8
    var enc = encoding ? encoding : "UTF-8";

    var me = this;

    // Read file
    navigator.fileMgr.readAsText(this.fileName, enc,

        // Success callback
        function(r) {
            var evt;

            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // Save result
            me.result = r;

            // If onload callback
            if (typeof me.onload === "function") {
                me.onload({"type":"load", "target":me});
            }

            // DONE state
            me.readyState = FileReader.DONE;

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend({"type":"loadend", "target":me});
            }
        },

        // Error callback
        function(e) {
            var evt;
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // Save error
		    me.error = e;

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror({"type":"error", "target":me});
            }

            // DONE state
            me.readyState = FileReader.DONE;

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend({"type":"loadend", "target":me});
            }
        }
        );
};


/**
 * Read file and return data as a base64 encoded data url.
 * A data url is of the form:
 *      data:[<mediatype>][;base64],<data>
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsDataURL = function(file) {
	this.fileName = "";
    if (typeof file.fullPath === "undefined") {
        this.fileName = file;
    } else {
        this.fileName = file.fullPath;
    }

    // LOADING state
    this.readyState = FileReader.LOADING;

    // If loadstart callback
    if (typeof this.onloadstart === "function") {
        this.onloadstart({"type":"loadstart", "target":this});
    }

    var me = this;

    // Read file
    navigator.fileMgr.readAsDataURL(this.fileName,

        // Success callback
        function(r) {
            var evt;

            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // Save result
            me.result = r;

            // If onload callback
            if (typeof me.onload === "function") {
                me.onload({"type":"load", "target":me});
            }

            // DONE state
            me.readyState = FileReader.DONE;

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend({"type":"loadend", "target":me});
            }
        },

        // Error callback
        function(e) {
            var evt;
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileReader.DONE) {
                return;
            }

            // Save error
            me.error = e;

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror({"type":"error", "target":me});
            }

            // DONE state
            me.readyState = FileReader.DONE;

            // If onloadend callback
            if (typeof me.onloadend === "function") {
                me.onloadend({"type":"loadend", "target":me});
            }
        }
        );
};

/**
 * Read file and return data as a binary data.
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsBinaryString = function(file) {
    // TODO - Can't return binary data to browser.
    this.fileName = file;
};

/**
 * Read file and return data as a binary data.
 *
 * @param file          {File} File object containing file properties
 */
FileReader.prototype.readAsArrayBuffer = function(file) {
    // TODO - Can't return binary data to browser.
    this.fileName = file;
};

//-----------------------------------------------------------------------------
// File Writer
//-----------------------------------------------------------------------------

/**
 * This class writes to the mobile device file system.
 *
 * For Android:
 *      The root directory is the root of the file system.
 *      To write to the SD card, the file name is "sdcard/my_file.txt"
 *
 * @constructor
 * @param file {File} File object containing file properties
 * @param append if true write to the end of the file, otherwise overwrite the file
 */
var FileWriter = function (file) {
    this.fileName = "";
    this.length = 0;
    if (file) {
        this.fileName = file.fullPath || file;
        this.length = file.size || 0;
    }
    // default is to write at the beginning of the file
    this.position = 0;

    this.readyState = 0; // EMPTY

    this.result = null;

    // Error
    this.error = null;

    // Event handlers
    this.onwritestart = null; // When writing starts
    this.onprogress = null; 	// While writing the file, and reporting partial file data
    this.onwrite = null; 	// When the write has successfully completed.
    this.onwriteend = null; 	// When the request has completed (either in success or failure).
    this.onabort = null; 	// When the write has been aborted. For instance, by invoking the abort() method.
    this.onerror = null; 	// When the write has failed (see errors).
};

// States
FileWriter.INIT = 0;
FileWriter.WRITING = 1;
FileWriter.DONE = 2;

/**
 * Abort writing file.
 */
FileWriter.prototype.abort = function() {
    // check for invalid state
	if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
		throw FileError.INVALID_STATE_ERR;
	}

    // set error
    var error = new FileError(), evt;
    error.code = error.ABORT_ERR;
    this.error = error;

    // If error callback
    if (typeof this.onerror === "function") {
        this.onerror({"type":"error", "target":this});
    }
    // If abort callback
    if (typeof this.onabort === "function") {
        this.onabort({"type":"abort", "target":this});
    }

    this.readyState = FileWriter.DONE;

    // If write end callback
    if (typeof this.onwriteend == "function") {
        this.onwriteend({"type":"writeend", "target":this});
    }
};

/**
 * Writes data to the file
 *
 * @param text to be written
 */
FileWriter.prototype.write = function (text) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw FileError.INVALID_STATE_ERR;
    }

    // WRITING state
    this.readyState = FileWriter.WRITING;

    var me = this;

    // If onwritestart callback
    if (typeof me.onwritestart === "function") {
        me.onwritestart({ "type": "writestart", "target": me });
    }

    // Write file
    navigator.fileMgr.write(this.fileName, text, this.position,

    // Success callback
        function (r) {
            var evt;
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // position always increases by bytes written because file would be extended
            me.position += r;
            // The length of the file is now where we are done writing.
            me.length = me.position;

            // If onwrite callback
            if (typeof me.onwrite === "function") {
                me.onwrite({ "type": "write", "target": me });
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend({ "type": "writeend", "target": me });
            }
        },

    // Error callback
        function (e) {
            var evt;

            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // Save error
            me.error = e;

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror({ "type": "error", "target": me });
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend({ "type": "writeend", "target": me });
            }
        }
        );

};

/**
 * Moves the file pointer to the location specified.
 *
 * If the offset is a negative number the position of the file
 * pointer is rewound.  If the offset is greater than the file
 * size the position is set to the end of the file.
 *
 * @param offset is the location to move the file pointer to.
 */
FileWriter.prototype.seek = function(offset) {
    // Throw an exception if we are already writing a file
    if (this.readyState === FileWriter.WRITING) {
        throw FileError.INVALID_STATE_ERR;
    }

    if (!offset) {
        return;
    }

    // See back from end of file.
    if (offset < 0) {
		this.position = Math.max(offset + this.length, 0);
	}
    // Offset is bigger then file size so set position
    // to the end of the file.
	else if (offset > this.length) {
		this.position = this.length;
	}
    // Offset is between 0 and file size so set the position
    // to start writing.
	else {
		this.position = offset;
	}
};

/**
 * Truncates the file to the size specified.
 *
 * @param size to chop the file at.
 */
FileWriter.prototype.truncate = function(size) {
	// Throw an exception if we are already writing a file
	if (this.readyState === FileWriter.WRITING) {
		throw FileError.INVALID_STATE_ERR;
	}

    // WRITING state
    this.readyState = FileWriter.WRITING;

    var me = this;

    // If onwritestart callback
    if (typeof me.onwritestart === "function") {
        me.onwritestart({"type":"writestart", "target":this});
    }

    // Write file
    navigator.fileMgr.truncate(this.fileName, size,

        // Success callback
        function(r) {
            var evt;
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // Update the length of the file
            me.length = r;
            me.position = Math.min(me.position, r);

            // If onwrite callback
            if (typeof me.onwrite === "function") {
                me.onwrite({"type":"write", "target":me});
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend({"type":"writeend", "target":me});
            }
        },

        // Error callback
        function(e) {
            var evt;
            // If DONE (cancelled), then don't do anything
            if (me.readyState === FileWriter.DONE) {
                return;
            }

            // Save error
            me.error = e;

            // If onerror callback
            if (typeof me.onerror === "function") {
                me.onerror({"type":"error", "target":me});
            }

            // DONE state
            me.readyState = FileWriter.DONE;

            // If onwriteend callback
            if (typeof me.onwriteend === "function") {
                me.onwriteend({"type":"writeend", "target":me});
            }
        }
    );
};

/**
 * Information about the state of the file or directory
 *
 * @constructor
 * {Date} modificationTime (readonly)
 */
var Metadata = function() {
    this.modificationTime=null;
};

/**
 * Supplies arguments to methods that lookup or create files and directories
 *
 * @constructor
 * @param {boolean} create file or directory if it doesn't exist
 * @param {boolean} exclusive if true the command will fail if the file or directory exists
 */
var Flags = function(create, exclusive) {
    this.create = create || false;
    this.exclusive = exclusive || false;
};

/**
 * An interface representing a file system
 *
 * @constructor
 * {DOMString} name the unique name of the file system (readonly)
 * {DirectoryEntry} root directory of the file system (readonly)
 */
var FileSystem = function() {
    this.name = null;
    this.root = null;
};

/**
 * An interface that lists the files and directories in a directory.
 * @constructor
 */
var DirectoryReader = function(fullPath){
    this.fullPath = fullPath || null;
};

/**
 * Returns a list of entries from a directory.
 *
 * @param {Function} successCallback is called with a list of entries
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "readEntries", {fullPath: this.fullPath});
};

/**
 * An interface representing a directory on the file system.
 *
 * @constructor
 * {boolean} isFile always false (readonly)
 * {boolean} isDirectory always true (readonly)
 * {DOMString} name of the directory, excluding the path leading to it (readonly)
 * {DOMString} fullPath the absolute full path to the directory (readonly)
 * {FileSystem} filesystem on which the directory resides (readonly)
 */
var DirectoryEntry = function() {
    this.isFile = false;
    this.isDirectory = true;
    this.name = null;
    this.fullPath = null;
    this.filesystem = null;
};

/**
 * Copies a directory to a new location
 *
 * @param {DirectoryEntry} parent the directory to which to copy the entry
 * @param {DOMString} newName the new name of the entry, defaults to the current name
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "copyTo", {fullPath: this.fullPath, parent:parent, newName: newName});
};

/**
 * Looks up the metadata of the entry
 *
 * @param {Function} successCallback is called with a Metadata object
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getMetadata = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getMetadata", {fullPath: this.fullPath});
};

/**
 * Gets the parent of the entry
 *
 * @param {Function} successCallback is called with a parent entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getParent = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getParent", {fullPath: this.fullPath});
};

/**
 * Moves a directory to a new location
 *
 * @param {DirectoryEntry} parent the directory to which to move the entry
 * @param {DOMString} newName the new name of the entry, defaults to the current name
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "moveTo", {fullPath: this.fullPath, parent: parent, newName: newName});
};

/**
 * Removes the entry
 *
 * @param {Function} successCallback is called with no parameters
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.remove = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "remove", {fullPath: this.fullPath});
};

/**
 * Returns a URI that can be used to identify this entry.
 *
 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
 * @return uri
 */
DirectoryEntry.prototype.toURI = function(mimeType) {
    
    return encodeURI("file://" + this.fullPath);
};

/**
 * Creates a new DirectoryReader to read entries from this directory
 */
DirectoryEntry.prototype.createReader = function(successCallback, errorCallback) {
    return new DirectoryReader(this.fullPath);
};

/**
 * Creates or looks up a directory
 *
 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a directory
 * @param {Flags} options to create or excluively create the directory
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getDirectory", { fullPath: this.fullPath, path: path, options: options });
};

/**
 * Creates or looks up a file
 *
 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a file
 * @param {Flags} options to create or excluively create the file
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getFile", { fullPath: this.fullPath, path: path, options: options });
};

/**
 * Deletes a directory and all of it's contents
 *
 * @param {Function} successCallback is called with no parameters
 * @param {Function} errorCallback is called with a FileError
 */
DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "removeRecursively", {fullPath: this.fullPath});
};

/**
 * An interface representing a directory on the file system.
 *
 * @constructor
 * {boolean} isFile always true (readonly)
 * {boolean} isDirectory always false (readonly)
 * {DOMString} name of the file, excluding the path leading to it (readonly)
 * {DOMString} fullPath the absolute full path to the file (readonly)
 * {FileSystem} filesystem on which the directory resides (readonly)
 */
var FileEntry = function() {
    this.isFile = true;
    this.isDirectory = false;
    this.name = null;
    this.fullPath = null;
    this.filesystem = null;
};

/**
 * Copies a file to a new location
 *
 * @param {DirectoryEntry} parent the directory to which to copy the entry
 * @param {DOMString} newName the new name of the entry, defaults to the current name
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "copyTo", {fullPath: this.fullPath, parent: parent, newName: newName});
};

/**
 * Looks up the metadata of the entry
 *
 * @param {Function} successCallback is called with a Metadata object
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.getMetadata = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getMetadata", {fullPath: this.fullPath});
};

/**
 * Gets the parent of the entry
 *
 * @param {Function} successCallback is called with a parent entry
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.getParent = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getParent", {fullPath: this.fullPath});
};

/**
 * Moves a directory to a new location
 *
 * @param {DirectoryEntry} parent the directory to which to move the entry
 * @param {DOMString} newName the new name of the entry, defaults to the current name
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "moveTo", {fullPath: this.fullPath, parent: parent, newName: newName});
};

/**
 * Removes the entry
 *
 * @param {Function} successCallback is called with no parameters
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.remove = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "remove", {fullPath: this.fullPath});
};

/**
 * Returns a URI that can be used to identify this entry.
 *
 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
 * @return uri
 */
FileEntry.prototype.toURI = function(mimeType) {
    return encodeURI("file://" + this.fullPath);
};

/**
 * Creates a new FileWriter associated with the file that this FileEntry represents.
 *
 * @param {Function} successCallback is called with the new FileWriter
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
    this.file(function (filePointer) {
        var writer = new FileWriter(filePointer);

        if (writer.fileName === null || writer.fileName === "") {
            if (typeof errorCallback == "function") {
                errorCallback({
                    "code": FileError.INVALID_STATE_ERR
                });
            }
        }

        if (typeof successCallback == "function") {
            successCallback(writer);
        }
    }, errorCallback);
};

/**
 * Returns a File that represents the current state of the file that this FileEntry represents.
 *
 * @param {Function} successCallback is called with the new File object
 * @param {Function} errorCallback is called with a FileError
 */
FileEntry.prototype.file = function(successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "getFileMetadata", {fullPath: this.fullPath});
};

/** @constructor */
var LocalFileSystem = function() {
};

// File error codes
LocalFileSystem.TEMPORARY = 0;
LocalFileSystem.PERSISTENT = 1;
LocalFileSystem.RESOURCE = 2;
LocalFileSystem.APPLICATION = 3;

/**
 * Requests a filesystem in which to store application data.
 *
 * @param {int} type of file system being requested
 * @param {Function} successCallback is called with the new FileSystem
 * @param {Function} errorCallback is called with a FileError
 */
LocalFileSystem.prototype.requestFileSystem = function(type, size, successCallback, errorCallback) {
    if (type < 0 || type > 3) {
        if (typeof errorCallback == "function") {
            errorCallback({
                "code": FileError.SYNTAX_ERR
            });
        }
    }
    else {
        Cordova.exec(successCallback, errorCallback, "File", "requestFileSystem", {type: type, size: size});
    }
};

/**
 *
 * @param {DOMString} uri referring to a local file in a filesystem
 * @param {Function} successCallback is called with the new entry
 * @param {Function} errorCallback is called with a FileError
 */
LocalFileSystem.prototype.resolveLocalFileSystemURI = function(uri, successCallback, errorCallback) {
    Cordova.exec(successCallback, errorCallback, "File", "resolveLocalFileSystemURI", {uri: uri});
};

/**
* This function returns and array of contacts.  It is required as we need to convert raw
* JSON objects into concrete Contact objects.  Currently this method is called after
* navigator.service.contacts.find but before the find methods success call back.
*
* @param a JSON Objects that need to be converted to DirectoryEntry or FileEntry objects.
* @returns an entry
*/
LocalFileSystem.prototype._castFS = function (pluginResult) {
    var entry = null;
    entry = new DirectoryEntry();
    entry.isDirectory = pluginResult.message.root.isDirectory;
    entry.isFile = pluginResult.message.root.isFile;
    entry.name = pluginResult.message.root.name;
    entry.fullPath = pluginResult.message.root.fullPath;
    pluginResult.message.root = entry;
    return pluginResult;
};

LocalFileSystem.prototype._castEntry = function(pluginResult) {
    var entry = null;
    if (pluginResult.message.isDirectory) {
        console.log("This is a dir");
        entry = new DirectoryEntry();
    }
    else if (pluginResult.message.isFile) {
        console.log("This is a file");
        entry = new FileEntry();
    }
    entry.isDirectory = pluginResult.message.isDirectory;
    entry.isFile = pluginResult.message.isFile;
    entry.name = pluginResult.message.name;
    entry.fullPath = pluginResult.message.fullPath;
    pluginResult.message = entry;
    return pluginResult;
};

LocalFileSystem.prototype._castEntries = function(pluginResult) {
    var entries = pluginResult.message;
    var retVal = [];
    for (var i=0; i<entries.length; i++) {
        retVal.push(window.localFileSystem._createEntry(entries[i]));
    }
    pluginResult.message = retVal;
    return pluginResult;
};

LocalFileSystem.prototype._createEntry = function(castMe) {
    var entry = null;
    if (castMe.isDirectory) {
        console.log("This is a dir");
        entry = new DirectoryEntry();
    }
    else if (castMe.isFile) {
        console.log("This is a file");
        entry = new FileEntry();
    }
    entry.isDirectory = castMe.isDirectory;
    entry.isFile = castMe.isFile;
    entry.name = castMe.name;
    entry.fullPath = castMe.fullPath;
    return entry;
};

LocalFileSystem.prototype._castDate = function (pluginResult) {
    if (pluginResult.message.modificationTime) {
        var modTime = new Date(pluginResult.message.modificationTime);
        pluginResult.message.modificationTime = modTime;
    }
    else if (pluginResult.message.lastModifiedDate) {
        var file = new File();
        file.size = pluginResult.message.size;
        file.type = pluginResult.message.type;
        file.name = pluginResult.message.name;
        file.fullPath = pluginResult.message.fullPath;
        file.lastModifiedDate = new Date(pluginResult.message.lastModifiedDate);
        pluginResult.message = file;
    }
    return pluginResult;
};

/**
 * Add the FileSystem interface into the browser.
 */
Cordova.onCordovaInit.subscribeOnce(function () {
    var pgLocalFileSystem = new LocalFileSystem();
	// Needed for cast methods
    if(typeof window.localFileSystem == "undefined") window.localFileSystem  = pgLocalFileSystem;
    if(typeof window.requestFileSystem == "undefined") window.requestFileSystem  = pgLocalFileSystem.requestFileSystem;
    if(typeof window.resolveLocalFileSystemURI == "undefined") window.resolveLocalFileSystemURI = pgLocalFileSystem.resolveLocalFileSystemURI;
});
}

/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!Cordova.hasResource("filetransfer")) {
Cordova.addResource("filetransfer");

/**
 * FileTransfer uploads a file to a remote server.
 * @constructor
 */
var FileTransfer = function() {};

/**
 * FileUploadResult
 * @constructor
 */
var FileUploadResult = function() {
    this.bytesSent = 0;
    this.responseCode = null;
    this.response = null;
};

/**
 * FileTransferError
 * @constructor
 */
var FileTransferError = function() {
    this.code = null;
};

FileTransferError.FILE_NOT_FOUND_ERR = 1;
FileTransferError.INVALID_URL_ERR = 2;
FileTransferError.CONNECTION_ERR = 3;

/**
* Given an absolute file path, uploads a file on the device to a remote server
* using a multipart HTTP request.
* @param filePath {String}           Full path of the file on the device
* @param server {String}             URL of the server to receive the file
* @param successCallback (Function}  Callback to be invoked when upload has completed
* @param errorCallback {Function}    Callback to be invoked upon error
* @param options {FileUploadOptions} Optional parameters such as file name and mimetype
*/
FileTransfer.prototype.upload = function(filePath, server, successCallback, errorCallback, options, debug) {

    // check for options
    var params = null;
    if (options) {
        if (options.params) {
            var dict=new Array(); 
            var idx = 0;

            for (var key in options.params) {
                if (options.params.hasOwnProperty(key)) {
                    var value = options.params[key];
                    var item = new Object();
                    item.Key = key;
                    item.Value = value;
                    dict[idx] = item;    
                    idx++;
                }
            }

            options.params = dict;
        }
    } else {
        options = new FileUploadOptions();
    }    

    options.filePath = filePath;
    options.server = server;

    Cordova.exec(successCallback, errorCallback, 'FileTransfer', 'upload', options);
};

/**
 * Options to customize the HTTP request used to upload files.
 * @constructor
 * @param fileKey {String}   Name of file request parameter.
 * @param fileName {String}  Filename to be used by the server. Defaults to image.jpg.
 * @param mimeType {String}  Mimetype of the uploaded file. Defaults to image/jpeg.
 * @param params {Object}    Object with key: value params to send to the server.
 */
var FileUploadOptions = function(fileKey, fileName, mimeType, params) {
    this.fileKey = fileKey || null;
    this.fileName = fileName || null;
    this.mimeType = mimeType || null;
    this.params = params || null;
};
}

/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!Cordova.hasResource("network")) {
Cordova.addResource("network");

/**
 * This class contains information about the current network Connection.
 * @constructor
 */
var Connection = function() 
{
    this.type = null;
    this._firstRun = true;
    this._timer = null;
    this.timeout = 500;

    var me = this;
    this.getInfo(
        function(type) {
			//console.log("getInfo result" + type);
            // Need to send events if we are on or offline
            if (type == "none") {
                // set a timer if still offline at the end of timer send the offline event
                me._timer = setTimeout(function(){
                    me.type = type;
					//console.log("Cordova.fireEvent::offline");
                    Cordova.fireEvent(document,'offline');
                    me._timer = null;
                    }, me.timeout);
            } else {
                // If there is a current offline event pending clear it
                if (me._timer != null) {
                    clearTimeout(me._timer);
                    me._timer = null;
                }
                me.type = type;
				//console.log("Cordova.fireEvent::online " + me.type);
                Cordova.fireEvent(document,'online');
            }
            
            // should only fire this once
            if (me._firstRun) 
			{
                me._firstRun = false;
				//console.log("onCordovaConnectionReady");
                Cordova.onCordovaConnectionReady.fire();
            }            
        },
        function(e) {
            console.log("Error initializing Network Connection: " + e);
        });
};

Connection.UNKNOWN = "unknown";
Connection.ETHERNET = "ethernet";
Connection.WIFI = "wifi";
Connection.CELL_2G = "2g";
Connection.CELL_3G = "3g";
Connection.CELL_4G = "4g";
Connection.NONE = "none";
Connection.CELL = "cellular";

/**
 * Get connection info
 *
 * @param {Function} successCallback The function to call when the Connection data is available
 * @param {Function} errorCallback The function to call when there is an error getting the Connection data. (OPTIONAL)
 */
Connection.prototype.getInfo = function(successCallback, errorCallback) {
    // Get info
    Cordova.exec(successCallback, errorCallback, "Connection", "getConnectionInfo", []);
};


Cordova.onCordovaInit.subscribeOnce(function() {

	navigator.network = navigator.network || {};
    if (typeof navigator.network.connection === "undefined") {
        navigator.network.connection = new Connection();
    }
});
}

/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

if (!Cordova.hasResource("notification")) {
Cordova.addResource("notification");

/**
 * This class provides access to notifications on the device.
 * @constructor
 */
var Notification = function() {
};

/**
 * Open a native alert dialog, with a customizable title and button text.
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} completeCallback   The callback that is called when user clicks on a button.
 * @param {String} title                Title of the alert dialog (default: Alert)
 * @param {String} buttonLabel          Label of the close button (default: OK)
 */
Notification.prototype.alert = function(message, completeCallback, title, buttonLabel) 
{
    var _title = (title || "Alert");
    var _buttonLabels = (buttonLabel || "OK");
    Cordova.exec(completeCallback, null, "Notification", "alert",{"message":message,"title":_title,"buttonLabels":_buttonLabels});
};

/**
 * Open a native confirm dialog, with a customizable title and button text.
 * The result that the user selects is returned to the result callback.
 *
 * @param {String} message              Message to print in the body of the alert
 * @param {Function} resultCallback     The callback that is called when user clicks on a button.
 * @param {String} title                Title of the alert dialog (default: Confirm)
 * @param {String} buttonLabels         Comma separated list of the labels of the buttons (default: 'OK,Cancel')
 */
Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) 
{
    var _title = (title || "Confirm");
    var _buttonLabels = (buttonLabels || "OK,Cancel");
    Cordova.exec(resultCallback, null, "Notification", "confirm", {'message':message,"title":_title,"buttonLabels":_buttonLabels});
};

/**
 * Start spinning the activity indicator on the statusbar
 */
Notification.prototype.activityStart = function() {
    Cordova.exec(null, null, "Notification", "activityStart", ["Busy","Please wait..."]);
};

/**
 * Stop spinning the activity indicator on the statusbar, if it's currently spinning
 */
Notification.prototype.activityStop = function() {
    Cordova.exec(null, null, "Notification", "activityStop", []);
};

/**
 * Display a progress dialog with progress bar that goes from 0 to 100.
 *
 * @param {String} title        Title of the progress dialog.
 * @param {String} message      Message to display in the dialog.
 */
Notification.prototype.progressStart = function(title, message) {
    Cordova.exec(null, null, "Notification", "progressStart", [title, message]);
};

/**
 * Set the progress dialog value.
 *
 * @param {Number} value         0-100
 */
Notification.prototype.progressValue = function(value) {
    Cordova.exec(null, null, "Notification", "progressValue", [value]);
};

/**
 * Close the progress dialog.
 */
Notification.prototype.progressStop = function() {
    Cordova.exec(null, null, "Notification", "progressStop", []);
};

/**
 * Causes the device to blink a status LED.
 *
 * @param {Integer} count       The number of blinks.
 * @param {String} colour       The colour of the light.
 */
Notification.prototype.blink = function(count, colour) {
    // NOT IMPLEMENTED
};

/**
 * Causes the device to vibrate.
 *
 * @param {Integer} mills       The number of milliseconds to vibrate for.
 */
Notification.prototype.vibrate = function(mills) 
{
    Cordova.exec(null, null, "Notification", "vibrate", {duration:mills});
};

/**
 * Causes the device to beep.
 * A packaged resource is played "repeatCount" times.
 *
 * @param {Integer} repeatCount       The number of beeps. default 1
 */
Notification.prototype.beep = function(repeatCount) 
{
	var count = repeatCount|| 1;
    Cordova.exec(null, null, "Notification", "beep", count);
};

Cordova.onCordovaInit.subscribeOnce(function() {
    if (typeof navigator.notification === "undefined") {
        navigator.notification = new Notification();
    }
});
}

﻿/*  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
	
	http://www.apache.org/licenses/LICENSE-2.0
	
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
                          
/**
 * @author purplecabbage
 */
                          
(function(win,doc){


    doc.addEventListener("DOMContentLoaded",function()
    {
    	var docDomain = null;
	    try
	    {
	       docDomain = doc.domain;
	    }
	    catch(err)
	    {
	         //console.log("caught exception trying to access document.domain");
	    }

	    if(!docDomain || docDomain.length == 0)
	    {
	        //console.log("adding our own Local XHR shim ");
			var aliasXHR = win.XMLHttpRequest;
		
			win.XMLHttpRequest = function(){};
		
			win.XMLHttpRequest.UNSENT = 0;
			win.XMLHttpRequest.OPENED = 1;
			win.XMLHttpRequest.HEADERS_RECEIVED = 2;
			win.XMLHttpRequest.LOADING = 3;
			win.XMLHttpRequest.DONE = 4;
	          
			win.XMLHttpRequest.prototype =
			{
                UNSENT:0,
                OPENED:1,
                HEADERS_RECEIVED:2,
                LOADING:3,
                DONE:4,

				isAsync:false,
				onreadystatechange:null,
				readyState:0,
                _url:"",
				open:function(reqType,uri,isAsync,user,password)
				{
					console.log("XMLHttpRequest.open " + uri);
					if(uri && uri.indexOf("http") == 0)
					{
						if(!this.wrappedXHR)
						{
							this.wrappedXHR = new aliasXHR();
                            var self = this;

							Object.defineProperty( this, "status", { get: function() {
								return this.wrappedXHR.status;										
							}});
							Object.defineProperty( this, "responseText", { get: function() {
								return this.wrappedXHR.responseText;										
							}});
							Object.defineProperty( this, "statusText", { get: function() {
								return this.wrappedXHR.statusText;										
							}});

                            Object.defineProperty( this, "responseXML", { get: function() {
								return this.wrappedXHR.responseXML;										
							}});    
                        
							this.getResponseHeader = function(header) {
								return this.wrappedXHR.getResponseHeader(header);
							};
							this.getAllResponseHeaders = function() {
								return this.wrappedXHR.getAllResponseHeaders();
							};
							
							this.wrappedXHR.onreadystatechange = function()
                            {
                                self.changeReadyState(self.wrappedXHR.readyState);
                            };
						}
						return this.wrappedXHR.open(reqType,uri,isAsync,user,password);
					}
					else
					{
                        // x-wmapp1://app/www/page2.html
                        // need to work some magic on the actual url/filepath
		                var newUrl =  uri;
                        if(newUrl.indexOf(":/") > -1)
                        {
                            newUrl = newUrl.split(":/")[1];
                        }

		                if(newUrl.lastIndexOf("/") === newUrl.length - 1)
		                {
		                    newUrl += "index.html"; // default page is index.html, when call is to a dir/ ( why not ...? )
		                }
                        this._url = newUrl;
					}
				},
				statusText:"",
				changeReadyState:function(newState)
				{
					this.readyState = newState;
					if(this.onreadystatechange)
					{
						this.onreadystatechange();	
					}
				},
				getResponseHeader:function(header)
				{
                    return this.wrappedXHR ?  this.wrappedXHR.getResponseHeader(header) : "";
				},
				getAllResponseHeaders:function()
				{
					return this.wrappedXHR ?  this.wrappedXHR.getAllResponseHeaders() : "";
				},
				responseText:"",
				responseXML:"",
				onResult:function(res)
				{
					this.status = 200;
					this.responseText = res;

                    Object.defineProperty( this, "responseXML", { get: function() {
                        var parser = new DOMParser();
						return parser.parseFromString(this.responseText,"text/xml");										
					}}); 
					this.changeReadyState(this.DONE);
				},
				onError:function(err)
				{
					console.log("Wrapped XHR received Error from FileAPI :: " + err);
					this.status = 404;
					this.changeReadyState(this.DONE);
				},

                abort:function()
                {
					if(this.wrappedXHR)
					{
						return this.wrappedXHR.abort();
					}
                },
				
				send:function(data)
				{
					if(this.wrappedXHR)
					{
						return this.wrappedXHR.send(data);
					}
                    else
                    {
                        this.changeReadyState(this.OPENED);
                        navigator.fileMgr.readAsText(this._url,"UTF-8",this.onResult.bind(this),this.onError.bind(this));
                    }
				},
				status:404
			};		  
	    } // if doc domain 

    },false);// addEventListener

		  
})(window,document);

