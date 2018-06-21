<template>
  <ul>
    <li v-for="item in items">
      {{ item }}
    </li>
  </ul>
</template>

<script>
import { StatusMixin } from "../../src/";
export default {
  name: 'list',
  props: [
    'items'
  ],
  mixins:[StatusMixin('test')(['test1'])]
}
</script>
