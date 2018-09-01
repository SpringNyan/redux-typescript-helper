!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("rxjs/operators"),require("rxjs"),require("redux-observable"),require("reselect"),require("immer")):"function"==typeof define&&define.amd?define(["rxjs/operators","rxjs","redux-observable","reselect","immer"],t):"object"==typeof exports?exports["redux-typescript-helper"]=t(require("rxjs/operators"),require("rxjs"),require("redux-observable"),require("reselect"),require("immer")):e["redux-typescript-helper"]=t(e["rxjs/operators"],e.rxjs,e["redux-observable"],e.reselect,e.immer)}(window,function(e,t,r,n,o){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=5)}([function(t,r){t.exports=e},function(e,r){e.exports=t},function(e,t){e.exports=r},function(e,t){e.exports=n},function(e,t){e.exports=o},function(e,t,r){"use strict";r.r(t);var n={register:"@@REGISTER",epicEnd:"@@EPIC_END",unregister:"@@UNREGISTER"};function o(e){return null!=e&&e.type===this.type}function i(e){var t=function(t){return{type:e,payload:t}};return t.type=e,t.is=o,t}var s=r(1);function c(e){return new s.Observable(function(t){e(function(e){return t.next(e),e}).then(function(){return t.complete()},function(e){return t.error(e)})})}var u=r(3),a=function(){return(a=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)},l=function(){function e(e){this._selectors={},this._reducers={},this._effects={},this._epics=[],this._models={},this._state=e}return e.prototype.selectors=function(e){return"function"==typeof e&&(e=e(u.createSelector)),this._selectors=a({},this._selectors,e),this},e.prototype.reducers=function(e){return this._reducers=a({},this._reducers,e),this},e.prototype.effects=function(e){return this._effects=a({},this._effects,e),this},e.prototype.epics=function(e){return this._epics=this._epics.concat(e),this},e.prototype.models=function(e){return this._models=a({},this._models,e),this},e.prototype.dynamicModels=function(){return this},e.prototype.build=function(){return{state:this._state,selectors:a({},this._selectors),reducers:a({},this._reducers),effects:a({},this._effects),epics:this._epics.slice(),models:a({},this._models)}},e}();function p(e){return new l(e)}function f(){return p}var d=r(4),h=r.n(d),_=r(0),y=r(2),b=function(){return(b=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)},g=function(){function e(e,t,r){var o=this;this._model=e,this._options=r,this._dependencies={};for(var i=function(e){Object.defineProperty(c._dependencies,e,{get:function(){return t[e]},enumerable:!0,configurable:!0})},c=this,u=0,a=Object.keys(t);u<a.length;u++){i(a[u])}this._reducer=function(e,t){return function(r,o){return r=function e(t,r,n){void 0===t&&(t="function"==typeof r.state?r.state(n):r.state);var o=!1;var i={};for(var s=0,c=Object.keys(r.models);s<c.length;s++){var u=c[s],a=r.models[u],l=e(t[u],a,n);t[u]!==l&&(i[u]=l,o=!0)}return o?b({},t,i):t}(r,e,t),h()(r,function(r){var i=o.type.split("/"),s=i[i.length-2],c=i[i.length-1],u=x(r,i.slice(0,i.length-2)),a=x(e,i.slice(0,i.length-1),function(e,t){return e.models[t]});c===n.unregister&&null!=u&&delete u[s];var l=null!=u&&null!=s?u[s]:u,p=null!=a?a.reducers[c]:void 0;if(null!=p){if(null==l)throw new Error("Failed to handle action: state must be initialized");var f=p(l,o.payload,t);if(void 0!==f){if(null==s)return f;u[s]=f}}})}}(e,t),this._actions=j(e,[],null),this._getters=S(e,function(){return o._store.getState()},this._dependencies,[],null);var l=O(e,[],this._actions,this._getters,this._dependencies,{errorHandler:this._options.epicErrorHandler});this._addEpic$=new s.BehaviorSubject(l),this._epic=function(e,t,r){return o._addEpic$.pipe(Object(_.mergeMap)(function(n){return n(e,t,r)}))}}return Object.defineProperty(e.prototype,"reducer",{get:function(){return this._reducer},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"epic",{get:function(){return this._epic},enumerable:!0,configurable:!0}),e.prototype.create=function(e){if(null!=this._store)throw new Error("Store helper is already created");this._store=e;var t=new v(e,this._model,[],this._actions,this._getters,this._addEpic$,this._dependencies,this._options);return this._dependencies.$storeHelper=t,t},e}();function m(e,t,r){return null==r&&(r={}),new g(e,t,r)}var v=function(){function e(e,t,r,n,o,i,s,c){this._subStoreHelpers={},this._store=e,this._model=t,this._namespaces=r,this._actions=n,this._getters=o,this._addEpic$=i,this._dependencies=s,this._options=c;for(var u=0,a=Object.keys(t.models);u<a.length;u++){var l=a[u];this._registerSubStoreHelper(l)}}return Object.defineProperty(e.prototype,"store",{get:function(){return this._store},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"state",{get:function(){return x(this._store.getState(),this._namespaces)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"actions",{get:function(){return this._actions},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"getters",{get:function(){return this._getters},enumerable:!0,configurable:!0}),e.prototype.namespace=function(e){return this._subStoreHelpers[e]},e.prototype.registerModel=function(e,t){var r=this;if(null!=this._model.models[e])throw new Error("Failed to register model: model is already registered");var o=this._namespaces.concat([e]);this._model.models[e]=function(e){return{state:e.state,selectors:b({},e.selectors),reducers:b({},e.reducers),effects:b({},e.effects),epics:e.epics.slice(),models:b({},e.models)}}(t),this._actions[e]=j(t,o,this._actions),this._getters[e]=S(t,function(){return r._store.getState()},this._dependencies,o,this._getters),this._addEpic$.next(O(t,o,this._actions.$root,this._getters.$root,this._dependencies,{errorHandler:this._options.epicErrorHandler})),this._registerSubStoreHelper(e),this._store.dispatch({type:o.join("/")+"/"+n.register})},e.prototype.unregisterModel=function(e){if(null==this._model.models[e])throw new Error("Failed to unregister model: model is not existing");var t=this._namespaces.concat([e]);this._store.dispatch({type:t.join("/")+"/"+n.epicEnd}),this._store.dispatch({type:t.join("/")+"/"+n.unregister}),this._unregisterSubStoreHelper(e),delete this._model.models[e],delete this._actions[e],delete this._getters[e]},e.prototype._registerSubStoreHelper=function(t){var r=this;this._subStoreHelpers[t]=new e(this._store,this._model.models[t],this._namespaces.concat([t]),this._actions[t],this._getters[t],this._addEpic$,this._dependencies,this._options),Object.defineProperty(this,t,{get:function(){return r.namespace(t)},enumerable:!0,configurable:!0})},e.prototype._unregisterSubStoreHelper=function(e){delete this[e],delete this._subStoreHelpers[e]},e}();function j(e,t,r){var n={$namespace:t.join("/"),$parent:r};n.$root=null!=r?r.$root:n;for(var o=0,s=Object.keys(e.reducers).concat(Object.keys(e.effects));o<s.length;o++){n[a=s[o]]=i(t.concat([a]).join("/"))}for(var c=0,u=Object.keys(e.models);c<u.length;c++){var a;n[a=u[c]]=j(e.models[a],t.concat([a]),n)}return n}function O(e,t,r,o,i,c){return function(u,a){var l=t.join("/")+"/"+n.unregister,p=u.pipe(Object(_.filter)(function(e){return e.type===l}));return s.merge.apply(void 0,function e(t,r,n,o,i,s,c){for(var u=[],a=0,l=Object.keys(t.models);a<l.length;a++){var p=l[a],f=e(t.models[p],r.concat([p]),n,o,i,s,c);u.push.apply(u,f)}for(var d=new y.StateObservable(s.pipe(Object(_.map)(function(e){return x(e,r)}),Object(_.distinctUntilChanged)()),x(s.value,r)),h=x(n,r),b=x(o,r),g=function(e){var a,l=_.mergeMap,p=t.effects[e];Array.isArray(p)?(a=p[0],l=p[1]):a=p;var f=i.ofType(r.concat([e]).join("/")),y=f.pipe(l(function(e){var t=e.payload;return a({action$:f,rootAction$:i,state$:d,rootState$:s,actions:h,rootActions:n,getters:b,rootGetters:o,dependencies:c},t)}));u.push(y)},m=0,v=Object.keys(t.effects);m<v.length;m++)g(p=v[m]);for(var j=r.join("/"),O=0,S=t.epics;O<S.length;O++){var $=(0,S[O])({action$:new y.ActionsObservable(i.pipe(Object(_.filter)(function(e){return"string"==typeof e.type&&0===e.type.lastIndexOf(j,0)}))),rootAction$:i,state$:d,rootState$:s,actions:h,rootActions:n,getters:b,rootGetters:o,dependencies:c});u.push($)}return u}(e,t,r,o,u,a,i).map(function(e){return null!=c.errorHandler?e.pipe(Object(_.catchError)(function(e,t){return c.errorHandler(e,t)})):e})).pipe(Object(_.takeUntil)(p))}}function S(e,t,r,n,o){var i={$namespace:n.join("/"),get $state(){return x(t(),n)},get $rootState(){return t()},$parent:o};i.$root=null!=o?o.$root:i;for(var s=function(o){Object.defineProperty(i,o,{get:function(){var s=t(),c=x(s,n);return e.selectors[o]({state:c,rootState:s,getters:i,rootGetters:i.$root,dependencies:r})},enumerable:!0,configurable:!0})},c=0,u=Object.keys(e.selectors);c<u.length;c++){s(p=u[c])}for(var a=0,l=Object.keys(e.models);a<l.length;a++){var p=l[a];i[p]=S(e.models[p],t,r,n.concat([p]),i)}return i}function x(e,t,r){return t.reduce(function(e,t){return null!=e?r?r(e,t):e[t]:void 0},e)}r.d(t,"actionTypes",function(){return n}),r.d(t,"createActionHelper",function(){return i}),r.d(t,"asyncEffect",function(){return c}),r.d(t,"ModelBuilder",function(){return l}),r.d(t,"createModelBuilderCreator",function(){return f}),r.d(t,"StoreHelperFactory",function(){return g}),r.d(t,"createStoreHelperFactory",function(){return m})}])});
//# sourceMappingURL=redux-typescript-helper.js.map