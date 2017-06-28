angular.module('panel').service('IndexDBService',['$q',function ($q) {
    this.db = null;
    this.isEnabled = function () {
        return typeof window.indexedDB !== 'undefined';
    };
    this.open = function (name,keys) {
        var defer = $q.defer();
        if(this.db){
            defer.resolve(this.db);
            return defer.promise;
        }
        try{
            var req = window.indexedDB.open(name);
            req.onsuccess = function () {
                this.db = req.result;
                defer.resolve(req.result);
            }.bind(this);
            req.onerror = function (e) {
                defer.reject(e);
            };
            req.onupgradeneeded = function (e) {
                var db = e.target.result;
                if(keys){
                    keys.forEach(function (key) {
                        if(!db.objectStoreNames.contains(key)){
                            db.createObjectStore(key,{autoIncrement:true});
                        }
                    });
                }
            };
        }catch (e){
            defer.reject(e);
        }
        return defer.promise;
    };
    this.close = function () {
        if(null != this.db){
            this.db.close();
            this.db = null;
        }
    };
    this.deleteDB = function (dbName) {
        if(this.db){
            this.close();
        }
        window.indexedDB.deleteDatabase(dbName);
    };
    this.addItem = function (key,item) {
        return add(this.db);
        function add(db){
            var defer = $q.defer();
            try{
                var tran = db.transaction([key],'readwrite');
                var objectStore = tran.objectStore(key);
                var req = objectStore.add(item);
                req.onsuccess = function () {
                    defer.resolve(req.result);
                };
                req.onerror = function (e) {
                    defer.reject(e);
                };
            }catch(e){
                defer.reject(e);
            }
            return defer;
        }
    };
    this.clearObjectStore = function (key) {
        var defer = $q.defer();
        if(null != this.db){
            try{
                var tran = db.transaction([key],'readwrite');
                var objectStore = tran.objectStore(key);
                var req= objectStore.clear();
                req.onsuccess = function () {
                    defer.resolve(req.result);
                };
                req.onerror = function (e) {
                    defer.reject(e);
                };
            }catch(e){
                defer.reject(e);
            }
        }else{
            defer.resolve();
        }
        return defer.promise;
    };
    this.getAll = function (key) {
        return get(this.db);
        function get(db){
            var defer = $q.defer();
            try{
                var tran = db.transaction([key],'readonly');
                var objectStore = tran.objectStore(key);
                var req = objectStore.getAll();
                req.onsuccess = function () {
                    defer.resolve(req.result);
                };
                req.onerror = function (e) {
                    defer.reject(e);
                };
            }catch (e){
                defer.reject(e);
            }
            return defer.promise;
        }
    };
}]);