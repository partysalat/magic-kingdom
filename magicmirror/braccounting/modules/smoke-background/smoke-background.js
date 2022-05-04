// inspired by https://github.com/ulrichwisser/MMM-HTMLSnippet/blob/master/MMM-HTMLSnippet.js
Module.register("smoke-background",{
    defaults: {
      html: "",
    },
    getScripts:function(){return ['smoke.js']},
    getDom: function() {
      let self = this
      const canvas = document.createElement("canvas")
      var ctx = canvas.getContext('2d')
      canvas.width = self.config.width
      canvas.height = self.config.height
      var party = window.SmokeMachine(ctx, [0, 128, 0])
      party.setPreDrawCallback(function(dt){
	//		party.addSmoke(innerWidth*3/4, innerHeight-100, .5)
                party.addSmoke(innerWidth/4, innerHeight-100, .5)
		canvas.width = innerWidth
		canvas.height = innerHeight
      })
            setTimeout(()=>{
        party.start()

      })

      return canvas
    },



  }
)
