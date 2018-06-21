export default function Redirect(redirect = "redirect") {
    return {
        methods: {
            $$back(route) {
                if (this.$route.query[redirect]) {
                    this.$router.push(this.$route.query[redirect]);
                } else if (route) {
                    this.$router.push(route);
                } else {
                    this.$router.back()
                }
            }
        }
    }
}