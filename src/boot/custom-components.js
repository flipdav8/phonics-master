import {
  VueDraggable
} from "vue-draggable-plus";

// import BalloonIcon from "src/components/icons/BalloonIcon.vue"
// we globally register our component with Vue
export default ({
  app
}) => {
  app.component('VueDraggable', VueDraggable)

  // app.component('BalloonIcon', BalloonIcon)
}
