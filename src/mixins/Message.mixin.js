export default function(){
    return {
        data() {
            return {
                'messageQueues': []
            }
        },
        beforeDestroy() {
            while (this.messageQueues.length > 0) {
                let $message = this.messageQueues.pop();
                $message();
            }
        },
        methods: {
            $$onError(e) {
                const unauthorized = e.name === 'BusinessError' && e.code == 401;
                if (unauthorized) this.$$logout({ silent: true });
            },
            $$error(e, duration = 1.5) {
                let $message = this.messageQueues.pop();
                if (['BusinessError'].indexOf(e.name) < 0) {
                    console.error(e);
                }
                if (typeof $message !== 'undefined') $message();
                $message = this.$ivMessage[e.type || 'error']({
                    content: e.message,
                    duration,
                    onClose: () => {
                        this.messageQueues.splice(this.messageQueues.indexOf($message), 1);
                    }
                });
                this.messageQueues.push($message);
                this.$$onError(e);
            },
            $$warning(options) {
                if (typeof options === 'string') options = { content: options };
                options = { duration: 1.5, ...options };
                this.$ivMessage.warning(options);
            },
            $$info(options) {
                if (typeof options === 'string') options = { content: options };
                options = { duration: 1.5, ...options };
                this.$ivMessage.info(options);
            },
            $$success(options) {
                if (typeof options === 'string') options = { content: options };
                options = { duration: 1.5, ...options };
                this.$ivMessage.success(options);
            },
            $$confirm(options) {
                if (typeof options === 'string') options = { content: options };
                options = { title: "询问", ...options };
                return new Promise((resolve, reject) => {
                    try {
                        this.$ivModal.confirm({
                            title: options.title,
                            content: options.content,
                            onOk: () => { resolve(true) },
                            onCancel: () => { resolve(false) }
                        });
                    } catch (e) {
                        reject(e);
                    }
                })
            }
        }
    }
}