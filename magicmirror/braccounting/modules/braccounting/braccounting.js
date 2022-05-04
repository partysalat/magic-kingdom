// inspired by https://github.com/ulrichwisser/MMM-HTMLSnippet/blob/master/MMM-HTMLSnippet.js
Module.register("braccounting",{
    defaults: {
      html: "",
    },

    getDom: function() {
      let self = this
      var wrapper = document.createElement("iframe")
      wrapper.id = "HTMLSNIPPET"
      wrapper.className = "htmlsnippet module"
      wrapper.style.width = self.config.width
      wrapper.style.height = self.config.height
      wrapper.style.border = "none"
      wrapper.style.display = "block"
      wrapper.style.overflow = "hidden"
//      wrapper.style.backgroundColor = self.config.backgroundColor
      wrapper.scrolling = "no"
      wrapper.src = self.config.src

      return wrapper
    },

    suspend: function() {
      var doms = document.getElementsByClassName("htmlsnippet")
      if (doms.length > 0) {
        for (let dom of doms) {
          dom.style.display = "none"
        }
      }
    },

    resume: function() {
      var doms = document.getElementsByClassName("htmlsnippet")
      if (doms.length > 0) {
        for (let dom of doms) {
          dom.style.display = "block"
        }
      }
    },

  }
)
