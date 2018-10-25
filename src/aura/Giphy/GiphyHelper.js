({
    getGiphyVFUrl: function (component) {
        var self = this;
        var action = component.get('c.giphyVFUrl');

        self.handleAction(component, action)
            .then($A.getCallback((res) => {
                var url = res +'?isLightningOut=' + component.get('v.isLightningOut');
                component.set('v.giphyVFUrl', url);
            }))
            .catch($A.getCallback((err) => {
                self.handleError(err);
            }))
    },
    getVfOrigin: function (component) {
        var self = this;
        var action = component.get('c.getbaseUrlForVF');

        self.handleAction(component, action)
            .then($A.getCallback((res) => {
                component.set('v.vfOrigin', res);
            }))
            .catch($A.getCallback((err) => {
                self.handleError(err);
            }))
    },
    postMessageToVF: function (component, message) {
        var vfOrigin = component.get('v.vfOrigin');
        var vfWindow = component.find('vfFrame').getElement().contentWindow;
        vfWindow.postMessage(message, vfOrigin);
    },

    processMessageFromVF: function (component, event) {
        var vfOrigin = component.get('v.vfOrigin');
        if (event.origin !== vfOrigin) { return; }

        var message = event.data;
        var js = JSON.stringify(js);

        switch (message.messageType) {
            case 'apiSucess':
                var msg = 'apiSucess:'+JSON.stringify(message.giphy.data);
                component.set('v.msgReceived',msg);
                component.set('v.results',message.giphy.data);
                break;

            case 'apiFailure':
                var msg = 'apiFailure:'+message.error;
                component.set('v.msgReceived',msg);
                this.handleError(message.error);
                break;
            case 'getResultLimit':
                var msg = 'getResultLimit';
                component.set('v.msgReceived',msg);
                this.sendResultLimit(component);
                break;

            default:
                alert(`Unhandled message: ${message}`);
                break;
        }
    },
    sendResultLimit: function (component) {
        var maxRows = component.get('v.maxResults');
        var message = { command: 'setResultLimit', maxResults:maxRows};
        this.postMessageToVF(component,message);
    },
    // Utility methods
    handleAction: function (component, action) {
        return new Promise((resolve, reject) => {
            action.setCallback(this, (response) => {
                let successful = component.isValid() && response.getState().toLowerCase() === 'success';
                if (successful) {
                    resolve(response.getReturnValue());
                } else {
                    reject(response.getError()[0].message);
                }
            });
            $A.enqueueAction(action);
        });
    },
    handleError: function (err) {
        this.toast('Error', err ,'error', 'sticky');
    },

    toast: function (title, message, type, mode) {
        var toastEvent = $A.get('e.force:showToast');
        toastEvent.setParams({
            message: message || '',
            mode: mode || dismissible,
            title: title || '',
            type: type || 'info'
        });
        toastEvent.fire();
    },
})