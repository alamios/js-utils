
function insertHTML(content, target, replace=true) {
    function rep(content, target, replace) {
        if (replace)
            target.innerHTML = content;
        else
            target.innerHTML = target.innerHTML + content;
    }
    if (typeof(target) === 'string' || target instanceof String)
        target = document.querySelectorAll(target);
    if (isIterable(target))
        for (t of target)
            rep(content, t, replace);
    else
        rep(content, target, replace);
}

function loadHTML(async, url, target, replace=true) {
    if (async) {
        loadURLAsync(url, insertHTML, target, replace);
    }
    else {
        insertHTML(loadURL(url), target, replace);
    }
}

function loadURLAsync(url, callback, ...args) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function (evt) {
        if (req.readyState == 4 && req.status == 200) {
            callback(req.responseText, ...args);
        }
    };
    req.send(null); 
}

function loadURL(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send();
    return req.responseText;
}

function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}

function getFavicon1(url) {
    return url.match(/^https?\:\/\/([^\/?#]+)/)[0] + "/favicon.ico";
}

function getFavicon2(url) {
    return "http://s2.googleusercontent.com/s2/favicons?domain_url=" + url;
}

function setFavicon(link, width, src) {
    var iconimg = document.createElement("img");
    iconimg.setAttribute('width', width + "px");
    iconimg.setAttribute('height', "auto");
    iconimg.classList.add("icon");
    var text = link.textContent;
    link.textContent = "";
    link.append(iconimg);
    link.append(text);
    var url = link.getAttribute("href");
    if (src == undefined) {
        iconimg.onerror = function() {
            this.onerror = null;
            this.src = getFavicon2(url);
        }
        iconimg.src = getFavicon1(url);
    }
    else {
        iconimg.onerror = function() {
            this.onerror = function() {
                this.onerror = null;
                this.src = getFavicon2(url);
            }
            this.src = getFavicon1(url);
        }
        iconimg.src = src;
    }
}

function replaceFavicon(link) {
    var url = link.getAttribute("href");
    var iconimg = link.firstChild;
    iconimg.onerror = function() {
        this.onerror = null;
        this.src = getFavicon2(url);
    }
    iconimg.src = getFavicon1(url);
}

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

function isIterable(value) {
    return Symbol.iterator in Object(value);
}

function lazyImageLoad() {
    var lazyimgs = document.querySelectorAll('[data-lazysrc]');
    for (var img of lazyimgs) {
        img.src = img.dataset.lazysrc;
    }
}

function storePersistent(key, value, expiration) {
    if (localStorage) {
        localStorage.setItem(key, value);
    } 
    else {
        var cookie = key + "=" + value;
        if (expiration == undefined)
            expiration = 365*24*60*60*1000;
        var d = new Date();
        d.setTime(d.getTime() + expiration);
        cookie += ";" + "expires=" + d.toUTCString();
        document.cookie = cookie;
    }
}

function retrievePersistent(key) {
    if (localStorage)
        return localStorage.getItem(key);
    else
        return parseCookie(key);
}

function storeSession(key, value) {
    if (sessionStorage)
        sessionStorage.setItem(key, value);
    else
        document.cookie = key + "=" + value;
}

function retrieveSession(key) {
    if (sessionStorage)
        return sessionStorage.getItem(key);
    else
        return parseCookie(key);
}

function parseCookie(key) {
    var cookies = document.cookie;
    if (cookies.includes(";")) {
        var carray = cookies.split(";");
        for (var cookie of carray) {
            if (cookie.includes(key)) {
                return cookie.split("=")[1];
            }
        }
    }
    else if (cookies.includes(key)) {
        return cookies.split("=")[1];
    }
    return undefined;
}

function openFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen)
        elem.requestFullscreen();
    else if (elem.mozRequestFullScreen)
        elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen)
        elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen)
        elem.msRequestFullscreen();
}

function closeFullscreen() {
    if (document.cancelFullScreen)
        document.cancelFullScreen();
    else if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
}

function scale(image, newWidth, newHeight, rate) {
	var tmpcanvas = document.createElement('canvas');
	var tmpctx = tmpcanvas.getContext('2d');
	tmpcanvas.width = image.width;
	tmpcanvas.height = image.height;
	tmpctx.drawImage(image, 0, 0);
	var newcanvas = document.createElement('canvas');
    var newctx = newcanvas.getContext('2d');
    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);
	newcanvas.width = newWidth;
	newcanvas.height = newHeight;
	var width = image.width;
	var height = image.height;
	var nextWidth = image.width;
	var nextHeight = image.height;
	var done = false;
	while (!done) {
		nextWidth *= rate;
		nextHeight *= rate;
		if (nextWidth < newWidth){
			newctx.drawImage(tmpcanvas, 0, 0, Math.round(width), Math.round(height), 0, 0, newWidth, newHeight);
			done = true;
		}
		else {
			tmpctx.drawImage(tmpcanvas, 0, 0, Math.round(width), Math.round(height), 0, 0, Math.round(nextWidth), Math.round(nextHeight));
			width = nextWidth;
			height = nextHeight;
		}
    }
    return newcanvas;
}

function createImage(canvas) {
    var newImage = new Image();
    canvas.toBlob(function(blob) {
        url = URL.createObjectURL(blob);
		newImage.onload = function() {
			URL.revokeObjectURL(url);
		}
        newImage.src = url;
	});
    return newImage;
}

function setContentID(target, text) {
    var elem = document.getElementById(target);
    if (elem != null)
        elem.innerHTML = text;
}

function setContentClass(target, text) {
    var elems = document.getElementsByClassName(target);
    if (elems != null) {
        for (var i=0; i<elems.length; i++) {
            elems[i].innerHTML = (Array.isArray(text)) ? text[i] : text;
        }
    }
}

function setContentName(target, text) {
    var elems = document.getElementsByTagName(target);
    if (elems != null) {
        for (var i=0; i<elems.length; i++) {
            elems[i].innerHTML = (Array.isArray(text)) ? text[i] : text;
        }
    }
}

function setContentSelection(target, text) {
    var elems = document.querySelectorAll(target);
    if (elems != null) {
        for (var i=0; i<elems.length; i++) {
            elems[i].innerHTML = (Array.isArray(text)) ? text[i] : text;
        }
    }
}

String.prototype.pad = function (length, char=" ") {
    var str = this;
    while (str.length < length) 
        str = char + str;
    return str;
};

Number.prototype.pad = function (length, char=0) {
    return this.toString().pad(length, char);
};

Date.prototype.toCommonDateString = function (sep="/") {
    return this.getFullYear().pad(4) + 
    sep + (this.getMonth()+1).pad(2) +
    sep + this.getDate().pad(2);
};

Date.prototype.toCommonTimeString = function (sep=":") {
    return this.getHours().pad(2) +
    sep + this.getMinutes().pad(2) +
    sep + this.getSeconds().pad(2);
};

Date.prototype.toCommonString = function (datesep="/", timesep=":", strsep=" ") {
    return this.toCommonDateString(datesep) + strsep + this.toCommonTimeString(timesep);
};

Date.prototype.toCommonUTCDateString = function (sep="/") {
    return this.getUTCFullYear().pad(4) + 
    sep + (this.getUTCMonth()+1).pad(2) +
    sep + this.getUTCDate().pad(2);
};

Date.prototype.toCommonUTCTimeString = function (sep=":") {
    return this.getUTCHours().pad(2) +
    sep + this.getUTCMinutes().pad(2) +
    sep + this.getUTCSeconds().pad(2);
};

Date.prototype.toCommonUTCString = function (datesep="/", timesep=":", strsep=" ") {
    return this.toCommonUTCDateString(datesep) + strsep + this.toCommonUTCTimeString(timesep);
};