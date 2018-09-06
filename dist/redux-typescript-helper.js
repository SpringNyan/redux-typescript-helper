!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("rxjs/operators"),require("rxjs"),require("redux-observable"),require("immer"),require("reselect")):"function"==typeof define&&define.amd?define(["rxjs/operators","rxjs","redux-observable","immer","reselect"],t):"object"==typeof exports?exports["redux-typescript-helper"]=t(require("rxjs/operators"),require("rxjs"),require("redux-observable"),require("immer"),require("reselect")):e["redux-typescript-helper"]=t(e["rxjs/operators"],e.rxjs,e["redux-observable"],e.immer,e.reselect)}(window,function(e,t,r,n,o){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=5)}([function(t,r){t.exports=e},function(e,r){e.exports=t},function(e,t){e.exports=r},function(e,t){e.exports=n},function(e,t){e.exports=o},function(e,t,r){"use strict";r.r(t);var n={register:"@@REGISTER",epicEnd:"@@EPIC_END",unregister:"@@UNREGISTER"};function o(e){return null!=e&&e.type===this.type}function i(e){var t=function(t){return{type:e,payload:t}};return t.type=e,t.is=o,t}function s(e,t,r){var n={$namespace:t.join("/"),$parent:r};n.$root=null!=r?r.$root:n,n.$child=function(e){return n[e]};for(var o=0,u=Object.keys(e.reducers).concat(Object.keys(e.effects));o<u.length;o++){var c=u[o];n[c]=i(t.concat([c]).join("/"))}for(var l=0,a=Object.keys(e.models);l<a.length;l++){c=a[l];n[c]=s(e.models[c],t.concat([c]),n)}return n}var u=r(1),c=r(0),l=r(2);function a(e,t,r){return t.reduce(function(e,t){return null!=e?r?r(e,t):e[t]:void 0},e)}function p(e,t){return e.startsWith?e.startsWith(t):0===e.lastIndexOf(t,0)}function d(e){return new u.Observable(function(t){e(function(e){return t.next(e),e}).then(function(){return t.complete()},function(e){return t.error(e)})})}function f(e,t,r,o){return function(i,s){var d=o.join("/"),f="/"+n.unregister,h=i.pipe(Object(c.filter)(function(e){return"string"==typeof e.type&&function(e,t){if(e.endsWith)return e.endsWith(t);var r=e.length-t.length;return r>=0&&e.lastIndexOf(t,r)===r}(e.type,f)&&p(d,e.type.substring(0,e.type.length-f.length))}));return u.merge.apply(void 0,function e(t,r,n,o,i){var s=[];for(var u=0,d=Object.keys(t.models);u<d.length;u++){var f=d[u],h=t.models[f],_=e(h,r,n,o,i.concat([f]));s.push.apply(s,_)}var y=new l.StateObservable(o.pipe(Object(c.map)(function(e){return a(e,i)}),Object(c.distinctUntilChanged)()),a(o.value,i));var b=function(){return a(r.$storeHelper,i,function(e,t){return e.$child(t)})};var g=function(){return b().actions};var m=function(){return b().getters};var v=function(e){var u,l=c.mergeMap,a=t.effects[e];Array.isArray(a)?(u=a[0],l=a[1]):u=a;var p=n.ofType(i.concat([e]).join("/")),d=p.pipe(l(function(e){var t=e.payload;return u({action$:p,rootAction$:n,state$:y,rootState$:o,get helper(){return b()},get actions(){return g()},get getters(){return m()},dependencies:r},t)}));s.push(d)};for(var j=0,O=Object.keys(t.effects);j<O.length;j++){var f=O[j];v(f)}var $=i.join("/")+"/";for(var x=0,S=t.epics;x<S.length;x++){var E=S[x],w=new l.ActionsObservable(n.pipe(Object(c.filter)(function(e){return"string"==typeof e.type&&p(e.type,$)}))),H=E({action$:w,rootAction$:n,state$:y,rootState$:o,get helper(){return b()},get actions(){return g()},get getters(){return m()},dependencies:r});s.push(H)}return s}(e,t,i,s,o).map(function(e){return null!=r?e.pipe(Object(c.catchError)(r)):e})).pipe(Object(c.takeUntil)(h))}}var h=function(){return(h=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)},_=function(){function e(e){this._model=m(e)}return e.prototype.state=function(e){var t=this._model.state,r=y(e);return this._model.state=function(e){return r(t(e))},this},e.prototype.selectors=function(e){var t=this._model.selectors,r=y(e);return this._model.selectors=function(e){return h({},t(e),r(e))},this},e.prototype.reducers=function(e){return this._model.reducers=h({},this._model.reducers,e),this},e.prototype.effects=function(e){return this._model.effects=h({},this._model.effects,e),this},e.prototype.epics=function(e){return this._model.epics=this._model.epics.concat(e),this},e.prototype.models=function(e){return this._model.models=h({},this._model.models,e),this},e.prototype.dynamicModels=function(){return this},e.prototype.build=function(){return m(this._model)},e.prototype.clone=function(){return new e(this._model)},e}();function y(e){return"function"==typeof e?e:function(){return e}}function b(e){return new _(function(e){return{state:y(e),selectors:function(){return{}},reducers:{},effects:{},epics:[],models:{}}}(e))}function g(){return b}function m(e){return{state:e.state,selectors:e.selectors,reducers:h({},e.reducers),effects:h({},e.effects),epics:e.epics.slice(),models:h({},e.models)}}var v=r(3),j=r.n(v),O=function(){return(O=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function $(e,t){return function(r,o){return r=function e(t,r,n){void 0===t&&(t=r.state(n));var o=!1;var i={};for(var s=0,u=Object.keys(r.models);s<u.length;s++){var c=u[s],l=r.models[c],a=e(t[c],l,n);t[c]!==a&&(i[c]=a,o=!0)}return o?O({},t,i):t}(r,e,t),j()(r,function(r){var i=o.type.split("/"),s=a(r,i.slice(0,i.length-2)),u=a(e,i.slice(0,i.length-1),function(e,t){return e.models[t]}),c=i[i.length-2],l=i[i.length-1];l===n.unregister&&null!=s&&null!=c&&delete s[c];var p=null!=s&&null!=c?s[c]:void 0,d=null!=u?u.reducers[l]:void 0;if(null!=d){if(null==s||null==c)throw new Error("state not found");var f=d(p,o.payload,t);void 0!==f&&(s[c]=f)}})}}var x=r(4);function S(e,t,r,n){var o={get state(){return a(t.$store.getState(),r)},$namespace:r.join("/"),$parent:n};o.$root=null!=n?n.$root:o,o.$child=function(e){return o[e]};for(var i=e.selectors(x.createSelector),s=function(e){Object.defineProperty(o,e,{get:function(){return i[e]({state:o.state,rootState:o.$rootState,getters:o,dependencies:t})},enumerable:!0,configurable:!0})},u=0,c=Object.keys(i);u<c.length;u++){s(d=c[u])}for(var l=0,p=Object.keys(e.models);l<p.length;l++){var d=p[l];o[d]=S(e.models[d],t,r.concat([d]),o)}return o}var E=function(){function e(e,t,r){var n=this;this._model=e,this._options=r,this._dependencies={};for(var o=function(e){Object.defineProperty(i._dependencies,e,{get:function(){return t[e]},enumerable:!0,configurable:!0})},i=this,l=0,a=Object.keys(t);l<a.length;l++){o(a[l])}this._reducer=$(this._model,this._dependencies),this._actions=s(this._model,[],null),this._getters=S(this._model,this._dependencies,[],null);var p=f(e,this._dependencies,this._options.epicErrorHandler||null,[]);this._addEpic$=new u.BehaviorSubject(p),this._epic=function(e,t,r){return n._addEpic$.pipe(Object(c.mergeMap)(function(n){return n(e,t,r)}))},this._storeHelper=new H(this._model,this._dependencies,this._options,this._actions,this._getters,this._addEpic$,[],null)}return Object.defineProperty(e.prototype,"reducer",{get:function(){return this._reducer},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"epic",{get:function(){return this._epic},enumerable:!0,configurable:!0}),e.prototype.create=function(e){if(null!=this._store)throw new Error("store helper is already created");return this._store=e,this._dependencies.$store=this._store,this._dependencies.$storeHelper=this._storeHelper,this._storeHelper},e}();function w(e,t,r){return null==r&&(r={}),new E(e,t,r)}var H=function(){function e(e,t,r,n,o,i,s,u){this._subStoreHelpers={},this._model=e,this._dependencies=t,this._options=r,this._actions=n,this._getters=o,this._addEpic$=i,this._namespaces=s,this.$namespace=s.join("/"),this.$parent=u,this.$root=null!=u?u.$root:this;for(var c=0,l=Object.keys(e.models);c<l.length;c++){var a=l[c];this._registerSubStoreHelper(a)}}return Object.defineProperty(e.prototype,"state",{get:function(){return a(this._store.getState(),this._namespaces)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"actions",{get:function(){return this._actions},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"getters",{get:function(){return this._getters},enumerable:!0,configurable:!0}),e.prototype.$child=function(e){var t=this._subStoreHelpers[e];return null!=t?t:null},e.prototype.$registerModel=function(e,t){if(null!=this._model.models[e])throw new Error("model is already registered");this._model.models[e]=t;var r=this._namespaces.concat([e]);this._actions[e]=s(t,r,this._actions),this._getters[e]=S(t,this._dependencies,r,this._getters),this._registerSubStoreHelper(e),this._addEpic$.next(f(t,this._dependencies,this._options.epicErrorHandler||null,r)),this._store.dispatch({type:r.join("/")+"/"+n.register})},e.prototype.$unregisterModel=function(e){if(null==this._model.models[e])throw new Error("model is already unregistered");var t=this._namespaces.concat([e]);this._store.dispatch({type:t.join("/")+"/"+n.epicEnd}),this._store.dispatch({type:t.join("/")+"/"+n.unregister}),this._unregisterSubStoreHelper(e),delete this._model.models[e],delete this._actions[e],delete this._getters[e]},Object.defineProperty(e.prototype,"_store",{get:function(){return this._dependencies.$store},enumerable:!0,configurable:!0}),e.prototype._registerSubStoreHelper=function(t){var r=this;this._subStoreHelpers[t]=new e(this._model.models[t],this._dependencies,this._options,this._actions[t],this._getters[t],this._addEpic$,this._namespaces.concat([t]),this),Object.defineProperty(this,t,{get:function(){return r.$child(t)},enumerable:!0,configurable:!0})},e.prototype._unregisterSubStoreHelper=function(e){delete this[e],delete this._subStoreHelpers[e]},e}();r.d(t,"actionTypes",function(){return n}),r.d(t,"createActionHelper",function(){return i}),r.d(t,"createModelActionHelpers",function(){return s}),r.d(t,"asyncEffect",function(){return d}),r.d(t,"createModelEpic",function(){return f}),r.d(t,"ModelBuilder",function(){return _}),r.d(t,"createModelBuilderCreator",function(){return g}),r.d(t,"cloneModel",function(){return m}),r.d(t,"createModelReducer",function(){return $}),r.d(t,"createModelGetters",function(){return S}),r.d(t,"StoreHelperFactory",function(){return E}),r.d(t,"createStoreHelperFactory",function(){return w})}])});
//# sourceMappingURL=redux-typescript-helper.js.map