define(["dojo/_base/kernel", 
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/on"], 
        function(dojo, lang, declare, array, on){
    //TODO create cross platform animation/transition effects
    var transitionEndEventName = "transitionend";
    var transitionPrefix = "t"; //by default use "t" prefix and "ransition" to make word "transition"
//    if(has("webkit")){
        transitionPrefix = "WebkitT";
        transitionEndEventName = "webkitTransitionEnd";
//    }else if(has("mozilla")){
//        transitionPrefix = "MozT";
//    }
    
    

    //TODO find a way to lock the animation and prevent animation conflict
    declare("dojox.app.animation", null, {
        

        constructor: function(args){
            //default config should be in animation object itself instead of its prototype
            //otherwise, it might be easy for making mistake of modifying prototype
            var defaultConfig = {
                startState: {},
                endState: {},
                node: null,
                duration: 250,
                "in": true,
                direction: 1,
                autoClear: true
            };
            
            lang.mixin(this, defaultConfig);
            lang.mixin(this, args);
        },
        
        play: function(){
            //play the animation using CSS3 Transition
            dojox.app.animation.groupedPlay([this]);
        },
        
        //method to apply the state of the transition
        _applyState: function(state){
            var style = this.node.style;
            for(var property in state){
                if(state.hasOwnProperty(property)){
                    style[property] = state[property];
                }
            }
        },
        
        //method to initialize state for transition
        initState: function(){
            
            //apply the immediate style change for initial state.
            this.node.style[transitionPrefix + "ransitionProperty"] = "none";
            this.node.style[transitionPrefix + "ransitionDuration"] = "0ms";
            this._applyState(this.startState);
            
        },
        
        _beforeStart: function(){
            if (this.node.style.display === "none"){
                this.node.style.display = "";
            }
            this.beforeStart();
        },
        
        _beforeClear: function(){
            this.node.style[transitionPrefix + "ransitionProperty"] = null;
            this.node.style[transitionPrefix + "ransitionDuration"] = null;
            if(this["in"] !== true){
                this.node.style.display = "none";
            }            
            this.beforeClear();
        },
        
        _onAfterEnd: function(){
            this.onAfterEnd();
        },
        
        beforeStart: function(){
            
        },
        
        beforeClear: function(){
            
        },
        
        onAfterEnd: function(){
            
        },
        
        //method to start the transition
        start: function(){
            this._beforeStart();
            
            var self = this;
            //change the transition duration
            self.node.style[transitionPrefix + "ransitionProperty"] = "all";
            self.node.style[transitionPrefix + "ransitionDuration"] = self.duration + "ms";
            
            //connect to clear the transition state after the transition end.
            //Since the transition is conducted asynchronously, we need to 
            //connect to transition end event to clear the state
            on.once(self.node, transitionEndEventName, function(){
                self.clear();
            });
            
            this._applyState(this.endState);
        },
        
        //method to clear state after transition
        clear: function(){
            this._beforeClear();
            this._removeState(this.endState);
            this._onAfterEnd();
        },
        
        //create removeState method
        _removeState: function(state){
            var style = this.node.style;
            for(var property in state){
                if(state.hasOwnProperty(property)){
                    style[property] = null;
                }
            }
        }
        
    });
    
    //TODO add the lock mechanism for all of the transition effects
    //     consider using only one object for one type of transition.
    //TODO create the first animation, slide.
    dojox.app.animation.slide = function(node, config){

        //TODO create the return and set the startState, endState of the return
        var ret = new dojox.app.animation(config);
        ret.node = node;
        
        var startX = "0";
        var endX = "0";
        
        if(ret["in"]){
            if(ret.direction === 1){
                startX = "100%";
            }else{
                startX = "-100%";
            }
        }else{
            if(ret.direction === 1){
                endX = "-100%";
            }else{
                endX = "100%";
            }
        }
        
        
        ret.startState[transitionPrefix + "ransform"]="translateX("+startX+")";
        
        ret.endState[transitionPrefix + "ransform"]="translateX("+endX+")";
        
        return ret;
    };
        
    
    //fade in/out animation effects
    dojox.app.animation.fade = function(node, config){
        
        var ret = new dojox.app.animation(config);
        ret.node = node;
        
        var startOpacity = "0";
        var endOpacity = "0";
        
        if(ret["in"]){
            endOpacity = "1";
        }else{
            startOpacity = "1";
        }
        
        
        ret.startState={
            "opacity": startOpacity
        };
        
        ret.endState={
            "opacity": endOpacity
        };
        
        return ret;
    };
    
  //fade in/out animation effects
    dojox.app.animation.flip = function(node, config){
        
        var ret = new dojox.app.animation(config);
        ret.node = node;
       
        if(ret["in"]){
            //Need to set opacity here because Android 2.2 has bug that
            //scale(...) in transform does not persist status
            lang.mixin({
                startState:{
                    "opacity": "0"
                },
                endState:{
                    "opacity": "1"
                }
            });
            ret.startState[transitionPrefix + "ransform"]="scale(0,0.8) skew(0,-30deg)";
            ret.endState[transitionPrefix + "ransform"]="scale(1,1) skew(0,0)";
        }else{
            lang.mixin({
                startState:{
                    "opacity": "1"
                },
                endState:{
                    "opacity": "0"
                }
            });         
            ret.startState[transitionPrefix + "ransform"]="scale(1,1) skew(0,0)";
            ret.endState[transitionPrefix + "ransform"]="scale(0,0.8) skew(0,30deg)";
        }
        
        return ret;
    };
    
    //TODO groupedPlay should ensure the UI update happens when
    //all animations end.
    //the group player to start multiple animations together
    dojox.app.animation.groupedPlay = function(/*Array*/args){
        //args should be array of dojox.app.animation
        array.forEach(args, function(item){
            //set the start state
            item.initState();
        });
        
        //According to the study of Chrome V8 engine. The minimal timer
        //interval is 2ms. Any browser with minimal timer interval greater
        //than 2ms will raise the timeout interval to that minimal value
        setTimeout(function(){
            array.forEach(args, function(item){
                item.start();
            });            
        }, 2);
    };
    
    //the chain player to start multiple animations together
    dojox.app.animation.chainedPlay = function(/*Array*/args){
        //args should be array of dojox.app.animation
        array.forEach(args, function(item){
            //set the start state
            item.initState();
        });
        
        //TODO chain animations together
        for (var i=1, len=args.length; i < len; i++){
            on.once(args[i-1], "AfterEnd", lang.hitch(args[i], function(){
                this.start();
            }));
        }
        
        //According to the study of Chrome V8 engine. The minimal timer
        //interval is 2ms. Any browser with minimal timer interval greater
        //than 2ms will raise the timeout interval to that minimal value
        setTimeout(function(){
            args[0].start();
        }, 2);
    };
    
    return dojox.app.animation;
});
