import { traceForIE, isIE } from './util'
const emptyFun = function (argument) { };
const _loggersByName = {};
class Logger {
	constructor(name, defaultLevel, factory){
		this.name = name || 'defaultLogger'
		this.currentLevel = undefined
		this.useCookiePersist = undefined // 使用cookie 存储 storageLogLevelKey
		this.storageLogLevelKey = 'loglevel'
		this.levels = {
			"TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
            "ERROR": 4, "SILENT": 5
		}
		this.logMethods = ["trace", "debug", "info", "warn", "error"]
		this.methodFactory = factory || this.defaultMethodFactory;

		// Initialize with the right level
	    var initialLevel = this._getPersistedLevel();
	    if (initialLevel == null) {
	        initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
	    }

	    
	    this.logs = []

	    this.config = {
	    	useCache: false,
	    	maxCache: 3 * 1024 * 1024,
	    	color: '',
	    	background: ''
	    }

	    this.logBytes = 0;

	    this.setLevel(initialLevel, false);
	}

	setConfig(cofig = {}){
		this.config = cofig;
	}

	getLevel() {
		return this.currentLevel
	}

	setLevel(level, persist) {
		if (typeof level === "string" && this.levels[level.toUpperCase()] !== undefined) {
            level = this.levels[level.toUpperCase()];
        }

        if (typeof level === "number" && level >= 0 && level <= this.levels.SILENT) {
			this.currentLevel = level

			if (persist !== false) {
                this._persistLevel(level);
            }
            this.replaceLoggingMethods(level, name);
            if (typeof console === undefined && level < self.levels.SILENT) {
                return "No console available for logging";
            }
        }else{
        	throw "log.setLevel() called with invalid level: " + level;
        }
	}

	setDefaultLevel() {
		if (!_getPersistedLevel()) {
	        this.setLevel(level, false);
	    }
	}

 	enableAll(persist) {
        this.setLevel(this.levels.TRACE, persist);
    };

    disableAll(persist) {
        this.setLevel(this.levels.SILENT, persist);
    };

    getLogs(){
    	return this.logs
    }

    // Cross-browser bind equivalent that works at least back to IE6
    _bindMethod(obj, methodName, useCache) {
	    let method = obj[methodName];
	    if(useCache){
	    	return this._cacheLog
	    }else if (typeof method.bind === 'function') {
	    	return method.bind(obj)
	    } else {
	        try {
	            return Function.prototype.bind.call(method, obj);
	        } catch (e) {
	            // Missing bind shim or IE8 + Modernizr, fallback to wrapping
	            return function() {
	                return Function.prototype.apply.apply(method, [obj, arguments]);
	            };
	        }
	    }
	}

	_cacheLog(...rest){
		let time = new Date().toLocaleString() + ': '
		this._cacheLogCall(time+rest.join(' '))
		//console.log(  "%c " + time+rest.join(' '), `color: ${this.config.color}; background: ${this.config.background}`);
	}

	_cacheLogCall(log){
		let logB = bytesLnegth(log)
		let futureB = this.logBytes + logB
		const maxCache = this.config.maxCache

		if (logB >= maxCache) {
			return
		}

		if (futureB < maxCache) {
			this.logBytes += logB
		}else{
			let midB = futureB - maxCache
			let clearOutB = 0;
			while(clearOutB < midB){
				let clearOutLog = this.logs.shift()
				console.log('clearOutLog', clearOutLog)
				if (clearOutLog !== undefined){
					clearOutB += bytesLnegth(clearOutLog)
				}
			}
		}
		this.logs.push(log)
	}

	// get local stored level
	_getPersistedLevel() {
		let storedLevel;
		if (typeof window === undefined) {
			return console.warn('this lib can run in browser only!')
		}

		storedLevel = window.localStorage[this.storageLogLevelKey];

		if (storedLevel === undefined) {
			const cookie = window.document.cookie;
			const location = cookie.indexOf(encodeURIComponent(this.storageLogLevelKey));
			if (location !== -1) {
                storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
            }
		}

		return storedLevel;
	}

	// Store level persistently in browser
	_persistLevel(levelNum){
		const levelName = (this.logMethods[levelNum] || 'SILENT');
		if (typeof window === undefined) {
			return console.warn('this lib can run in browser only!')
		}
		window.localStorage[this.storageLogLevelKey] = levelName;

		if (this.useCookiePersist) {
			window.document.cookie = encodeURIComponent(this.storageLogLevelKey) + "=" + levelName + ";";
		}
	}

	replaceLoggingMethods(level, loggerName){
		for (var i = 0; i < this.logMethods.length; i++) {
            var methodName = this.logMethods[i];
            this[methodName] = (i < level) ?
                emptyFun :
                this.methodFactory(methodName, level, loggerName);
        }

        // Define log.log as an alias for log.debug
        this.log = this.debug;
	}

	// By default, we use closely bound real methods wherever possible, and
    // otherwise we wait for a console to appear, and then try again.
    defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return this.realMethod(methodName) ||
            this.enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    // Build the best logging method possible for this env
    // Wherever possible we want to bind, not wrap, to preserve stack traces
    realMethod(methodName) {
        if (methodName === 'debug') {
            methodName = 'log';
        }

        if (typeof console === undefined) {
            return false; // No method possible, for now - fixed later by enableLoggingWhenConsoleArrives
        } else if (methodName === 'trace' && isIE) {
            return traceForIE;
        } else if (console[methodName] !== undefined) {
            return this._bindMethod(console, methodName, this.config.useCache);
        } else if (console.log !== undefined) {
            return this._bindMethod(console, 'log', this.config.useCache);
        } else {
            return emptyFun;
        }
    }

    // In old IE versions, the console isn't present until you first open it.
    // We build realMethod() replacements here that regenerate logging methods
    enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if (typeof console !== undefined) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }
}

function bytesLnegth(str){
    let count = str.length;
    for(let i=0; i< str.length; i++){
        if(str.charCodeAt(i) > 255){
           count ++;
        }    
    }
    return count;
}

const defaultLogger = new Logger();


defaultLogger.getLogger = function(name){
	if (typeof name !== "string" || name === "") {
        throw new TypeError("You must supply a name when creating a logger.");
    }

    var logger = _loggersByName[name];
    if (!logger) {
        logger = _loggersByName[name] = new Logger(
            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
    }

    return logger;
}

// Grab the current global log variable in case of overwrite
var _log = (typeof window !== undefined) ? window.log : undefined;

defaultLogger.noConflict = function () {
    if (typeof window !== undefined &&
        window.log === defaultLogger) {
        window.log = _log;
    }

    return defaultLogger;
};

defaultLogger.getLoggers = function getLoggers() {
    return _loggersByName;
};

export default defaultLogger



