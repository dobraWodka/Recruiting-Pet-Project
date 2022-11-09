/**
 * Created by yurii.bubis on 10/26/2022.
 */

public with sharing class PositionsObtainer {
    @future(callout=true)
    public static void obtainPosition() {
       String accessToken = RecruitmentIntegration.returnAccessToken();
        String endpoint = 'https://cunning-unicorn-luyqex-dev-ed.my.salesforce.com/services/apexrest/CompanyData';
        List<Position__c> positions = new List<Position__c>();

        if (accessToken != null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setHeader('Authorization','Bearer ' + accessToken);
            request.setHeader('Content-Type', 'application/json');
            request.setEndpoint(endpoint);
            request.setMethod('GET');

            HttpResponse response = http.send(request);
            System.debug('Positions: ' + response.getBody());

            if (response.getStatus() == 'OK') {
                try {
                    positions = (List<Position__c>)JSON.deserialize(response.getBody(), List<Position__c>.class);
                    System.debug('Accomplished: ' + positions);
                    for (Position__c pos : positions) {
                        pos.Recruitment_Id__c = pos.Id;
                        pos.Id = null;
                        System.debug('Position ' + positions.indexOf(pos) + 'Id is ' + pos.Recruitment_Id__c);
                    }
                    upsert positions Recruitment_Id__c;

                } catch (Exception e) {
                    System.debug('Error occured: ' + e);
                }
            }

        }
    }
}