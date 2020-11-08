
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
            req.onreadystatechange = function (evt) {
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
        }
    };
})();

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