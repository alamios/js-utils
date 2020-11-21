
var someutils = (function() {
    return {    

        insertHTML: function(content, target, replace=true) {
            function rep(content, target, replace) {
                if (replace)
                    target.innerHTML = content;
                else
                    target.innerHTML = target.innerHTML + content;
            }
            if (typeof(target) === 'string' || target instanceof String)
                target = document.querySelectorAll(target);
            if (this.isIterable(target))
                for (t of target)
                    rep(content, t, replace);
            else
                rep(content, target, replace);
        },
    
        loadHTML: function(async, url, target, replace=true) {
            if (async)
                this.loadURLAsync(url, this.insertHTML, target, replace);
            else
                this.insertHTML(this.loadURL(url), target, replace);
        },
    
        loadURLAsync: function(url, callback, ...args) {
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.onreadystatechange = function(evt) {
                if (req.readyState == 4 && req.status == 200) {
                    callback(req.responseText, ...args);
                }
            };
            req.send(null); 
        },
    
        loadURL: function(url) {
            var req = new XMLHttpRequest();
            req.open("GET", url, false);
            req.send();
            return req.responseText;
        },
    
        urlExists: function(url) {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            return http.status != 404;
        },
    
        loadCSS: function(url){ 
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", url);
            document.head.appendChild(link);
        },

        getFavicon1: function(url) {
            return url.match(/^https?\:\/\/([^\/?#]+)/)[0] + "/favicon.ico";
        },

        getFavicon2: function(url) {
            return "http://s2.googleusercontent.com/s2/favicons?domain_url=" + url;
        },

        setFavicon: function(link, width, src) {
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
                    this.src = this.getFavicon2(url);
                }
                iconimg.src = this.getFavicon1(url);
            }
            else {
                iconimg.onerror = function() {
                    this.onerror = function() {
                        this.onerror = null;
                        this.src = this.getFavicon2(url);
                    }
                    this.src = this.getFavicon1(url);
                }
                iconimg.src = src;
            }
        },

        replaceFavicon: function(link) {
            var url = link.getAttribute("href");
            var iconimg = link.firstChild;
            iconimg.onerror = function() {
                this.onerror = null;
                this.src = this.getFavicon2(url);
            }
            iconimg.src = this.getFavicon1(url);
        },

        openInNewTab: function(url) {
            var win = window.open(url, '_blank');
            win.focus();
        },

        isIterable: function(value) {
            return Symbol.iterator in Object(value);
        },

        lazyImageLoad: function() {
            var lazyimgs = document.querySelectorAll('[data-lazysrc]');
            for (var img of lazyimgs) {
                img.src = img.dataset.lazysrc;
            }
        },
    
        storePersistent: function(key, value, expiration) {
            if (localStorage)
                localStorage.setItem(key, value);
            else
                this.setCookie(key, value, expiration);
        },
    
        retrievePersistent: function(key) {
            if (localStorage)
                return localStorage.getItem(key);
            else
                return this.parseCookie(key);
        },
    
        storeSession: function(key, value) {
            if (sessionStorage)
                sessionStorage.setItem(key, value);
            else
                document.cookie = key + "=" + value;
        },
    
        retrieveSession: function(key) {
            if (sessionStorage)
                return sessionStorage.getItem(key);
            else
                return this.parseCookie(key);
        },
    
        parseCookie: function(key) {
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
        },

        setCookie: function(key, value, expiration) {
            var cookie = key + "=" + value;
            if (expiration == undefined)
                expiration = 365*24*60*60*1000;
            var d = new Date();
            d.setTime(d.getTime() + expiration);
            cookie += ";" + "expires=" + d.toUTCString();
            document.cookie = cookie;
        },
    
        openFullscreen: function() {
            var elem = document.documentElement;
            if (elem.requestFullscreen)
                elem.requestFullscreen();
            else if (elem.mozRequestFullScreen)
                elem.mozRequestFullScreen();
            else if (elem.webkitRequestFullscreen)
                elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen)
                elem.msRequestFullscreen();
        },
    
        closeFullscreen: function() {
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
        },
    
        scale: function(image, newWidth, newHeight, rate) {
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
        },
    
        createImage: function(canvas) {
            var newImage = new Image();
            canvas.toBlob(function(blob) {
                url = URL.createObjectURL(blob);
                newImage.onload = function() {
                    URL.revokeObjectURL(url);
                }
                newImage.src = url;
            });
            return newImage;
        },
    
        setContentID: function(target, text) {
            var elem = document.getElementById(target);
            if (elem != null)
                elem.innerHTML = text;
        },
    
        setContentClass: function(target, text) {
            var elems = document.getElementsByClassName(target);
            if (elems != null)
                for (var i=0; i<elems.length; i++)
                    elems[i].innerHTML = (Array.isArray(text)) ? text[i] : text;
        },
    
        setContentName: function(target, text) {
            var elems = document.getElementsByTagName(target);
            if (elems != null)
                for (var i=0; i<elems.length; i++)
                    elems[i].innerHTML = (Array.isArray(text)) ? text[i] : text;
        },
    
        setContentSelection: function(target, text) {
            var elems = document.querySelectorAll(target);
            if (elems != null)
                for (var i=0; i<elems.length; i++)
                    elems[i].innerHTML = (Array.isArray(text)) ? text[i] : text;
        },
        
        generateName: function(syllables, vocals="aeiou", consonants="qwrtypsdfghjklñzxcvbnm", thirdConsRate=0.2) {
            var name = "";
            var genSyl = function() {
                var syl = consonants.charAt(parseInt(Math.random() * consonants.length))
                syl += vocals.charAt(parseInt(Math.random() * vocals.length))
                if (Math.random() < thirdConsRate)
                    syl += consonants.charAt(parseInt(Math.random() * consonants.length))
                return syl
            }
            for (var i=0; i<syllables; i++)
                name += genSyl();
            return name;
        }
    };
})();

var dateutils = (function() {
    return {    

        parseCommonDate: function(strDate, dateSep="/") {
            var parts = strDate.split(dateSep);
            var date = new Date();
            date.setFullYear(parseInt(parts[0]));
            date.setMonth(parseInt(parts[1])-1);
            date.setDate(parseInt(parts[2]));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            return date;
        },

        parseReversedDate: function(strDate, dateSep="/") {
            var parts = strDate.split(dateSep);
            var date = new Date();
            date.setDate(parseInt(parts[0]));
            date.setMonth(parseInt(parts[1])-1);
            date.setFullYear(parseInt(parts[2]));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            return date;
        },

        parseCommonDatetime: function(strDate, dateSep="/", timeSep=":", datetimeSep=" ") {
            var parts1 = strDate.split(datetimeSep);
            var parts2 = parts1[1].split(timeSep);
            var date = this.parseCommonDate(parts1[0], dateSep)
            date.setHours(parseInt(parts2[0]));
            date.setMinutes(parseInt(parts2[1]));
            date.setSeconds(parseInt((parts2[2]) ? parts2[2] : 0));
            return date;
        },

        parseReversedDatetime: function(strDate, dateSep="/", timeSep=":", datetimeSep=" ") {
            var parts1 = strDate.split(datetimeSep);
            var parts2 = parts1[1].split(timeSep);
            var date = this.parseReversedDate(parts1[0], dateSep)
            date.setHours(parseInt(parts2[0]));
            date.setMinutes(parseInt(parts2[1]));
            date.setSeconds(parseInt((parts2[2]) ? parts2[2] : 0));
            return date;
        },

        parseCommonDateNoSep: function(strDate) {
            var date = new Date();
            date.setFullYear(parseInt(strDate.substring(0, 4)));
            date.setMonth(parseInt(strDate.substring(4, 6))-1);
            date.setDate(parseInt(strDate.substring(6, 8)));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            return date;
        },

        parseReversedDateNoSep: function(strDate) {
            var date = new Date();
            date.setDate(parseInt(strDate.substring(0, 2)));
            date.setMonth(parseInt(strDate.substring(2, 4))-1);
            date.setFullYear(parseInt(strDate.substring(4, 8)));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            return date;
        },

        parseCommonDatetimeNoSep: function(strDate, datetimeSep=" ") {
            var parts = strDate.split(datetimeSep);
            var date = this.parseCommonDateNoSep(parts[0], dateSep)
            date.setHours(parseInt(parts[1].substring(0, 2)));
            date.setMinutes(parseInt(parts[1].substring(2, 4)));
            date.setSeconds(parseInt((parts[1]) ? parts2[2].substring(4, 6) : 0));
            return date;
        },

        parseReversedDatetimeNoSep: function(strDate, datetimeSep=" ") {
            var parts = strDate.split(datetimeSep);
            var date = this.parseReversedDateNoSep(parts[0], dateSep)
            date.setHours(parseInt(parts[1].substring(0, 2)));
            date.setMinutes(parseInt(parts[1].substring(2, 4)));
            date.setSeconds(parseInt((parts[1]) ? parts2[2].substring(4, 6) : 0));
            return date;
        },

        toCommonDateString = function(date, sep="/") {
            return date.getFullYear().pad(4) + 
            sep + (date.getMonth()+1).pad(2) +
            sep + date.getDate().pad(2);
        },
        
        toReversedDateString = function(date, sep="/") {
            return date.getDate().pad(2) +
            sep + (date.getMonth()+1).pad(2) +
            sep + date.getFullYear().pad(4);
        },
        
        toCommonTimeString = function(date, sep=":") {
            return date.getHours().pad(2) +
            sep + date.getMinutes().pad(2) +
            sep + date.getSeconds().pad(2);
        },
        
        toCommonString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toCommonDateString(date, dateSep) + datetimeSep + this.toCommonTimeString(date, timeSep);
        },
        
        toReversedString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toCommonTimeString(date, timeSep) + datetimeSep + this.toReversedDateString(date, dateSep);
        },
        
        toCommonUTCDateString = function(date, sep="/") {
            return date.getUTCFullYear().pad(4) + 
            sep + (date.getUTCMonth()+1).pad(2) +
            sep + date.getUTCDate().pad(2);
        },
        
        toReversedUTCDateString = function(date, sep="/") {
            return date.getUTCDate().pad(2) +
            sep + (date.getUTCMonth()+1).pad(2) +
            sep + date.getUTCFullYear().pad(4);
        },
        
        toCommonUTCTimeString = function(date, sep=":") {
            return date.getUTCHours().pad(2) +
            sep + date.getUTCMinutes().pad(2) +
            sep + date.getUTCSeconds().pad(2);
        },
        
        toCommonUTCString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toCommonUTCDateString(date, dateSep) + datetimeSep + this.toCommonUTCTimeString(date, timeSep);
        },
        
        toReversedUTCString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toCommonUTCTimeString(date, timeSep) + datetimeSep + this.toReversedUTCDateString(date, dateSep);
        },
        
        toShortCommonDateString = function(date, sep="/") {
            return (date.getMonth()+1).pad(2) +
            sep + date.getDate().pad(2);
        },
        
        toShortReversedDateString = function(date, sep="/") {
            return date.getDate().pad(2) +
            sep + (date.getMonth()+1).pad(2);
        },
        
        toShortCommonTimeString = function(date, sep=":") {
            return date.getHours().pad(2) +
            sep + date.getMinutes().pad(2);
        },
        
        toShortCommonString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toShortCommonDateString(date, dateSep) + datetimeSep + this.toShortCommonTimeString(date, timeSep);
        },
        
        toShortReversedString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toShortCommonTimeString(date, timeSep) + datetimeSep + this.toShortReversedDateString(date, dateSep);
        },
        
        toShortCommonUTCDateString = function(date, sep="/") {
            return (date.getUTCMonth()+1).pad(2) +
            sep + date.getUTCDate().pad(2);
        },
        
        toShortReversedUTCDateString = function(date, sep="/") {
            return date.getUTCDate().pad(2) +
            sep + (date.getUTCMonth()+1).pad(2);
        },
        
        toShortCommonUTCTimeString = function(date, sep=":") {
            return date.getUTCHours().pad(2) +
            sep + date.getUTCMinutes().pad(2);
        },
        
        toShortCommonUTCString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toShortCommonUTCDateString(date, dateSep) + datetimeSep + this.toShortCommonUTCTimeString(date, timeSep);
        },
        
        toShortReversedUTCString = function(date, dateSep="/", timeSep=":", datetimeSep=" ") {
            return this.toShortCommonUTCTimeString(date, timeSep) + datetimeSep + this.toShortReversedUTCDateString(date, dateSep);
        }
    };
})();

var uiutils = (function() {
    return {

        fadeIn: function(elem, interval, step, display="block") {
            elem.style.opacity = '0';
            elem.style.display = display;
            var fin = setInterval(function () {
                if (elem.style.opacity < 1)
                    elem.style.opacity = parseFloat(elem.style.opacity) + step;
                else
                    clearInterval(fin);
            }, interval);
        },
        
        fadeOut: function(elem, interval, step) {
            elem.style.opacity = '1';
            var fout = setInterval(function () {
                if (parseFloat(elem.style.opacity) > 0)
                    elem.style.opacity = parseFloat(elem.style.opacity) - step;
                else {
                    clearInterval(fout);
                    elem.style.display = "none";
                }
            }, interval);
        },

        fade: function(prev, next, interval, step, display="block") {
            prev.style.opacity = '1';
            var fout = setInterval(function () {
                if (parseFloat(prev.style.opacity) > 0)
                    prev.style.opacity = parseFloat(prev.style.opacity) - step;
                else {
                    clearInterval(fout);
                    prev.style.display = "none";
                    next.style.opacity = '0';
                    next.style.display = display;
                    var fin = setInterval(function () {
                        if (next.style.opacity < 1)
                            next.style.opacity = parseFloat(next.style.opacity) + step;
                        else
                            clearInterval(fin);
                    }, interval);
                }
            }, interval);
        }
    }
})();


String.prototype.insertAt = function(string, index) {   
    return this.substring(0, index) + string + this.substring(index);
}

String.prototype.pad = function(length, char=" ") {
    var str = this;
    while (str.length < length) 
        str = char + str;
    return str;
};

Number.prototype.pad = function(length, char=0) {
    return this.toString().pad(length, char);
};