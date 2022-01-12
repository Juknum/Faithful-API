/* global Vue, axios, marked */

const v = new Vue({
  el: '#app',
  template: `
    <template>
      <div v-html="markdownToHTML"></div>
    </template>  
  `,
  data() {
    return {
      markdown: ' '
    }
  },
  computed: {
    markdownToHTML() {
      return marked.parse(this.markdown)
    }
  },
  watch: {
    markdownToHTML: function(newValue) {
      Vue.nextTick(() => {
        const codes = document.querySelectorAll('code')
        codes.forEach(code => {
          let language
          if(code.classList.length > 0) {
            if(code.classList[0].includes('get') || code.classList[0].includes('post') || code.classList[0].includes('patch'))
              language = 'HTTP'
            if(code.classList[0].includes('jsonc'))
              language = 'javascript'
  
            if(language) {
              const hightlighted = hljs.highlight(code.innerText, {
                language: language
              })
              code.parentElement.innerHTML = hightlighted.value
            }
          }
        })
      })
    }
  },
  created() {
    let url = window.location.pathname

    if (url.startsWith('/v')) url = 'versions' + url + '/'

    axios.get(`./${url}README.md`)
      .then(res => {
        this.markdown = res.data
      })
      .catch(err => {
        this.markdown = err
      })
  }
})