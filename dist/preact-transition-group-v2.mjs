import t from"dom-helpers/class/addClass";import n from"dom-helpers/class/removeClass";import{Component as i,h as e,cloneElement as r}from"preact";var s="unmounted",u="exited",o="entering",h="entered",c=function(t){function n(n,i){t.call(this,n,i);var e,r=i.transitionGroup,c=r&&!r.isMounting?n.enter:n.appear;this.appearStatus=null,n.in?c?(e=u,this.appearStatus=o):e=h:e=n.unmountOnExit||n.mountOnEnter?s:u,this.state={status:e},this.nextCallback=null}return t&&(n.__proto__=t),(n.prototype=Object.create(t&&t.prototype)).constructor=n,n.prototype.getChildContext=function(){return{transitionGroup:null}},n.getDerivedStateFromProps=function(t,n){return t.in&&n.status===s?{status:u}:null},n.prototype.componentDidMount=function(){this.updateStatus(!0,this.appearStatus)},n.prototype.componentDidUpdate=function(t){var n=null;if(t!==this.props){var i=this.state.status;this.props.in?i!==o&&i!==h&&(n=o):i!==o&&i!==h||(n="exiting")}this.updateStatus(!1,n)},n.prototype.componentWillUnmount=function(){this.cancelNextCallback()},n.prototype.getTimeouts=function(){var t,n,i,e=this.props.timeout;return t=n=i=e,null!=e&&"number"!=typeof e&&(t=e.exit,n=e.enter,i=e.appear),{exit:t,enter:n,appear:i}},n.prototype.updateStatus=function(t,n){if(void 0===t&&(t=!1),null!==n){this.cancelNextCallback();var i=this.base;n===o?this.performEnter(i,t):this.performExit(i)}else this.props.unmountOnExit&&this.state.status===u&&this.setState({status:s})},n.prototype.performEnter=function(t,n){var i=this,e=this.props.enter,r=this.context.transitionGroup?this.context.transitionGroup.isMounting:n,s=this.getTimeouts();n||e?(this.props.onEnter(t,r),this.safeSetState({status:o},function(){i.props.onEntering(t,r),i.onTransitionEnd(t,s.enter,function(){i.safeSetState({status:h},function(){i.props.onEntered(t,r)})})})):this.safeSetState({status:h},function(){i.props.onEntered(t)})},n.prototype.performExit=function(t){var n=this,i=this.props.exit,e=this.getTimeouts();i?(this.props.onExit(t),this.safeSetState({status:"exiting"},function(){n.props.onExiting(t),n.onTransitionEnd(t,e.exit,function(){n.safeSetState({status:u},function(){n.props.onExited(t)})})})):this.safeSetState({status:u},function(){n.props.onExited(t)})},n.prototype.cancelNextCallback=function(){null!==this.nextCallback&&(this.nextCallback.cancel(),this.nextCallback=null)},n.prototype.safeSetState=function(t,n){n=this.setNextCallback(n),this.setState(t,n)},n.prototype.setNextCallback=function(t){var n=this,i=!0;return this.nextCallback=function(e){i&&(i=!1,n.nextCallback=null,t(e))},this.nextCallback.cancel=function(){i=!1},this.nextCallback},n.prototype.onTransitionEnd=function(t,n,i){this.setNextCallback(i),t?(this.props.addEndListener&&this.props.addEndListener(t,this.nextCallback),null!=n&&setTimeout(this.nextCallback,n)):setTimeout(this.nextCallback,0)},n.prototype.render=function(){var t=this.state.status;if(t===s)return null;var n=this.props,i=n.children,e=function(t,n){var i={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&-1===n.indexOf(e)&&(i[e]=t[e]);return i}(n,["children"]);return delete e.in,delete e.mountOnEnter,delete e.unmountOnExit,delete e.appear,delete e.enter,delete e.exit,delete e.timeout,delete e.addEndListener,delete e.onEnter,delete e.onEntering,delete e.onEntered,delete e.onExit,delete e.onExiting,delete e.onExited,"function"==typeof i?i(t,e):r(i[0],e)},n}(i);function f(){}c.defaultProps={in:!1,mountOnEnter:!1,unmountOnExit:!1,appear:!1,enter:!0,exit:!0,onEnter:f,onEntering:f,onEntered:f,onExit:f,onExiting:f,onExited:f},c.UNMOUNTED=0,c.EXITED=1,c.ENTERING=2,c.ENTERED=3,c.EXITING=4;var a=function(n,i){return n&&n.setAttribute&&i&&i.split(" ").forEach(function(i){return t(n,i)})},l=function(t,i){return t&&t.setAttribute&&i&&i.split(" ").forEach(function(i){return n(t,i)})},d=function(t){function n(n,i){t.call(this,n,i),this.onEnter=this.onEnter.bind(this),this.onEntering=this.onEntering.bind(this),this.onEntered=this.onEntered.bind(this),this.onExit=this.onExit.bind(this),this.onExiting=this.onExiting.bind(this),this.onExited=this.onExited.bind(this),this.getClassNames=this.getClassNames.bind(this)}return t&&(n.__proto__=t),(n.prototype=Object.create(t&&t.prototype)).constructor=n,n.prototype.onEnter=function(t,n){var i=this.getClassNames(n?"appear":"enter").className;this.removeClasses(t,"exit"),a(t,i),this.props.onEnter&&this.props.onEnter(t)},n.prototype.onEntering=function(t,n){var i=this.getClassNames(n?"appear":"enter");this.reflowAndAddClass(t,i.activeClassName),this.props.onEntering&&this.props.onEntering(t)},n.prototype.onEntered=function(t,n){var i=this.getClassNames("enter").doneClassName;this.removeClasses(t,n?"appear":"enter"),a(t,i),this.props.onEntered&&this.props.onEntered(t)},n.prototype.onExit=function(t){var n=this.getClassNames("exit").className;this.removeClasses(t,"appear"),this.removeClasses(t,"enter"),a(t,n),this.props.onExit&&this.props.onExit(t)},n.prototype.onExiting=function(t){var n=this.getClassNames("exit");this.reflowAndAddClass(t,n.activeClassName),this.props.onExiting&&this.props.onExiting(t)},n.prototype.onExited=function(t){var n=this.getClassNames("exit").doneClassName;this.removeClasses(t,"exit"),a(t,n),this.props.onExited&&this.props.onExited(t)},n.prototype.getClassNames=function(t){var n=this.props.classNames,i="string"!=typeof n?n[t]:n+"-"+t;return{className:i,activeClassName:"string"!=typeof n?n[t+"Active"]:i+"-active",doneClassName:"string"!=typeof n?n[t+"Done"]:i+"-done"}},n.prototype.removeClasses=function(t,n){var i=this.getClassNames(n),e=i.className,r=i.activeClassName,s=i.doneClassName;e&&l(t,e),r&&l(t,r),s&&l(t,s)},n.prototype.reflowAndAddClass=function(t,n){n&&a(t,n)},n.prototype.render=function(){var t=Object.assign({},this.props);return delete t.classNames,e(c,Object.assign({},t,{onEnter:this.onEnter,onEntered:this.onEntered,onEntering:this.onEntering,onExit:this.onExit,onExiting:this.onExiting,onExited:this.onExited}))},n}(i),v=e("a",null).constructor,p=function(t){return t&&t instanceof v};function x(t,n){var i=Object.create(null);return t&&t.forEach(function(t){t&&(i[t.key]=function(t){return n&&p(t)?n(t):t}(t))}),i}function E(t,n,i){return null!=i[n]?i[n]:t.attributes&&t.attributes[n]}function m(t,n,i){var e=x(t.children),s=function(t,n){function i(i){return i in n?n[i]:t[i]}t=t||{},n=n||{};var e,r=Object.create(null),s=[];for(var u in t)u in n?s.length&&(r[u]=s,s=[]):s.push(u);var o={};for(var h in n){if(r[h])for(e=0;e<r[h].length;e++)o[r[h][e]]=i(r[h][e]);o[h]=i(h)}for(e=0;e<s.length;e++)o[s[e]]=i(s[e]);return o}(n,e);return Object.keys(s).forEach(function(u){var o=s[u];if(p(o)){var h=u in n,c=u in e,f=n[u],a=p(f)&&!f.attributes.in;!c||h&&!a?c||!h||a?c&&h&&p(f)&&(s[u]=r(o,{onExited:i.bind(null,o),in:f.attributes.in,exit:E(o,"exit",t),enter:E(o,"enter",t)})):s[u]=r(o,{in:!1}):s[u]=r(o,{onExited:i.bind(null,o),in:!0,exit:E(o,"exit",t),enter:E(o,"enter",t)})}}),s}var O=Object.values||function(t){return Object.keys(t).map(function(n){return t[n]})},b=function(t){function n(n,i){t.call(this,n,i);var e=this.handleExited.bind(this);this.state={handleExited:e,firstRender:!0}}return t&&(n.__proto__=t),(n.prototype=Object.create(t&&t.prototype)).constructor=n,n.prototype.getChildContext=function(){return{transitionGroup:{isMounting:!this.appeared}}},n.prototype.componentDidMount=function(){this.appeared=!0},n.getDerivedStateFromProps=function(t,n){var i,e,s=n.children,u=n.handleExited;return{children:n.firstRender?(i=t,e=u,x(i.children,function(t){return r(t,{onExited:e.bind(null,t),in:!0,appear:E(t,"appear",i),enter:E(t,"enter",i),exit:E(t,"exit",i)})})):m(t,s,u),firstRender:!1}},n.prototype.handleExited=function(t,n){var i=x(this.props.children);t.key in i||(t.attributes.onExited&&t.attributes.onExited(n),this.setState(function(n){var i=Object.assign({},n.children);return delete i[t.key],{children:i}}))},n.prototype.render=function(){var t=this.props,n=t.component,i=t.childFactory,r=function(t,n){var i={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&-1===n.indexOf(e)&&(i[e]=t[e]);return i}(t,["component","childFactory"]),s=O(this.state.children).map(i);return delete r.appear,delete r.enter,delete r.exit,null===n?s:e(n,r,s)},n}(i);b.defaultProps={component:"div",childFactory:function(t){return t}};var g=function(t){function n(n,i){var e=this;t.call(this,n,i),this.handleEnter=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e.handleLifecycle("onEnter",0,t)},this.handleEntering=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e.handleLifecycle("onEntering",0,t)},this.handleEntered=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e.handleLifecycle("onEntered",0,t)},this.handleExit=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e.handleLifecycle("onExit",1,t)},this.handleExiting=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e.handleLifecycle("onExiting",1,t)},this.handleExited=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return e.handleLifecycle("onExited",1,t)}}return t&&(n.__proto__=t),(n.prototype=Object.create(t&&t.prototype)).constructor=n,n.prototype.handleLifecycle=function(t,n,i){var e,r=this.props.children[n];r.props[t]&&(e=r.props)[t].apply(e,i),this.props[t]&&this.props[t](this.base)},n.prototype.render=function(){var t=this.props,n=t.children,i=t.in,s=function(t,n){var i={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&-1===n.indexOf(e)&&(i[e]=t[e]);return i}(t,["children","in"]),u=n[0],o=n[1];return delete s.onEnter,delete s.onEntering,delete s.onEntered,delete s.onExit,delete s.onExiting,delete s.onExited,e(b,s,i?r(u,{key:"first",onEnter:this.handleEnter,onEntering:this.handleEntering,onEntered:this.handleEntered}):r(o,{key:"second",onEnter:this.handleExit,onEntering:this.handleExiting,onEntered:this.handleExited}))},n}(i);export{c as Transition,b as TransitionGroup,g as ReplaceTransition,d as CSSTransition};
//# sourceMappingURL=preact-transition-group-v2.mjs.map
