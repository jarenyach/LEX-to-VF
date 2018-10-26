({
    doInit : function(component, event, helper) {

        helper.getGiphyVFUrl(component);
        helper.getVfOrigin(component);

        window.addEventListener('message', $A.getCallback(function(event) {

            var vfOrigin = component.get('v.vfOrigin');
            if (event.origin !== vfOrigin) { return; }
            helper.processMessageFromVF(component, event);

        }), false);
    },
    keyCheck: function (component, event, helper) {

        if (event.which == 13) {
            var searchTerms = component.get("v.searchTerms");
            if(searchTerms != ''){
                var message = { command: 'search', searchTerms:searchTerms};
                helper.postMessageToVF(component, message);
            }
        }
    },
    search: function (component, event, helper) {

        var searchTerms = component.get("v.searchTerms");
        if(searchTerms != ''){
            var message = { command: 'search', searchTerms:searchTerms};
            helper.postMessageToVF(component, message);
        }
    },
    maxResultsChange: function (component, event, helper) {
        helper.sendResultLimit(component);
    },
})
