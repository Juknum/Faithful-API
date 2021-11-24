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
      return marked(this.markdown)
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