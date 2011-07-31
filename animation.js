define(["dojo/_base/kernel", 
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/on"], 
        function(dojo, lang, declare, array, on){

    //TODO find a way to lock the animation and prevent animation conflict
    declare("dojox.app.animation", null, {
        startState: {},
        endState: {},
        node: null,
        duration: 250,
        "in": true,
        direction: 1,
        autoClear: true,

        constructor: function(args){
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
            this.node.style["-webkit-transition-property"] = "none";
            this.node.style["-webkit-transition-duration"] = "0ms";
            this._applyState(this.startState);
            
        },
        
        _beforeStart: function(){
            if (this.node.style.display === "none"){
                this.node.style.display = "";
            }
            this.beforeStart();
        },
        
        _beforeClear: function(){
            this.node.style["-webkit-transition-property"] = null;
            this.node.style["-webkit-transition-duration"] = null;
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
            self.node.style["-webkit-transition-property"] = "all";
            self.node.style["-webkit-transition-duration"] = self.duration + "ms";
            
            //connect to clear the transition state after the transition end.
            //Since the transition is conducted asynchronously, we need to 
            //connect to transition end event to clear the state
            on.once(self.node, "webkitTransitionEnd", function(){
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
        
        
        ret.startState={
            "-webkit-transform": "translate3d("+startX+",0,0)"
        };
        
        ret.endState={
            "-webkit-transform": "translate3d("+endX+",0,0)"
        };
        
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
         
            ret.startState={
                "-webkit-transform":"scale(0,0.8) skew(0,-30deg)",
                "z-index": 50,
                "opacity": "0"
            };            
            ret.endState={
                "-webkit-transform":"scale(1,1) skew(0,0)",
                "z-index": 50,
                "opacity": "1"
            };
        }else{
            ret.startState={
                "-webkit-transform":"scale(1,1) skew(0,0)",
                "z-index": 50,
                "opacity": "1"
            };            
            ret.endState={
                "-webkit-transform":"scale(0,0.8) skew(0,30deg)",
                "z-index": 50,
                "opacity": "0"
            };
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
        }, 25);
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
        }, 25);
    };
    
    return dojox.app.animation;
});
