global with sharing class GiphyController {
    public String baseUrl { get; set; }
    public Boolean isLightningOut { get; set; }

    private static final String NAMESPACE = GiphyController.class.getName().substringBefore('GiphyController').removeEnd('.');


    public GiphyController() {

        isLightningOut = false;
        if (ApexPages.currentPage().getParameters().containsKey('isLightningOut')) {
            isLightningOut = ApexPages.currentPage().getParameters().get('isLightningOut') == 'true';
        }
        baseUrl = System.Url.getSalesforceBaseUrl().toString().substringBetween('Url:[delegate=', ']');
    }

    @RemoteAction
    global static String getLightningUrl() {
        //Get lightning domain, returns https://giphydemo-dev-ed.my.salesforce.com
        String lightningDomain = URL.getOrgDomainUrl().toString().substringBetween('[delegate=',']');
        //Remove .my.salesforce.com
        lightningDomain = lightningDomain.substringBefore('.');
        //add .lightning.force.com
        lightningDomain += '.lightning.force.com';
        return lightningDomain;
    }

    @AuraEnabled
    /**
     * This method is for getting the vf Origin for posting messages to VF
     */
    public static String getbaseUrlForVF() {
        try {
            return getVFUrl();
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    @AuraEnabled
    /**
     * This method is for getting the vf page url to iframe in
     */
    public static String giphyVFUrl() {
        try {
            String url = getVFUrl();
            url = url + Page.Giphy.getUrl();
            return url;
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    /**
     * This method will get the vf domain url.
     *
     * @return
     */
    private static String getVFUrl() {
        String url = null;
        User u = [Select Id, Name, SmallPhotoUrl from User where Id =: UserInfo.getUserId()];
        url = u.SmallPhotoUrl;

        //url is https://giphydemo-dev-ed--c.documentforce.com/profilephoto/005/T
        url = url.substringBefore('.com');

        if(url.contains('content.force')){
            url = url.replace('content.force','visual.force.com');
        }else{
            //This is the new url format effective March 16, 2019
            //https://help.salesforce.com/articleView?id=000270912&language=en_US&type=1
            url = url.replace('documentforce','visualforce.com');
        }

        if(isNamespaced()){
            url = url.replace('--c','--' + NAMESPACE.toLowerCase());
        }
        return url;
    }

    private static Boolean isNamespaced() {
        return String.isNotEmpty(NAMESPACE);
    }

}